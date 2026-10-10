import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewsService } from '../reviews/reviews.service';
import { ProgressService } from './progress.service';

type Mock = jest.Mock;

function fakePrisma() {
  const prisma = {
    exercise: { findUnique: jest.fn(), count: jest.fn() },
    completedExercise: {
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    completedSeries: { findUnique: jest.fn(), create: jest.fn() },
    userStats: { update: jest.fn() },
    series: { findUnique: jest.fn() },
    favoriteSeries: { upsert: jest.fn(), deleteMany: jest.fn() },
    $transaction: jest.fn(),
  };
  prisma.$transaction.mockImplementation(
    (fn: (tx: typeof prisma) => Promise<unknown>) => fn(prisma),
  );
  return prisma;
}

const exercise = (
  overrides: Partial<{ type: string; answer: string; question: string }> = {},
) => ({
  id: 7,
  seriesId: 3,
  type: 'MULTIPLE_CHOICE',
  question: 'How do you say « Bonjour » ?',
  answer: 'hello',
  choices: ['Hello', 'Goodbye'],
  series: { id: 3, level: { pointsPerExercise: 2 } },
  ...overrides,
});

describe('ProgressService.answer', () => {
  let prisma: ReturnType<typeof fakePrisma>;
  let reviews: { record: Mock };
  let service: ProgressService;

  beforeEach(() => {
    prisma = fakePrisma();
    reviews = { record: jest.fn().mockResolvedValue(undefined) };
    service = new ProgressService(
      prisma as unknown as PrismaService,
      reviews as unknown as ReviewsService,
    );
  });

  it('lève une erreur 404 pour un exercice inconnu', async () => {
    prisma.exercise.findUnique.mockResolvedValue(null);
    await expect(service.answer('u1', 99, 'x')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('compte un échec, programme une révision et renvoie la réponse attendue', async () => {
    prisma.exercise.findUnique.mockResolvedValue(exercise());
    prisma.completedExercise.findUnique.mockResolvedValue(null);

    const result = await service.answer('u1', 7, 'goodbye');

    expect(result).toMatchObject({
      correct: false,
      pointsWon: 0,
      expectedAnswer: 'hello',
    });
    expect(prisma.userStats.update).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      data: { failedExercises: { increment: 1 } },
    });
    expect(reviews.record).toHaveBeenCalledWith(prisma, 'u1', 7, false);
  });

  it('attribue les points et termine la série quand tous les exercices sont faits', async () => {
    prisma.exercise.findUnique.mockResolvedValue(exercise());
    prisma.completedExercise.findUnique.mockResolvedValue(null);
    prisma.exercise.count.mockResolvedValue(2);
    prisma.completedExercise.count.mockResolvedValue(2);
    prisma.completedSeries.findUnique.mockResolvedValue(null);

    const result = await service.answer('u1', 7, 'Hello!');

    expect(result).toMatchObject({
      correct: true,
      pointsWon: 2,
      seriesCompleted: true,
    });
    expect(prisma.completedExercise.create).toHaveBeenCalledWith({
      data: { userId: 'u1', exerciseId: 7, seriesId: 3, pointsWon: 2 },
    });
    expect(prisma.completedSeries.create).toHaveBeenCalled();
    expect(reviews.record).toHaveBeenCalledWith(prisma, 'u1', 7, true);
    expect(prisma.userStats.update).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      data: { completedSeries: { increment: 1 } },
    });
  });

  it('ne recompte pas un exercice déjà réussi', async () => {
    prisma.exercise.findUnique.mockResolvedValue(exercise());
    prisma.completedExercise.findUnique.mockResolvedValue({
      userId: 'u1',
      exerciseId: 7,
    });

    const result = await service.answer('u1', 7, 'hello');

    expect(result).toMatchObject({
      correct: true,
      alreadyCompleted: true,
      pointsWon: 0,
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.userStats.update).not.toHaveBeenCalled();
    expect(reviews.record).toHaveBeenCalledWith(prisma, 'u1', 7, true);
  });

  it('accepte une traduction équivalente déclarée en alternative, contractions comprises', async () => {
    prisma.exercise.findUnique.mockResolvedValue(
      exercise({
        type: 'TRANSLATION',
        answer: 'this pencil is yellow | this is a yellow pencil',
        question: 'Traduisez : « Ce crayon est jaune. »',
      }),
    );
    prisma.completedExercise.findUnique.mockResolvedValue(null);
    prisma.exercise.count.mockResolvedValue(5);
    prisma.completedExercise.count.mockResolvedValue(1);

    const result = await service.answer('u1', 7, 'This is a yellow pencil.');

    expect(result).toMatchObject({
      correct: true,
      verifiedBy: 'exact',
      seriesCompleted: false,
    });
  });

  it('refuse une traduction hors des alternatives et montre la première', async () => {
    prisma.exercise.findUnique.mockResolvedValue(
      exercise({ type: 'TRANSLATION', answer: 'a bird | one bird' }),
    );
    prisma.completedExercise.findUnique.mockResolvedValue(null);

    const result = await service.answer('u1', 7, 'a flying chicken');

    expect(result).toMatchObject({
      correct: false,
      verifiedBy: 'exact',
      expectedAnswer: 'a bird',
    });
  });

  it('valide une phrase prononcée avec les nombres en chiffres', async () => {
    prisma.exercise.findUnique.mockResolvedValue(
      exercise({ type: 'TALK', answer: 'it is seven oclock' }),
    );
    prisma.completedExercise.findUnique.mockResolvedValue(null);
    prisma.exercise.count.mockResolvedValue(4);
    prisma.completedExercise.count.mockResolvedValue(1);

    const result = await service.answer('u1', 7, 'It is 7:00');

    expect(result).toMatchObject({ correct: true, verifiedBy: 'spoken' });
  });
});
