import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DAY = 24 * 60 * 60_000;

export interface Group {
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

  async decorate(groups: Group[], userId: string) {
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
