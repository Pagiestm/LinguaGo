import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewsService } from '../reviews/reviews.service';
import {
  isExactMatch,
  isSpokenMatch,
  isTrueFalseMatch,
} from './answer-checker';

export interface AnswerResult {
  correct: boolean;
  alreadyCompleted: boolean;
  pointsWon: number;
  seriesCompleted: boolean;
  expectedAnswer?: string;
  verifiedBy: 'exact' | 'spoken';
}

const firstAlternative = (answer: string) =>
  answer.split('|')[0]?.trim() ?? answer;

@Injectable()
export class ProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reviews: ReviewsService,
  ) {}

  async answer(
    userId: string,
    exerciseId: number,
    answer: string,
  ): Promise<AnswerResult> {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: { series: { include: { level: true } } },
    });
    if (!exercise) throw new NotFoundException('Exercice introuvable');

    const existing = await this.prisma.completedExercise.findUnique({
      where: { userId_exerciseId: { userId, exerciseId } },
    });

    let verifiedBy: AnswerResult['verifiedBy'] = 'exact';
    let correct: boolean;
    switch (exercise.type) {
      case 'TALK':
        correct = isSpokenMatch(exercise.answer, answer);
        verifiedBy = 'spoken';
        break;
      case 'TRUE_FALSE':
        correct = isTrueFalseMatch(exercise.answer, answer);
        break;
      default:
        correct = isExactMatch(exercise.answer, answer);
    }

    const pointsPerExercise = exercise.series.level.pointsPerExercise;

    if (!correct) {
      await this.prisma.$transaction(async (tx) => {
        if (!existing) {
          await tx.userStats.update({
            where: { userId },
            data: { failedExercises: { increment: 1 } },
          });
        }
        await this.reviews.record(tx, userId, exerciseId, false);
      });
      return {
        correct: false,
        alreadyCompleted: existing !== null,
        pointsWon: 0,
        seriesCompleted: false,
        expectedAnswer: firstAlternative(exercise.answer),
        verifiedBy,
      };
    }

    if (existing) {
      await this.reviews.record(this.prisma, userId, exerciseId, true);
      return {
        correct: true,
        alreadyCompleted: true,
        pointsWon: 0,
        seriesCompleted: false,
        verifiedBy,
      };
    }

    const seriesCompleted = await this.prisma.$transaction(async (tx) => {
      await tx.completedExercise.create({
        data: {
          userId,
          exerciseId,
          seriesId: exercise.seriesId,
          pointsWon: pointsPerExercise,
        },
      });
      await tx.userStats.update({
        where: { userId },
        data: {
          points: { increment: pointsPerExercise },
          successfulExercises: { increment: 1 },
        },
      });
      await this.reviews.record(tx, userId, exerciseId, true);

      const [total, done, alreadyDone] = await Promise.all([
        tx.exercise.count({ where: { seriesId: exercise.seriesId } }),
        tx.completedExercise.count({
          where: { userId, seriesId: exercise.seriesId },
        }),
        tx.completedSeries.findUnique({
          where: { userId_seriesId: { userId, seriesId: exercise.seriesId } },
        }),
      ]);
      if (done < total || alreadyDone) return false;

      await tx.completedSeries.create({
        data: { userId, seriesId: exercise.seriesId },
      });
      await tx.userStats.update({
        where: { userId },
        data: { completedSeries: { increment: 1 } },
      });
      return true;
    });

    return {
      correct: true,
      alreadyCompleted: false,
      pointsWon: pointsPerExercise,
      seriesCompleted,
      verifiedBy,
    };
  }

  async addTimeSpent(
    userId: string,
    seriesId: number,
    seconds: number,
  ): Promise<void> {
    const series = await this.prisma.series.findUnique({
      where: { id: seriesId },
    });
    if (!series) throw new NotFoundException('Série introuvable');
    await this.prisma.userStats.update({
      where: { userId },
      data: { timeSpentSeconds: { increment: seconds } },
    });
  }

  async addFavorite(userId: string, seriesId: number): Promise<void> {
    const series = await this.prisma.series.findUnique({
      where: { id: seriesId },
    });
    if (!series) throw new NotFoundException('Série introuvable');
    await this.prisma.favoriteSeries.upsert({
      where: { userId_seriesId: { userId, seriesId } },
      create: { userId, seriesId },
      update: {},
    });
  }

  async removeFavorite(userId: string, seriesId: number): Promise<void> {
    await this.prisma.favoriteSeries.deleteMany({
      where: { userId, seriesId },
    });
  }
}
