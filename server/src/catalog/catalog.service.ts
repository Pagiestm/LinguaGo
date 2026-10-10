import { Injectable, NotFoundException } from '@nestjs/common';
import type { LevelCode, SeriesType } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { type ExerciseView, toExerciseView } from './exercise-view';
import { computeLevelProgress, LevelSummary } from './level-progress';

export type { ExerciseView } from './exercise-view';

export interface SeriesCard {
  id: number;
  title: string;
  description: string | null;
  type: SeriesType;
  level: { code: LevelCode; title: string; pointsPerExercise: number };
  exerciseCount: number;
  completedCount: number;
  isFavorite: boolean;
  isCompleted: boolean;
}

export interface SeriesDetail extends SeriesCard {
  exercises: ExerciseView[];
}

const seriesForUser = (userId: string) =>
  ({
    include: {
      level: { select: { code: true, title: true, pointsPerExercise: true } },
      _count: { select: { exercises: true } },
      favorites: { where: { userId }, select: { userId: true } },
      completions: { where: { userId }, select: { userId: true } },
      exercises: {
        select: {
          id: true,
          completions: { where: { userId }, select: { userId: true } },
        },
      },
    },
  }) as const;

interface SeriesRow {
  id: number;
  title: string;
  description: string | null;
  type: SeriesType;
  level: { code: LevelCode; title: string; pointsPerExercise: number };
  _count: { exercises: number };
  favorites: unknown[];
  completions: unknown[];
  exercises: { id: number; completions: unknown[] }[];
}

const toCard = (row: SeriesRow): SeriesCard => ({
  id: row.id,
  title: row.title,
  description: row.description,
  type: row.type,
  level: row.level,
  exerciseCount: row._count.exercises,
  completedCount: row.exercises.filter((e) => e.completions.length > 0).length,
  isFavorite: row.favorites.length > 0,
  isCompleted: row.completions.length > 0,
});

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async levelSummaries(): Promise<LevelSummary[]> {
    const levels = await this.prisma.level.findMany({
      orderBy: { position: 'asc' },
    });
    const counts = await this.prisma.series.findMany({
      select: { levelId: true, _count: { select: { exercises: true } } },
    });
    return levels.map((level) => ({
      code: level.code,
      title: level.title,
      position: level.position,
      pointsPerExercise: level.pointsPerExercise,
      exerciseCount: counts
        .filter((s) => s.levelId === level.id)
        .reduce((sum, s) => sum + s._count.exercises, 0),
    }));
  }

  async levelsForUser(userId: string) {
    const [levels, stats, series] = await Promise.all([
      this.prisma.level.findMany({ orderBy: { position: 'asc' } }),
      this.prisma.userStats.findUnique({ where: { userId } }),
      this.prisma.series.findMany({
        select: {
          levelId: true,
          type: true,
          _count: { select: { exercises: true } },
          completions: { where: { userId }, select: { userId: true } },
          exercises: {
            select: {
              completions: { where: { userId }, select: { userId: true } },
            },
          },
        },
      }),
    ]);

    const summaries: LevelSummary[] = levels.map((level) => ({
      code: level.code,
      title: level.title,
      position: level.position,
      pointsPerExercise: level.pointsPerExercise,
      exerciseCount: series
        .filter((s) => s.levelId === level.id)
        .reduce((sum, s) => sum + s._count.exercises, 0),
    }));
    const progress = computeLevelProgress(summaries, stats?.points ?? 0);

    return {
      userLevel: progress,
      levels: levels.map((level) => {
        const own = series.filter((s) => s.levelId === level.id);
        const count = (type: SeriesType) => own.filter((s) => s.type === type);
        const completedExercises = own.reduce(
          (sum, s) =>
            sum + s.exercises.filter((e) => e.completions.length > 0).length,
          0,
        );
        return {
          code: level.code,
          title: level.title,
          description: level.description,
          position: level.position,
          pointsPerExercise: level.pointsPerExercise,
          exerciseCount: own.reduce((sum, s) => sum + s._count.exercises, 0),
          completedExercises,
          series: {
            DEFAULT: {
              total: count('DEFAULT').length,
              completed: count('DEFAULT').filter(
                (s) => s.completions.length > 0,
              ).length,
            },
            TALK: {
              total: count('TALK').length,
              completed: count('TALK').filter((s) => s.completions.length > 0)
                .length,
            },
          },
        };
      }),
    };
  }

  async seriesByLevel(
    userId: string,
    code: LevelCode,
    type: SeriesType,
  ): Promise<SeriesCard[]> {
    const level = await this.prisma.level.findUnique({ where: { code } });
    if (!level) throw new NotFoundException('Niveau inconnu');

    const rows = await this.prisma.series.findMany({
      where: { levelId: level.id, type },
      orderBy: { id: 'asc' },
      ...seriesForUser(userId),
    });
    return rows.map(toCard);
  }

  async seriesDetail(userId: string, seriesId: number): Promise<SeriesDetail> {
    const row = await this.prisma.series.findUnique({
      where: { id: seriesId },
      include: {
        ...seriesForUser(userId).include,
        exercises: {
          orderBy: { id: 'asc' },
          select: {
            id: true,
            type: true,
            question: true,
            answer: true,
            choices: true,
            completions: { where: { userId }, select: { userId: true } },
          },
        },
      },
    });
    if (!row) throw new NotFoundException('Série introuvable');

    return {
      ...toCard(row),
      exercises: row.exercises.map((exercise) =>
        toExerciseView(exercise, exercise.completions.length > 0),
      ),
    };
  }

  async favorites(userId: string): Promise<SeriesDetail[]> {
    const favorites = await this.prisma.favoriteSeries.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { seriesId: true },
    });
    return Promise.all(
      favorites.map((f) => this.seriesDetail(userId, f.seriesId)),
    );
  }
}
