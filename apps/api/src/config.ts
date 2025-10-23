import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000'),
  
  WEB_BASE_URL: z.string().url(),
  WEB_JWT_SECRET: z.string().min(32),
  
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.string().url(),
  
  META_APP_ID: z.string(),
  META_APP_SECRET: z.string(),
  META_APP_VERIFY_TOKEN: z.string(),
  META_REDIRECT_URI: z.string().url(),
  META_GRAPH_VERSION: z.string().default('v21.0'),
  
  WEBHOOK_PUBLIC_URL: z.string().url().optional(),
});

const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ 환경변수 검증 실패:');
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    process.exit(1);
  }
};

export const config = parseEnv();

export const GOOGLE_OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/youtube.readonly',
  'openid',
  'email',
  'profile',
];

export const META_OAUTH_SCOPES = [
  'instagram_basic',
  'instagram_manage_comments',
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_engagement',
  'pages_manage_metadata',
  'business_management',
];
