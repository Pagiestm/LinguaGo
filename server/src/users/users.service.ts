import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PublicUser, toPublicUser, userWithAvatar } from './user.mapper';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      ...userWithAvatar,
    });
    if (!user) throw new NotFoundException('Compte introuvable');
    return toPublicUser(user);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<PublicUser> {
    if (dto.avatarId !== undefined) {
      const avatar = await this.prisma.avatar.findUnique({
        where: { id: dto.avatarId },
      });
      if (!avatar) throw new BadRequestException('Avatar inconnu');
    }
    if (dto.pseudo !== undefined) {
      const taken = await this.prisma.user.findFirst({
        where: {
          pseudo: { equals: dto.pseudo.trim(), mode: 'insensitive' },
          id: { not: userId },
        },
      });
      if (taken) throw new ConflictException('Ce pseudo est déjà pris');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.pseudo !== undefined && { pseudo: dto.pseudo.trim() }),
        ...(dto.avatarId !== undefined && { avatarId: dto.avatarId }),
        ...(dto.dailyGoal !== undefined && { dailyGoal: dto.dailyGoal }),
      },
      ...userWithAvatar,
    });
    return toPublicUser(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Compte introuvable');

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid)
      throw new UnauthorizedException('Mot de passe actuel incorrect');

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: await bcrypt.hash(dto.newPassword, 12) },
    });
  }

  async completeFirstLogin(userId: string): Promise<PublicUser> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { firstLogin: false },
      ...userWithAvatar,
    });
    return toPublicUser(user);
  }

  async exportData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        avatar: true,
        stats: true,
        completedExercises: {
          orderBy: { completedAt: 'asc' },
          include: {
            exercise: {
              select: {
                question: true,
                type: true,
                series: { select: { title: true } },
              },
            },
          },
        },
        completedSeries: {
          include: { series: { select: { title: true } } },
        },
        favorites: { include: { series: { select: { title: true } } } },
        reviews: {
          include: { exercise: { select: { question: true } } },
        },
        achievements: true,
        notification: {
          select: {
            enabled: true,
            frequencyDays: true,
            time: true,
            timeZone: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('Compte introuvable');
    return {
      exportedAt: new Date(),
      profile: {
        pseudo: user.pseudo,
        email: user.email,
        createdAt: user.createdAt,
        dailyGoal: user.dailyGoal,
        leagueTier: user.leagueTier,
        avatarId: user.avatarId,
      },
      stats: user.stats,
      completedExercises: user.completedExercises.map((row) => ({
        series: row.exercise.series.title,
        question: row.exercise.question,
        type: row.exercise.type,
        pointsWon: row.pointsWon,
        completedAt: row.completedAt,
      })),
      completedSeries: user.completedSeries.map((row) => ({
        series: row.series.title,
        completedAt: row.completedAt,
      })),
      favorites: user.favorites.map((row) => ({
        series: row.series.title,
        addedAt: row.createdAt,
      })),
      reviews: user.reviews.map((row) => ({
        question: row.exercise.question,
        dueAt: row.dueAt,
        intervalDays: row.intervalDays,
        lapses: row.lapses,
        successes: row.successes,
      })),
      achievements: user.achievements,
      reminder: user.notification,
    };
  }

  async deleteAccount(userId: string): Promise<void> {
    await this.prisma.user.delete({ where: { id: userId } });
  }
}
