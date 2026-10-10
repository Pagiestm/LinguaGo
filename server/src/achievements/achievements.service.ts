import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { streakFromActivity } from '../stats/streak';

export interface AchievementDefinition {
  code: string;
  title: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    code: 'FIRST_EXERCISE',
    title: 'Premier pas',
    description: 'Un premier exercice réussi',
    icon: 'i-lucide-footprints',
  },
  {
    code: 'FIRST_SERIES',
    title: 'Première série',
    description: 'Une série terminée de bout en bout',
    icon: 'i-lucide-flag',
  },
  {
    code: 'EXERCISES_50',
    title: 'Cinquantaine',
    description: 'Cinquante exercices réussis',
    icon: 'i-lucide-medal',
  },
  {
    code: 'EXERCISES_100',
    title: 'Centurion',
    description: 'Cent exercices réussis',
    icon: 'i-lucide-trophy',
  },
  {
    code: 'STREAK_3',
    title: 'Trois jours',
    description: 'Objectif quotidien atteint trois jours d’affilée',
    icon: 'i-lucide-flame',
  },
  {
    code: 'STREAK_7',
    title: 'Une semaine',
    description: 'Objectif quotidien atteint sept jours d’affilée',
    icon: 'i-lucide-calendar-check',
  },
  {
    code: 'STREAK_30',
    title: 'Un mois',
    description: 'Objectif quotidien atteint trente jours d’affilée',
    icon: 'i-lucide-crown',
  },
  {
    code: 'LEVEL_COMPLETED',
    title: 'Niveau bouclé',
    description: 'Tous les exercices d’un niveau réussis',
    icon: 'i-lucide-graduation-cap',
  },
  {
    code: 'FAVORITES_5',
    title: 'Collectionneur',
    description: 'Cinq séries gardées en favoris',
    icon: 'i-lucide-heart',
  },
  {
    code: 'REVIEWS_20',
    title: 'Mémoire d’éléphant',
    description: 'Vingt révisions réussies',
    icon: 'i-lucide-brain',
  },
  {
    code: 'TALK_10',
    title: 'Bavard',
    description: 'Dix exercices de prononciation réussis',
    icon: 'i-lucide-mic',
  },
];

export interface AchievementView extends AchievementDefinition {
  unlocked: boolean;
  unlockedAt: Date | null;
  isNew: boolean;
}

@Injectable()
export class AchievementsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, timeZone: string): Promise<AchievementView[]> {
    const [user, stats, activity, levels, favorites, reviews, talks, known] =
      await Promise.all([
        this.prisma.user.findUnique({
          where: { id: userId },
          select: { dailyGoal: true },
        }),
        this.prisma.userStats.findUnique({ where: { userId } }),
        this.prisma.completedExercise.findMany({
          where: { userId },
          select: { completedAt: true, pointsWon: true, exerciseId: true },
        }),
        this.prisma.level.findMany({
          select: {
            id: true,
            series: {
              select: { exercises: { select: { id: true } } },
            },
          },
        }),
        this.prisma.favoriteSeries.count({ where: { userId } }),
        this.prisma.review.aggregate({
          where: { userId },
          _sum: { successes: true },
        }),
        this.prisma.completedExercise.count({
          where: { userId, exercise: { type: 'TALK' } },
        }),
        this.prisma.userAchievement.findMany({ where: { userId } }),
      ]);

    const streak = streakFromActivity(
      activity,
      user?.dailyGoal ?? 5,
      new Date(),
      timeZone,
    );
    const done = new Set(activity.map((row) => row.exerciseId));
    const levelCompleted = levels.some((level) => {
      const ids = level.series.flatMap((s) => s.exercises.map((e) => e.id));
      return ids.length > 0 && ids.every((id) => done.has(id));
    });
    const successful = stats?.successfulExercises ?? 0;

    const unlocked = new Set<string>();
    if (successful >= 1) unlocked.add('FIRST_EXERCISE');
    if ((stats?.completedSeries ?? 0) >= 1) unlocked.add('FIRST_SERIES');
    if (successful >= 50) unlocked.add('EXERCISES_50');
    if (successful >= 100) unlocked.add('EXERCISES_100');
    if (streak.best >= 3) unlocked.add('STREAK_3');
    if (streak.best >= 7) unlocked.add('STREAK_7');
    if (streak.best >= 30) unlocked.add('STREAK_30');
    if (levelCompleted) unlocked.add('LEVEL_COMPLETED');
    if (favorites >= 5) unlocked.add('FAVORITES_5');
    if ((reviews._sum.successes ?? 0) >= 20) unlocked.add('REVIEWS_20');
    if (talks >= 10) unlocked.add('TALK_10');

    const knownCodes = new Map(known.map((k) => [k.code, k.unlockedAt]));
    const fresh = [...unlocked].filter((code) => !knownCodes.has(code));
    if (fresh.length > 0) {
      await this.prisma.userAchievement.createMany({
        data: fresh.map((code) => ({ userId, code })),
        skipDuplicates: true,
      });
    }
    const now = new Date();

    return ACHIEVEMENTS.map((definition) => ({
      ...definition,
      unlocked: unlocked.has(definition.code),
      unlockedAt:
        knownCodes.get(definition.code) ??
        (unlocked.has(definition.code) ? now : null),
      isNew: fresh.includes(definition.code),
    }));
  }
}
