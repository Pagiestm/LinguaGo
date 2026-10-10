import { Injectable } from '@nestjs/common';
import { CatalogService, type SeriesDetail } from '../catalog/catalog.service';
import { toExerciseView } from '../catalog/exercise-view';
import type { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const INTERVALS = [1, 3, 7, 14, 30, 60];
const DAY = 24 * 60 * 60_000;

export const nextInterval = (current: number) =>
  INTERVALS.find((days) => days > current) ?? INTERVALS[INTERVALS.length - 1];

export interface ReviewSummary {
  due: number;
  total: number;
  nextDueAt: Date | null;
}

type Tx = Prisma.TransactionClient | PrismaService;

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly catalog: CatalogService,
  ) {}

  async record(
    tx: Tx,
    userId: string,
    exerciseId: number,
    correct: boolean,
  ): Promise<void> {
    const existing = await tx.review.findUnique({
      where: { userId_exerciseId: { userId, exerciseId } },
    });
    const now = Date.now();
    if (!correct) {
      await tx.review.upsert({
        where: { userId_exerciseId: { userId, exerciseId } },
        create: {
          userId,
          exerciseId,
          dueAt: new Date(now + DAY),
          intervalDays: 1,
          lapses: 1,
          lastResult: false,
        },
        update: {
          dueAt: new Date(now + DAY),
          intervalDays: 1,
          lapses: { increment: 1 },
          lastResult: false,
        },
      });
      return;
    }
    if (!existing) return;
    const interval = nextInterval(existing.intervalDays);
    await tx.review.update({
      where: { userId_exerciseId: { userId, exerciseId } },
      data: {
        dueAt: new Date(now + interval * DAY),
        intervalDays: interval,
        successes: { increment: 1 },
        lastResult: true,
      },
    });
  }

  async summary(userId: string): Promise<ReviewSummary> {
    const now = new Date();
    const [due, total, next] = await Promise.all([
      this.prisma.review.count({ where: { userId, dueAt: { lte: now } } }),
      this.prisma.review.count({ where: { userId } }),
      this.prisma.review.findFirst({
        where: { userId, dueAt: { gt: now } },
        orderBy: { dueAt: 'asc' },
        select: { dueAt: true },
      }),
    ]);
    return { due, total, nextDueAt: next?.dueAt ?? null };
  }

  async session(userId: string, limit = 10): Promise<SeriesDetail> {
    const due = await this.prisma.review.findMany({
      where: { userId, dueAt: { lte: new Date() } },
      orderBy: { dueAt: 'asc' },
      take: limit,
      include: { exercise: true },
    });
    return this.virtualSeries(
      userId,
      'À revoir',
      'Les exercices ratés reviennent ici à intervalles croissants, jusqu’à être acquis.',
      due.map((review) => review.exercise),
    );
  }

  async daily(userId: string, limit = 8): Promise<SeriesDetail> {
    const due = await this.prisma.review.findMany({
      where: { userId, dueAt: { lte: new Date() } },
      orderBy: { dueAt: 'asc' },
      take: limit,
      include: { exercise: true },
    });
    const picked = due.map((review) => review.exercise);
    if (picked.length < limit) {
      const level = await this.currentLevel(userId);
      const candidates = await this.prisma.exercise.findMany({
        where: {
          series: { levelId: level.id, type: 'DEFAULT' },
          completions: { none: { userId } },
          id: { notIn: picked.map((e) => e.id) },
        },
        take: 40,
      });
      for (const exercise of shuffle(candidates).slice(
        0,
        limit - picked.length,
      )) {
        picked.push(exercise);
      }
    }
    return this.virtualSeries(
      userId,
      'Cinq minutes',
      'Vos révisions du jour, complétées par de nouveaux exercices de votre niveau.',
      picked,
    );
  }

  private async currentLevel(userId: string) {
    const levels = await this.prisma.level.findMany({
      orderBy: { position: 'asc' },
    });
    const progress = await this.catalog.levelsForUser(userId);
    return (
      levels.find((l) => l.code === progress.userLevel.current.code) ??
      levels[0]
    );
  }

  private async virtualSeries(
    userId: string,
    title: string,
    description: string,
    exercises: {
      id: number;
      type: SeriesDetail['exercises'][number]['type'];
      question: string;
      answer: string;
      choices: unknown;
    }[],
  ): Promise<SeriesDetail> {
    const [level, done] = await Promise.all([
      this.currentLevel(userId),
      this.prisma.completedExercise.findMany({
        where: { userId, exerciseId: { in: exercises.map((e) => e.id) } },
        select: { exerciseId: true },
      }),
    ]);
    const completed = new Set(done.map((d) => d.exerciseId));
    return {
      id: 0,
      title,
      description,
      type: 'DEFAULT',
      level: {
        code: level.code,
        title: level.title,
        pointsPerExercise: level.pointsPerExercise,
      },
      exerciseCount: exercises.length,
      completedCount: 0,
      isFavorite: false,
      isCompleted: false,
      exercises: exercises.map((exercise) =>
        toExerciseView(exercise, completed.has(exercise.id)),
      ),
    };
  }
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
