import { Injectable } from '@nestjs/common';
import { CatalogService } from '../catalog/catalog.service';
import { computeLevelProgress } from '../catalog/level-progress';
import type { LevelCode } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { LEAGUES } from './leaderboard.service';
import { dateKey, safeTimeZone, streakFromActivity } from './streak';

const DAY = 24 * 60 * 60_000;

@Injectable()
export class StatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly catalog: CatalogService,
  ) {}

  async overview(userId: string, timeZone = 'Europe/Paris') {
    const [user, stats, levels, favoritesCount, activity] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { dailyGoal: true, leagueTier: true },
      }),
      this.prisma.userStats.findUnique({ where: { userId } }),
      this.catalog.levelSummaries(),
      this.prisma.favoriteSeries.count({ where: { userId } }),
      this.prisma.completedExercise.findMany({
        where: { userId },
        select: { completedAt: true, pointsWon: true },
      }),
    ]);
    const points = stats?.points ?? 0;
    const goal = user?.dailyGoal ?? 5;
    const { todayPoints, ...streak } = streakFromActivity(
      activity,
      goal,
      new Date(),
      timeZone,
    );
    return {
      points,
      successfulExercises: stats?.successfulExercises ?? 0,
      failedExercises: stats?.failedExercises ?? 0,
      completedSeries: stats?.completedSeries ?? 0,
      timeSpentSeconds: stats?.timeSpentSeconds ?? 0,
      favoritesCount,
      level: computeLevelProgress(levels, points),
      streak,
      today: { points: todayPoints, goal },
      league:
        LEAGUES.find((l) => l.tier === (user?.leagueTier ?? 1)) ?? LEAGUES[0],
    };
  }

  async activity(userId: string, days: number, timeZone: string) {
    const tz = safeTimeZone(timeZone);
    const since = new Date(Date.now() - (days - 1) * DAY);
    since.setUTCHours(0, 0, 0, 0);
    since.setTime(since.getTime() - DAY);

    const rows = await this.prisma.completedExercise.findMany({
      where: { userId, completedAt: { gte: since } },
      select: { completedAt: true, pointsWon: true },
    });

    const buckets = new Map<string, { exercises: number; points: number }>();
    for (let i = days - 1; i >= 0; i--) {
      buckets.set(dateKey(new Date(Date.now() - i * DAY), tz), {
        exercises: 0,
        points: 0,
      });
    }
    for (const row of rows) {
      const bucket = buckets.get(dateKey(row.completedAt, tz));
      if (!bucket) continue;
      bucket.exercises += 1;
      bucket.points += row.pointsWon;
    }
    return [...buckets.entries()].map(([date, value]) => ({ date, ...value }));
  }

  async completedSeriesByLevel(userId: string) {
    const [levels, completions] = await Promise.all([
      this.prisma.level.findMany({
        orderBy: { position: 'asc' },
        select: { code: true, title: true },
      }),
      this.prisma.completedSeries.findMany({
        where: { userId },
        select: { series: { select: { level: { select: { code: true } } } } },
      }),
    ]);
    const counts = new Map<LevelCode, number>();
    for (const completion of completions) {
      const code = completion.series.level.code;
      counts.set(code, (counts.get(code) ?? 0) + 1);
    }
    return levels.map((level) => ({
      ...level,
      count: counts.get(level.code) ?? 0,
    }));
  }
}
