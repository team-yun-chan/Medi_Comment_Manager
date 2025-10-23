import express from 'express';
import cors from 'cors';
import { config } from './config';

// Routes
import authRouter from './routes/auth';
import youtubeRouter from './routes/youtube';
import instagramRouter from './routes/instagram';
import webhooksRouter from './routes/webhooks';
import moderationRouter from './routes/moderation';

const app = express();

// ===== Middleware =====
app.use(cors({
  origin: config.WEB_BASE_URL,
  credentials: true,
}));

// Webhook은 raw body 필요 (Meta 검증용)
app.use('/webhooks', express.json({ verify: (req, res, buf) => {
  (req as any).rawBody = buf;
}}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ===== Health Check =====
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'Social Comment SaaS API',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      youtube: '/youtube',
      instagram: '/instagram',
      moderation: '/moderation',
      webhooks: '/webhooks',
    },
  });
});

// ===== Routes =====
app.use('/auth', authRouter);
app.use('/youtube', youtubeRouter);
app.use('/instagram', instagramRouter);
app.use('/moderation', moderationRouter);
app.use('/webhooks', webhooksRouter);

// ===== Error Handler =====
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(config.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ===== 404 Handler =====
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ===== Start Server =====
const PORT = parseInt(config.PORT, 10);

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║   🚀 Social Comment SaaS API Server      ║
╠═══════════════════════════════════════════╣
║   Environment: ${config.NODE_ENV.padEnd(28)}║
║   Port:        ${PORT.toString().padEnd(28)}║
║   API URL:     http://localhost:${PORT.toString().padEnd(18)}║
╚═══════════════════════════════════════════╝

📍 Endpoints:
   - Health:       GET  /health
   - Auth:         POST /auth/google/login
                   GET  /auth/google/callback
                   POST /auth/meta/login
                   GET  /auth/meta/callback
   - YouTube:      GET  /youtube/channels
                   GET  /youtube/comments
   - Instagram:    GET  /instagram/pages
                   GET  /instagram/comments
   - Moderation:   GET  /moderation/rules
                   POST /moderation/rules
   - Webhooks:     GET  /webhooks/meta (verify)
                   POST /webhooks/meta (events)

🔗 Web App: ${config.WEB_BASE_URL}
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

export default app;
