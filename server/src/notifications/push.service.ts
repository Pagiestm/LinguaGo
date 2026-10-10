import { Injectable, Logger } from '@nestjs/common';
import webpush, { type PushSubscription, type WebPushError } from 'web-push';
import { env } from '../config/env';

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  actions?: { action: string; title: string }[];
  tag?: string;
}

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  readonly configured: boolean;

  constructor() {
    this.configured = Boolean(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY);
    if (this.configured) {
      webpush.setVapidDetails(
        env.VAPID_SUBJECT,
        env.VAPID_PUBLIC_KEY!,
        env.VAPID_PRIVATE_KEY!,
      );
    } else {
      this.logger.warn('Clés VAPID absentes : notifications push désactivées');
    }
  }

  get publicKey(): string | null {
    return env.VAPID_PUBLIC_KEY ?? null;
  }

  async send(
    subscription: PushSubscription,
    payload: PushPayload,
  ): Promise<'sent' | 'gone' | 'failed'> {
    if (!this.configured) return 'failed';
    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload), {
        TTL: 3600,
      });
      return 'sent';
    } catch (error) {
      const status = (error as WebPushError).statusCode;
      if (status === 404 || status === 410) return 'gone';
      this.logger.warn(`Envoi push échoué (${status ?? 'réseau'})`);
      return 'failed';
    }
  }
}
