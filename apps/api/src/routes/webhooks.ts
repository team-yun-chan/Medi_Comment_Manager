import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { config } from '../config';
import { WebhookEvent } from '../types';
import { queueWebhookEvent } from '../queues';

const router = Router();

/**
 * Webhook Verification (GET)
 * Meta가 webhook URL 검증할 때 호출
 */
router.get('/meta', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('Webhook verification request:', { mode, token });

  if (mode === 'subscribe' && token === config.META_APP_VERIFY_TOKEN) {
    console.log('✅ Webhook verified');
    return res.status(200).send(challenge);
  }

  console.log('❌ Webhook verification failed');
  return res.sendStatus(403);
});

/**
 * Webhook Event Receiver (POST)
 * 댓글/멘션 이벤트 수신
 */
router.post('/meta', async (req: Request, res: Response) => {
  try {
    const body = req.body as WebhookEvent;

    console.log('📨 Webhook received:', JSON.stringify(body, null, 2));

    // 일단 200 응답 먼저 보내기 (5초 안에 응답해야 함)
    res.sendStatus(200);

    // Webhook 로그 저장
    await prisma.webhookLog.create({
      data: {
        platform: 'meta',
        event: body.object,
        payload: body as any,
        status: 'queued',
      },
    });

    // Worker 큐로 전달
    await queueWebhookEvent({
      platform: 'meta',
      event: body,
      receivedAt: new Date(),
    });

    console.log('✅ Webhook event queued for processing');
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.sendStatus(200); // 에러여도 200 응답
  }
});

export default router;
