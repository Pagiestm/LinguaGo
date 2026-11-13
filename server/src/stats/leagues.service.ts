import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { localDate, zonedDate } from '../notifications/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { LeaderboardService } from './leaderboard.service';
import {
  LEAGUE_TIME_ZONE,
  LEAGUES,
  PROMOTE,
  RELEGATE,
} from './leagues.constants';

const DAY = 24 * 60 * 60_000;

export interface LeaguePlayer {
  id: string;
  tier: number;
  points: number;
}

@Injectable()
export class LeaguesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly leaderboard: LeaderboardService,
  ) {}

  async board(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { leagueTier: true },
    });
    const tier = user?.leagueTier ?? 1;
    const now = new Date();
    const members = await this.prisma.user.findMany({
      where: { leagueTier: tier },
      select: { id: true },
    });
    const groups = await this.prisma.completedExercise.groupBy({
      by: ['userId'],
      where: {
        completedAt: { gte: this.weekStart(now) },
        userId: { in: members.map((m) => m.id) },
      },
      _sum: { pointsWon: true },
      orderBy: { _sum: { pointsWon: 'desc' } },
      take: 20,
    });
    const entries = await this.leaderboard.decorate(groups, userId);
    if (!entries.some((entry) => entry.isMe)) {
      const me = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          pseudo: true,
          avatar: { select: { id: true, svg: true } },
        },
      });
      entries.push({
        rank: entries.length + 1,
        pseudo: me?.pseudo ?? 'Vous',
        avatar: me?.avatar ?? null,
        points: 0,
        isMe: true,
      });
    }
    return {
      tier,
      name: LEAGUES.find((l) => l.tier === tier)?.name ?? 'Bronze',
      top: tier === LEAGUES.length,
      promote: tier === LEAGUES.length ? 0 : PROMOTE,
      relegate: this.relegates(tier, members.length),
      members: members.length,
      resetsAt: this.weekStart(now, 1),
      entries,
    };
  }

  async rotate(
    now = new Date(),
  ): Promise<{ promoted: number; relegated: number } | null> {
    const week = this.weekStart(now);
    const since = this.weekStart(now, -1);
    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.leagueRotation.create({ data: { week } });
        const users = await tx.user.findMany({
          select: { id: true, leagueTier: true },
        });
        const groups = await tx.completedExercise.groupBy({
          by: ['userId'],
          where: { completedAt: { gte: since, lt: week } },
          _sum: { pointsWon: true },
        });
        const scores = new Map(
          groups.map((g) => [g.userId, g._sum.pointsWon ?? 0]),
        );
        const tiers = new Map(users.map((u) => [u.id, u.leagueTier]));
        const moves = this.planRotation(
          users.map((u) => ({
            id: u.id,
            tier: u.leagueTier,
            points: scores.get(u.id) ?? 0,
          })),
        );

        for (const { tier } of LEAGUES) {
          const ids = [...moves]
            .filter(([, to]) => to === tier)
            .map(([id]) => id);
          if (ids.length === 0) continue;
          await tx.user.updateMany({
            where: { id: { in: ids } },
            data: { leagueTier: tier },
          });
        }
        const promoted = [...moves].filter(
          ([id, to]) => to > tiers.get(id)!,
        ).length;
        const relegated = moves.size - promoted;
        await tx.leagueRotation.update({
          where: { week },
          data: { promoted, relegated },
        });
        return { promoted, relegated };
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      )
        return null;
      throw error;
    }
  }

  planRotation(players: LeaguePlayer[]): Map<string, number> {
    const moves = new Map<string, number>();
    for (const { tier } of LEAGUES) {
      const ranked = players
        .filter((p) => p.tier === tier)
        .sort((a, b) => b.points - a.points);
      if (tier < LEAGUES.length) {
        for (const p of ranked.filter((r) => r.points > 0).slice(0, PROMOTE))
          moves.set(p.id, tier + 1);
      }
      const down = this.relegates(tier, ranked.length);
      if (down > 0) {
        for (const p of ranked.slice(-down)) moves.set(p.id, tier - 1);
      }
    }
    return moves;
  }

  relegates(tier: number, members: number): number {
    return tier > 1 && members > PROMOTE + RELEGATE ? RELEGATE : 0;
  }

  weekStart(date: Date, offset = 0): Date {
    const { year, month, day } = localDate(date, LEAGUE_TIME_ZONE);
    const local = Date.UTC(year, month - 1, day);
    const sinceMonday = (new Date(local).getUTCDay() + 6) % 7;
    const monday = new Date(local + (offset * 7 - sinceMonday) * DAY);
    return zonedDate(
      monday.getUTCFullYear(),
      monday.getUTCMonth() + 1,
      monday.getUTCDate(),
      0,
      0,
      LEAGUE_TIME_ZONE,
    );
  }
}
