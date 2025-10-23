import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

export interface MetaTokens {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export interface YoutubeComment {
  id: string;
  videoId: string;
  text: string;
  authorDisplayName: string;
  authorChannelId?: string;
  likeCount: number;
  publishedAt: string;
  updatedAt: string;
  parentId?: string;
}

export interface InstagramComment {
  id: string;
  text: string;
  username: string;
  timestamp: string;
  like_count: number;
  hidden?: boolean;
  replies?: {
    data: InstagramComment[];
  };
}

export interface ModerationRule {
  id: string;
  name: string;
  platform: 'youtube' | 'instagram' | 'all';
  type: 'keyword' | 'regex' | 'user' | 'spam';
  pattern: string;
  action: 'hide' | 'delete' | 'reply';
  enabled: boolean;
}

export interface WebhookEvent {
  object: string;
  entry: Array<{
    id: string;
    time: number;
    changes?: Array<{
      field: string;
      value: any;
    }>;
  }>;
}
