import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { PushSubscription } from 'web-push';
import type { Notification } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { streakFromActivity } from '../stats/streak';
import {
  SnoozeNotificationDto,
  UpdateNotificationDto,
  UpsertNotificationDto,
} from './dto/notification.dto';
import { PushService, type PushPayload } from './push.service';
import { isValidTimeZone, nextAfterSending, nextOccurrence } from './schedule';

const REMINDER_ACTIONS = [
  { action: 'start', title: 'Commencer' },
  { action: 'snooze', title: 'Dans 1 h' },
];

export interface NotificationSettings {
  enabled: boolean;
  frequencyDays: number;
  time: string;
  timeZone: string;
  nextNotifyAt: Date;
  endpoint: string;
}

const toSettings = (n: Notification): NotificationSettings => ({
  enabled: n.enabled,
  frequencyDays: n.frequencyDays,
  time: n.time,
  timeZone: n.timeZone,
  nextNotifyAt: n.nextNotifyAt,
  endpoint: (n.subscription as unknown as PushSubscription).endpoint,
});

const plural = (n: number) => (n > 1 ? 's' : '');

// Le minuteur est réarmé au moins une fois par jour, et une base injoignable est
// réinterrogée au bout de cinq minutes.
const MAX_DELAY_MS = 24 * 60 * 60_000;
const RETRY_DELAY_MS = 5 * 60_000;

@Injectable()
export class NotificationsService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(NotificationsService.name);
  private timer?: NodeJS.Timeout;
  private sending = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly push: PushService,
  ) {}

  async onApplicationBootstrap() {
    await this.scheduleNextReminder();
  }

  onModuleDestroy() {
    clearTimeout(this.timer);
  }

  async get(userId: string): Promise<NotificationSettings | null> {
    const notification = await this.prisma.notification.findUnique({
      where: { userId },
    });
    return notification ? toSettings(notification) : null;
  }

  async upsert(
    userId: string,
    dto: UpsertNotificationDto,
  ): Promise<NotificationSettings> {
    this.ensureConfigured();
    const existing = await this.prisma.notification.findUnique({
      where: { userId },
    });
    const enabled = dto.enabled ?? existing?.enabled ?? true;
    const frequencyDays = dto.frequencyDays ?? existing?.frequencyDays ?? 1;
    const time = dto.time ?? existing?.time ?? '17:00';
    const timeZone = this.timeZone(dto.timeZone ?? existing?.timeZone);
    const nextNotifyAt = nextOccurrence(
      new Date(),
      time,
      timeZone,
      frequencyDays,
    );
    const subscription = JSON.parse(JSON.stringify(dto.subscription)) as object;

    const saved = await this.prisma.notification.upsert({
      where: { userId },
      create: {
        userId,
        subscription,
        enabled,
        frequencyDays,
        time,
        timeZone,
        nextNotifyAt,
      },
      update: {
        subscription,
        enabled,
        frequencyDays,
        time,
        timeZone,
        nextNotifyAt,
      },
    });
    await this.scheduleNextReminder();
    return toSettings(saved);
  }

  async update(
    userId: string,
    dto: UpdateNotificationDto,
  ): Promise<NotificationSettings> {
    const existing = await this.prisma.notification.findUnique({
      where: { userId },
    });
    if (!existing)
      throw new NotFoundException('Aucune notification configurée');

    const frequencyDays = dto.frequencyDays ?? existing.frequencyDays;
    const time = dto.time ?? existing.time;
    const timeZone = this.timeZone(dto.timeZone ?? existing.timeZone);
    const saved = await this.prisma.notification.update({
      where: { userId },
      data: {
        enabled: dto.enabled ?? existing.enabled,
        frequencyDays,
        time,
        timeZone,
        nextNotifyAt: nextOccurrence(new Date(), time, timeZone, frequencyDays),
      },
    });
    await this.scheduleNextReminder();
    return toSettings(saved);
  }

  async snooze(
    userId: string,
    dto: SnoozeNotificationDto,
  ): Promise<NotificationSettings> {
    const existing = await this.prisma.notification.findUnique({
      where: { userId },
    });
    if (!existing)
      throw new NotFoundException('Aucune notification configurée');
    const minutes = dto.minutes ?? 60;
    const saved = await this.prisma.notification.update({
      where: { userId },
      data: { nextNotifyAt: new Date(Date.now() + minutes * 60_000) },
    });
    await this.scheduleNextReminder();
    return toSettings(saved);
  }

  async remove(userId: string): Promise<void> {
    await this.prisma.notification.deleteMany({ where: { userId } });
    await this.scheduleNextReminder();
  }

  async sendTest(userId: string): Promise<void> {
    this.ensureConfigured();
    const notification = await this.prisma.notification.findUnique({
      where: { userId },
    });
    if (!notification)
      throw new NotFoundException('Aucune notification configurée');

    const result = await this.push.send(
      notification.subscription as unknown as PushSubscription,
      {
        title: 'LinguaGo est prêt',
        body: 'Les rappels fonctionnent sur cet appareil.',
        url: '/dashboard',
        actions: REMINDER_ACTIONS,
        tag: 'linguago-test',
      },
    );
    if (result === 'gone') {
      await this.prisma.notification.delete({ where: { userId } });
      throw new BadRequestException(
        'Cet abonnement push a expiré, réactivez les notifications',
      );
    }
    if (result === 'failed')
      throw new ServiceUnavailableException(
        "La notification n'a pas pu partir",
      );
  }

  async reminderFor(userId: string, timeZone: string): Promise<PushPayload> {
    const [rows, user] = await Promise.all([
      this.prisma.completedExercise.findMany({
        where: { userId },
        select: { completedAt: true, pointsWon: true },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { dailyGoal: true },
      }),
    ]);
    const streak = streakFromActivity(
      rows,
      user?.dailyGoal ?? 5,
      new Date(),
      timeZone,
    );
    const days = `${streak.current} jour${plural(streak.current)} d'affilée`;
    const base = {
      url: '/dashboard/learn',
      actions: REMINDER_ACTIONS,
      tag: 'linguago-reminder',
    };
    if (streak.doneToday) {
      return {
        ...base,
        title: `${days}, et l'exercice du jour est fait`,
        body: 'Bravo. Une série de plus pour prendre de l’avance ?',
      };
    }
    if (streak.current > 0) {
      return {
        ...base,
        title: `${days} : ne cassez pas la série`,
        body: 'Un seul exercice aujourd’hui suffit à la garder vivante.',
      };
    }
    return {
      ...base,
      title: "C'est l'heure de pratiquer",
      body: 'Quelques minutes d’anglais aujourd’hui ? Vos séries vous attendent sur LinguaGo.',
    };
  }

  /**
   * Arme un minuteur sur le prochain rappel dû plutôt que d'interroger la base chaque
   * minute : entre deux rappels, la base Neon peut se mettre en veille. Appelée au
   * démarrage, après chaque envoi et à chaque modification d'un rappel ; ne lève jamais.
   */
  async scheduleNextReminder(): Promise<void> {
    if (!this.push.configured || this.sending) return;
    let delay: number | null;
    try {
      const next = await this.prisma.notification.findFirst({
        where: { enabled: true },
        orderBy: { nextNotifyAt: 'asc' },
        select: { nextNotifyAt: true },
      });
      delay = next
        ? Math.min(
            Math.max(next.nextNotifyAt.getTime() - Date.now(), 0),
            MAX_DELAY_MS,
          )
        : null;
    } catch (error) {
      this.logger.warn(`Prochain rappel introuvable : ${String(error)}`);
      delay = RETRY_DELAY_MS;
    }
    clearTimeout(this.timer);
    this.timer =
      delay === null
        ? undefined
        : setTimeout(() => void this.sendAndReschedule(), delay);
  }

  private async sendAndReschedule(): Promise<void> {
    this.sending = true;
    try {
      await this.sendDueReminders();
    } catch (error) {
      this.logger.error(`Envoi des rappels interrompu : ${String(error)}`);
    } finally {
      this.sending = false;
    }
    await this.scheduleNextReminder();
  }

  async sendDueReminders(): Promise<number> {
    if (!this.push.configured) return 0;
    const now = new Date();
    const due = await this.prisma.notification.findMany({
      where: { enabled: true, nextNotifyAt: { lte: now } },
      take: 200,
    });

    let sent = 0;
    for (const notification of due) {
      const result = await this.push.send(
        notification.subscription as unknown as PushSubscription,
        await this.reminderFor(notification.userId, notification.timeZone),
      );
      if (result === 'gone') {
        await this.prisma.notification.delete({
          where: { userId: notification.userId },
        });
        continue;
      }
      if (result === 'sent') sent += 1;
      await this.prisma.notification.update({
        where: { userId: notification.userId },
        data: {
          nextNotifyAt: nextAfterSending(
            notification.nextNotifyAt,
            now,
            notification.time,
            notification.timeZone,
            notification.frequencyDays,
          ),
        },
      });
    }
    if (due.length > 0)
      this.logger.log(`Rappels envoyés : ${sent}/${due.length}`);
    return sent;
  }

  private ensureConfigured() {
    if (!this.push.configured) {
      throw new ServiceUnavailableException(
        'Les notifications ne sont pas configurées sur ce serveur',
      );
    }
  }

  private timeZone(candidate: string | undefined): string {
    const timeZone = candidate ?? 'Europe/Paris';
    if (!isValidTimeZone(timeZone))
      throw new BadRequestException('Fuseau horaire inconnu');
    return timeZone;
  }
}
