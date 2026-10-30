import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';
import { PushService } from './push.service';

process.env.JWT_SECRET ??=
  'secret-de-test-suffisamment-long-pour-passer-la-validation';
process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/test';

const MINUTE = 60_000;

interface Row {
  userId: string;
  enabled: boolean;
  nextNotifyAt: Date;
  time: string;
  timeZone: string;
  frequencyDays: number;
  subscription: object;
}

function setup(rows: Row[]) {
  const nextDue = () =>
    rows
      .filter((r) => r.enabled)
      .sort((a, b) => a.nextNotifyAt.getTime() - b.nextNotifyAt.getTime())[0];
  const prisma = {
    notification: {
      findFirst: jest.fn(async () => nextDue() ?? null),
      findMany: jest.fn(
        async ({ where }: { where: { nextNotifyAt: { lte: Date } } }) =>
          rows.filter(
            (r) => r.enabled && r.nextNotifyAt <= where.nextNotifyAt.lte,
          ),
      ),
      findUnique: jest.fn(
        async ({ where }: { where: { userId: string } }) =>
          rows.find((r) => r.userId === where.userId) ?? null,
      ),
      update: jest.fn(
        async ({
          where,
          data,
        }: {
          where: { userId: string };
          data: Partial<Row>;
        }) =>
          Object.assign(
            rows.find((r) => r.userId === where.userId)!,
            data,
          ),
      ),
      delete: jest.fn(),
    },
    completedExercise: { findMany: jest.fn(async () => []) },
    user: { findUnique: jest.fn(async () => ({ dailyGoal: 5 })) },
  };
  const push = { configured: true, send: jest.fn(async () => 'sent' as const) };
  const service = new NotificationsService(
    prisma as unknown as PrismaService,
    push as unknown as PushService,
  );
  return { service, prisma, push };
}

const row = (userId: string, inMinutes: number): Row => ({
  userId,
  enabled: true,
  nextNotifyAt: new Date(Date.now() + inMinutes * MINUTE),
  time: '17:00',
  timeZone: 'Europe/Paris',
  frequencyDays: 1,
  subscription: { endpoint: `https://push.example/${userId}` },
});

describe('NotificationsService : planification des rappels', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-10-30T12:00:00Z') });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("n'interroge la base qu'à l'échéance du prochain rappel", async () => {
    const { service, prisma, push } = setup([row('a', 90)]);
    await service.onApplicationBootstrap();

    await jest.advanceTimersByTimeAsync(89 * MINUTE);
    expect(prisma.notification.findMany).not.toHaveBeenCalled();
    expect(push.send).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(MINUTE);
    expect(push.send).toHaveBeenCalledTimes(1);
    expect(prisma.notification.findFirst).toHaveBeenCalledTimes(2);
    service.onModuleDestroy();
  });

  it('avance le minuteur quand un rappel est reporté plus tôt', async () => {
    const { service, push } = setup([row('a', 120)]);
    await service.onApplicationBootstrap();

    await service.snooze('a', { minutes: 10 });
    await jest.advanceTimersByTimeAsync(10 * MINUTE);
    expect(push.send).toHaveBeenCalledTimes(1);
    service.onModuleDestroy();
  });

  it("n'arme rien sans rappel actif", async () => {
    const { service } = setup([{ ...row('a', 5), enabled: false }]);
    await service.onApplicationBootstrap();
    expect(jest.getTimerCount()).toBe(0);
  });

  it('réessaie plus tard quand la base est injoignable', async () => {
    const { service, prisma } = setup([row('a', 60)]);
    prisma.notification.findFirst.mockRejectedValueOnce(new Error('P1001'));
    await service.onApplicationBootstrap();

    await jest.advanceTimersByTimeAsync(5 * MINUTE);
    expect(prisma.notification.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.notification.findFirst).toHaveBeenCalledTimes(2);
    service.onModuleDestroy();
  });
});
