import { google } from 'googleapis';
import axios from 'axios';
import { config, GOOGLE_OAUTH_SCOPES } from '../config';
import { GoogleTokens, YoutubeComment } from '../types';

const oauth2Client = new google.auth.OAuth2(
  config.GOOGLE_CLIENT_ID,
  config.GOOGLE_CLIENT_SECRET,
  config.GOOGLE_REDIRECT_URI
);

export class GoogleService {
  /**
   * OAuth 로그인 URL 생성
   */
  static getAuthUrl(): string {
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: GOOGLE_OAUTH_SCOPES,
      prompt: 'consent', // 매번 refresh_token 받기 위해
    });
  }

  /**
   * Authorization Code로 토큰 교환
   */
  static async exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.access_token) {
      throw new Error('Failed to get access token');
    }

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expiry_date 
        ? Math.floor((tokens.expiry_date - Date.now()) / 1000) 
        : 3600,
      scope: tokens.scope || GOOGLE_OAUTH_SCOPES.join(' '),
      token_type: tokens.token_type || 'Bearer',
    };
  }

  /**
   * Refresh Token으로 새 Access Token 발급
   */
  static async refreshAccessToken(refreshToken: string): Promise<string> {
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    if (!credentials.access_token) {
      throw new Error('Failed to refresh access token');
    }

    return credentials.access_token;
  }

  /**
   * 사용자 정보 가져오기
   */
  static async getUserInfo(accessToken: string) {
    const response = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.data;
  }

  /**
   * 내 YouTube 채널 정보
   */
  static async getMyChannels(accessToken: string) {
    oauth2Client.setCredentials({ access_token: accessToken });
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    const response = await youtube.channels.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      mine: true,
    });

    return response.data.items || [];
  }

  /**
   * 특정 비디오의 댓글 목록 (최대 100개)
   */
  static async getVideoComments(
    accessToken: string,
    videoId: string,
    pageToken?: string
  ) {
    oauth2Client.setCredentials({ access_token: accessToken });
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    const response = await youtube.commentThreads.list({
      part: ['snippet', 'replies'],
      videoId,
      maxResults: 100,
      pageToken: pageToken || undefined,
      order: 'time', // 최신순
    });

    const comments: YoutubeComment[] = [];

    response.data.items?.forEach((thread) => {
      const topComment = thread.snippet?.topLevelComment;
      if (topComment) {
        comments.push({
          id: topComment.id!,
          videoId,
          text: topComment.snippet?.textDisplay || '',
          authorDisplayName: topComment.snippet?.authorDisplayName || 'Unknown',
          authorChannelId: topComment.snippet?.authorChannelId?.value,
          likeCount: topComment.snippet?.likeCount || 0,
          publishedAt: topComment.snippet?.publishedAt || new Date().toISOString(),
          updatedAt: topComment.snippet?.updatedAt || new Date().toISOString(),
        });

        // 답글도 추가
        thread.replies?.comments?.forEach((reply) => {
          comments.push({
            id: reply.id!,
            videoId,
            text: reply.snippet?.textDisplay || '',
            authorDisplayName: reply.snippet?.authorDisplayName || 'Unknown',
            authorChannelId: reply.snippet?.authorChannelId?.value,
            likeCount: reply.snippet?.likeCount || 0,
            publishedAt: reply.snippet?.publishedAt || new Date().toISOString(),
            updatedAt: reply.snippet?.updatedAt || new Date().toISOString(),
            parentId: topComment.id,
          });
        });
      }
    });

    return {
      comments,
      nextPageToken: response.data.nextPageToken,
    };
  }

  /**
   * 댓글 삭제 (youtube.force-ssl 스코프 필요)
   */
  static async deleteComment(accessToken: string, commentId: string) {
    oauth2Client.setCredentials({ access_token: accessToken });
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    await youtube.comments.delete({ id: commentId });
    return { success: true };
  }

  /**
   * 댓글에 답글 달기
   */
  static async replyToComment(
    accessToken: string,
    parentId: string,
    text: string
  ) {
    oauth2Client.setCredentials({ access_token: accessToken });
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    const response = await youtube.comments.insert({
      part: ['snippet'],
      requestBody: {
        snippet: {
          parentId,
          textOriginal: text,
        },
      },
    });

    return response.data;
  }

  /**
   * 댓글 숨김/보류 처리
   */
  static async setModerationStatus(
    accessToken: string,
    commentId: string,
    status: 'heldForReview' | 'published' | 'rejected'
  ) {
    oauth2Client.setCredentials({ access_token: accessToken });
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    await youtube.comments.setModerationStatus({
      id: [commentId],
      moderationStatus: status,
    });

    return { success: true };
  }

  /**
   * 채널의 최근 비디오 목록
   */
  static async getChannelVideos(
    accessToken: string,
    channelId: string,
    maxResults: number = 50
  ) {
    oauth2Client.setCredentials({ access_token: accessToken });
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    const response = await youtube.search.list({
      part: ['snippet'],
      channelId,
      maxResults,
      order: 'date',
      type: ['video'],
    });

    return response.data.items || [];
  }
}
