import axios from 'axios';
import { config, META_OAUTH_SCOPES } from '../config';
import { MetaTokens, InstagramComment } from '../types';

const GRAPH_BASE = 'https://graph.facebook.com';
const GRAPH_VERSION = config.META_GRAPH_VERSION;

export class MetaService {
  /**
   * OAuth 로그인 URL 생성
   */
  static getAuthUrl(state?: string): string {
    const scopes = META_OAUTH_SCOPES.join(',');
    const params = new URLSearchParams({
      client_id: config.META_APP_ID,
      redirect_uri: config.META_REDIRECT_URI,
      scope: scopes,
      response_type: 'code',
      state: state || '',
    });

    return `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth?${params}`;
  }

  /**
   * Authorization Code로 Short-Lived Token 교환
   */
  static async exchangeCodeForToken(code: string): Promise<MetaTokens> {
    const url = `${GRAPH_BASE}/${GRAPH_VERSION}/oauth/access_token`;
    const response = await axios.get(url, {
      params: {
        client_id: config.META_APP_ID,
        client_secret: config.META_APP_SECRET,
        redirect_uri: config.META_REDIRECT_URI,
        code,
      },
    });

    return response.data;
  }

  /**
   * Short-Lived Token을 Long-Lived Token으로 교환 (60일)
   */
  static async exchangeForLongLivedToken(
    shortToken: string
  ): Promise<MetaTokens> {
    const url = `${GRAPH_BASE}/${GRAPH_VERSION}/oauth/access_token`;
    const response = await axios.get(url, {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: config.META_APP_ID,
        client_secret: config.META_APP_SECRET,
        fb_exchange_token: shortToken,
      },
    });

    return response.data;
  }

  /**
   * 사용자 정보 가져오기
   */
  static async getUserInfo(accessToken: string) {
    const url = `${GRAPH_BASE}/${GRAPH_VERSION}/me`;
    const response = await axios.get(url, {
      params: {
        fields: 'id,name,email',
        access_token: accessToken,
      },
    });

    return response.data;
  }

  /**
   * 사용자의 페이지 목록
   */
  static async getUserPages(accessToken: string) {
    const url = `${GRAPH_BASE}/${GRAPH_VERSION}/me/accounts`;
    const response = await axios.get(url, {
      params: {
        fields: 'id,name,access_token,instagram_business_account',
        access_token: accessToken,
      },
    });

    return response.data.data || [];
  }

  /**
   * 페이지의 Instagram 비즈니스 계정 정보
   */
  static async getInstagramAccount(pageAccessToken: string, igId: string) {
    const url = `${GRAPH_BASE}/${GRAPH_VERSION}/${igId}`;
    const response = await axios.get(url, {
      params: {
        fields: 'id,username,name,profile_picture_url',
        access_token: pageAccessToken,
      },
    });

    return response.data;
  }

  /**
   * Instagram 미디어 목록 (최근 게시물)
   */
  static async getInstagramMedia(
    pageAccessToken: string,
    igId: string,
    limit: number = 50
  ) {
    const url = `${GRAPH_BASE}/${GRAPH_VERSION}/${igId}/media`;
    const response = await axios.get(url, {
      params: {
        fields: 'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count',
        limit,
        access_token: pageAccessToken,
      },
    });

    return response.data.data || [];
  }

  /**
   * 특정 미디어의 댓글 목록
   */
  static async getMediaComments(
    pageAccessToken: string,
    mediaId: string
  ): Promise<InstagramComment[]> {
    const url = `${GRAPH_BASE}/${GRAPH_VERSION}/${mediaId}/comments`;
    const response = await axios.get(url, {
      params: {
        fields: 'id,text,username,timestamp,like_count,hidden,replies{id,text,username,timestamp}',
        access_token: pageAccessToken,
      },
    });

    return response.data.data || [];
  }

  /**
   * 댓글 숨김 처리
   */
  static async hideComment(pageAccessToken: string, commentId: string) {
    const url = `${GRAPH_BASE}/${GRAPH_VERSION}/${commentId}`;
    const response = await axios.post(
      url,
      {},
      {
        params: {
          hide: true,
          access_token: pageAccessToken,
        },
      }
    );

    return response.data;
  }

  /**
   * 댓글 숨김 해제
   */
  static async unhideComment(pageAccessToken: string, commentId: string) {
    const url = `${GRAPH_BASE}/${GRAPH_VERSION}/${commentId}`;
    const response = await axios.post(
      url,
      {},
      {
        params: {
          hide: false,
          access_token: pageAccessToken,
        },
      }
    );

    return response.data;
  }

  /**
   * 댓글 삭제
   */
  static async deleteComment(pageAccessToken: string, commentId: string) {
    const url = `${GRAPH_BASE}/${GRAPH_VERSION}/${commentId}`;
    const response = await axios.delete(url, {
      params: {
        access_token: pageAccessToken,
      },
    });

    return response.data;
  }

  /**
   * 댓글에 답글 달기
   */
  static async replyToComment(
    pageAccessToken: string,
    commentId: string,
    message: string
  ) {
    const url = `${GRAPH_BASE}/${GRAPH_VERSION}/${commentId}/replies`;
    const response = await axios.post(
      url,
      {},
      {
        params: {
          message,
          access_token: pageAccessToken,
        },
      }
    );

    return response.data;
  }

  /**
   * Webhook 구독 (페이지 단위)
   */
  static async subscribePageWebhook(
    pageAccessToken: string,
    pageId: string,
    fields: string[] = ['comments', 'mentions']
  ) {
    const url = `${GRAPH_BASE}/${GRAPH_VERSION}/${pageId}/subscribed_apps`;
    const response = await axios.post(
      url,
      {},
      {
        params: {
          subscribed_fields: fields.join(','),
          access_token: pageAccessToken,
        },
      }
    );

    return response.data;
  }

  /**
   * Webhook 구독 해제
   */
  static async unsubscribePageWebhook(
    pageAccessToken: string,
    pageId: string
  ) {
    const url = `${GRAPH_BASE}/${GRAPH_VERSION}/${pageId}/subscribed_apps`;
    const response = await axios.delete(url, {
      params: {
        access_token: pageAccessToken,
      },
    });

    return response.data;
  }

  /**
   * Webhook 구독 상태 확인
   */
  static async getWebhookSubscriptions(
    pageAccessToken: string,
    pageId: string
  ) {
    const url = `${GRAPH_BASE}/${GRAPH_VERSION}/${pageId}/subscribed_apps`;
    const response = await axios.get(url, {
      params: {
        access_token: pageAccessToken,
      },
    });

    return response.data.data || [];
  }
}
