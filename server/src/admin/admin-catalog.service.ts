import { Injectable, NotFoundException } from '@nestjs/common';
import type { LevelCode, SeriesType } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeText } from '../progress/answer-checker';
import {
  CreateSeriesDto,
  ExerciseInputDto,
  UpdateExerciseDto,
  UpdateSeriesDto,
} from './dto/series.dto';

const normalizeAnswer = (answer: string) =>
  answer
    .split('|')
    .map((alternative) => normalizeText(alternative))
    .filter(Boolean)
    .join(' | ');

@Injectable()
export class AdminCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const [users, series, exercises, completions, activeWeek] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.series.count(),
        this.prisma.exercise.count(),
        this.prisma.completedExercise.count(),
        this.prisma.completedExercise
          .groupBy({
            by: ['userId'],
            where: {
              completedAt: { gte: new Date(Date.now() - 7 * 24 * 3600_000) },
            },
          })
          .then((rows) => rows.length),
      ]);
    return { users, series, exercises, completions, activeWeek };
  }

  async listSeries(level?: LevelCode, type?: SeriesType) {
    const rows = await this.prisma.series.findMany({
      where: {
        ...(level && { level: { code: level } }),
        ...(type && { type }),
      },
      orderBy: [{ level: { position: 'asc' } }, { id: 'asc' }],
      include: {
        level: { select: { code: true, title: true } },
        _count: { select: { exercises: true, completions: true } },
      },
    });
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      type: row.type,
      level: row.level,
      exerciseCount: row._count.exercises,
      completions: row._count.completions,
      createdAt: row.createdAt,
    }));
  }

  async seriesWithAnswers(id: number) {
    const row = await this.prisma.series.findUnique({
      where: { id },
      include: {
        level: { select: { code: true, title: true } },
        exercises: { orderBy: { id: 'asc' } },
      },
    });
    if (!row) throw new NotFoundException('Série introuvable');
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      type: row.type,
      level: row.level,
      exercises: row.exercises.map((exercise) => ({
        id: exercise.id,
        question: exercise.question,
        answer: exercise.answer,
        type: exercise.type,
        choices: Array.isArray(exercise.choices)
          ? exercise.choices.map(String)
          : [],
      })),
    };
  }

  async createSeries(dto: CreateSeriesDto) {
    const level = await this.prisma.level.findUnique({
      where: { code: dto.levelCode },
    });
    if (!level) throw new NotFoundException('Niveau inconnu');

    return this.prisma.series.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type ?? 'DEFAULT',
        levelId: level.id,
        exercises: { create: (dto.exercises ?? []).map(toExerciseData) },
      },
      include: { exercises: true },
    });
  }

  async updateSeries(id: number, dto: UpdateSeriesDto) {
    await this.ensureSeries(id);
    const level = dto.levelCode
      ? await this.prisma.level.findUnique({ where: { code: dto.levelCode } })
      : null;
    if (dto.levelCode && !level) throw new NotFoundException('Niveau inconnu');

    return this.prisma.series.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(level && { levelId: level.id }),
      },
    });
  }

  async deleteSeries(id: number) {
    await this.ensureSeries(id);
    await this.prisma.series.delete({ where: { id } });
  }

  async addExercise(seriesId: number, dto: ExerciseInputDto) {
    await this.ensureSeries(seriesId);
    return this.prisma.exercise.create({
      data: { ...toExerciseData(dto), seriesId },
    });
  }

  async updateExercise(id: number, dto: UpdateExerciseDto) {
    const exercise = await this.prisma.exercise.findUnique({ where: { id } });
    if (!exercise) throw new NotFoundException('Exercice introuvable');

    return this.prisma.exercise.update({
      where: { id },
      data: {
        ...(dto.question !== undefined && { question: dto.question }),
        ...(dto.answer !== undefined && {
          answer: normalizeAnswer(dto.answer),
        }),
        ...(dto.choices !== undefined && { choices: dto.choices }),
        ...(dto.type !== undefined && { type: dto.type }),
      },
    });
  }

  async deleteExercise(id: number) {
    const exercise = await this.prisma.exercise.findUnique({ where: { id } });
    if (!exercise) throw new NotFoundException('Exercice introuvable');
    await this.prisma.exercise.delete({ where: { id } });
  }

  private async ensureSeries(id: number) {
    const series = await this.prisma.series.findUnique({ where: { id } });
    if (!series) throw new NotFoundException('Série introuvable');
    return series;
  }
}

const toExerciseData = (dto: ExerciseInputDto) => ({
  question: dto.question,
  answer: normalizeAnswer(dto.answer),
  choices: dto.choices ?? [],
  type: dto.type,
});
