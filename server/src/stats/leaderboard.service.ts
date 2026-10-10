import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DAY = 24 * 60 * 60_000;

export const LEAGUES = [
  { tier: 1, name: 'Bronze' },
  { tier: 2, name: 'Argent' },
  { tier: 3, name: 'Or' },
  { tier: 4, name: 'Diamant' },
];
const PROMOTE = 3;
const RELEGATE = 3;

interface Group {
  userId: string;
  _sum: { pointsWon: number | null };
}

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async weekly(userId: string) {
    const groups = await this.prisma.completedExercise.groupBy({
      by: ['userId'],
      where: { completedAt: { gte: new Date(Date.now() - 7 * DAY) } },
      _sum: { pointsWon: true },
      orderBy: { _sum: { pointsWon: 'desc' } },
      take: 10,
    });
    return this.decorate(groups, userId);
  }

  async league(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { leagueTier: true },
    });
    const tier = user?.leagueTier ?? 1;
    const members = await this.prisma.user.findMany({
      where: { leagueTier: tier },
      select: { id: true },
    });
    const groups = await this.prisma.completedExercise.groupBy({
      by: ['userId'],
      where: {
        completedAt: { gte: new Date(Date.now() - 7 * DAY) },
        userId: { in: members.map((m) => m.id) },
      },
      _sum: { pointsWon: true },
      orderBy: { _sum: { pointsWon: 'desc' } },
      take: 20,
    });
    const entries = await this.decorate(groups, userId);
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
    const nextMonday = new Date();
    nextMonday.setUTCHours(0, 0, 0, 0);
    nextMonday.setUTCDate(
      nextMonday.getUTCDate() + ((8 - nextMonday.getUTCDay()) % 7 || 7),
    );
    return {
      tier,
      name: LEAGUES.find((l) => l.tier === tier)?.name ?? 'Bronze',
      top: tier === LEAGUES.length,
      promote: tier === LEAGUES.length ? 0 : PROMOTE,
      relegate: tier === 1 ? 0 : RELEGATE,
      members: members.length,
      resetsAt: nextMonday,
      entries,
    };
  }

  async rotateLeagues(): Promise<{ promoted: number; relegated: number }> {
    const since = new Date(Date.now() - 7 * DAY);
    let promoted = 0;
    let relegated = 0;
    for (const league of LEAGUES) {
      const members = await this.prisma.user.findMany({
        where: { leagueTier: league.tier },
        select: { id: true },
      });
      if (members.length < 2) continue;
      const groups = await this.prisma.completedExercise.groupBy({
        by: ['userId'],
        where: {
          completedAt: { gte: since },
          userId: { in: members.map((m) => m.id) },
        },
        _sum: { pointsWon: true },
      });
      const scores = new Map(
        groups.map((g) => [g.userId, g._sum.pointsWon ?? 0]),
      );
      const ranked = members
        .map((m) => ({ id: m.id, points: scores.get(m.id) ?? 0 }))
        .sort((a, b) => b.points - a.points);
      const up =
        league.tier < LEAGUES.length
          ? ranked.filter((r) => r.points > 0).slice(0, PROMOTE)
          : [];
      const down =
        league.tier > 1 && ranked.length > PROMOTE + RELEGATE
          ? ranked.slice(-RELEGATE)
          : [];
      if (up.length > 0) {
        await this.prisma.user.updateMany({
          where: { id: { in: up.map((r) => r.id) } },
          data: { leagueTier: league.tier + 1 },
        });
        promoted += up.length;
      }
      if (down.length > 0) {
        await this.prisma.user.updateMany({
          where: { id: { in: down.map((r) => r.id) } },
          data: { leagueTier: league.tier - 1 },
        });
        relegated += down.length;
      }
    }
    return { promoted, relegated };
  }

  private async decorate(groups: Group[], userId: string) {
    const users = await this.prisma.user.findMany({
      where: { id: { in: groups.map((g) => g.userId) } },
      select: {
        id: true,
        pseudo: true,
        avatar: { select: { id: true, svg: true } },
      },
    });
    return groups.map((group, index) => {
      const user = users.find((u) => u.id === group.userId);
      return {
        rank: index + 1,
        pseudo: user?.pseudo ?? 'Utilisateur',
        avatar: user?.avatar ?? null,
        points: group._sum.pointsWon ?? 0,
        isMe: group.userId === userId,
      };
    });
  }
}
