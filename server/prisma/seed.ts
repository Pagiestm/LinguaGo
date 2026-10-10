import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import { loadEnvFile } from '../src/config/env';
import { PrismaClient } from '../src/generated/prisma/client';
import type {
  ExerciseType,
  LevelCode,
  SeriesType,
} from '../src/generated/prisma/enums';

for (const file of [
  resolve(__dirname, '../../.env'),
  resolve(__dirname, '../.env'),
]) {
  loadEnvFile(file);
}

interface Catalogue {
  levels: {
    code: LevelCode;
    title: string;
    description: string;
    pointsPerExercise: number;
  }[];
  series: {
    key: number;
    title: string;
    description: string;
    levelCode: LevelCode;
    type: SeriesType;
  }[];
  exercises: {
    seriesKey: number;
    question: string;
    answer: string;
    choices: string[];
    type: ExerciseType;
  }[];
  avatars: { svg: string }[];
}

const reset = process.argv.includes('--reset');
const demo = process.argv.includes('--demo');

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' }),
});

const DEMO_PASSWORD = 'Linguago1!';
const DEMO_ACCOUNTS = [
  { email: 'demo@linguago.fr', pseudo: 'Démo', role: 'USER' as const },
  { email: 'admin@linguago.fr', pseudo: 'Admin', role: 'ADMIN' as const },
];

async function clearAll() {
  await prisma.completedExercise.deleteMany();
  await prisma.completedSeries.deleteMany();
  await prisma.favoriteSeries.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.userStats.deleteMany();
  await prisma.user.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.series.deleteMany();
  await prisma.level.deleteMany();
  await prisma.avatar.deleteMany();
}

async function seedCatalogue(catalogue: Catalogue) {
  const existing = await prisma.series.count();
  if (existing > 0) {
    const added = await completeCatalogue(catalogue);
    await syncAvatars(catalogue.avatars);
    console.log(
      `Catalogue déjà présent (${existing} séries), conservé${added ? `, ${added} série(s) ajoutée(s)` : ''}.`,
    );
    return;
  }

  for (const [index, level] of catalogue.levels.entries()) {
    await prisma.level.upsert({
      where: { code: level.code },
      create: { ...level, position: index + 1 },
      update: { ...level, position: index + 1 },
    });
  }
  const levels = await prisma.level.findMany();
  const levelId = (code: LevelCode) => levels.find((l) => l.code === code)!.id;

  const seriesIds = new Map<number, number>();
  for (const series of catalogue.series) {
    const created = await prisma.series.create({
      data: {
        title: series.title,
        description: series.description,
        type: series.type,
        levelId: levelId(series.levelCode),
      },
    });
    seriesIds.set(series.key, created.id);
  }

  await prisma.exercise.createMany({
    data: catalogue.exercises.map((exercise) => ({
      seriesId: seriesIds.get(exercise.seriesKey)!,
      question: exercise.question,
      answer: exercise.answer,
      choices: exercise.choices,
      type: exercise.type,
    })),
  });

  await syncAvatars(catalogue.avatars);

  console.log(
    `Catalogue : ${catalogue.levels.length} niveaux, ${catalogue.series.length} séries, ${catalogue.exercises.length} exercices, ${catalogue.avatars.length} avatars.`,
  );
}

async function syncAvatars(avatars: { svg: string }[]) {
  const existing = await prisma.avatar.findMany({ orderBy: { id: 'asc' } });
  for (const [index, avatar] of avatars.entries()) {
    const row = existing[index];
    if (!row) {
      await prisma.avatar.create({ data: avatar });
    } else if (row.svg !== avatar.svg) {
      await prisma.avatar.update({ where: { id: row.id }, data: avatar });
    }
  }
}

async function completeCatalogue(catalogue: Catalogue): Promise<number> {
  const levels = await prisma.level.findMany();
  const titles = new Set(
    (await prisma.series.findMany({ select: { title: true } })).map(
      (s) => s.title,
    ),
  );
  let added = 0;
  for (const series of catalogue.series) {
    if (titles.has(series.title)) continue;
    const level = levels.find((l) => l.code === series.levelCode);
    if (!level) continue;
    await prisma.series.create({
      data: {
        title: series.title,
        description: series.description,
        type: series.type,
        levelId: level.id,
        exercises: {
          create: catalogue.exercises
            .filter((e) => e.seriesKey === series.key)
            .map((e) => ({
              question: e.question,
              answer: e.answer,
              choices: e.choices,
              type: e.type,
            })),
        },
      },
    });
    added += 1;
  }
  return added;
}

async function seedAccounts() {
  const avatars = await prisma.avatar.findMany({ select: { id: true } });
  const password = await bcrypt.hash(DEMO_PASSWORD, 12);
  for (const [index, account] of DEMO_ACCOUNTS.entries()) {
    await prisma.user.upsert({
      where: { email: account.email },
      create: {
        ...account,
        password,
        firstLogin: false,
        avatarId: avatars[index % avatars.length]?.id,
        stats: { create: {} },
      },
      update: { role: account.role },
    });
  }
  console.log(
    `Comptes de démonstration : ${DEMO_ACCOUNTS.map((a) => a.email).join(', ')} (mot de passe ${DEMO_PASSWORD}).`,
  );
}

async function seedDemoActivity() {
  const { faker } = await import('@faker-js/faker/locale/fr');
  faker.seed(20261008);
  const avatars = await prisma.avatar.findMany({ select: { id: true } });
  const series = await prisma.series.findMany({
    include: {
      exercises: { select: { id: true } },
      level: { select: { pointsPerExercise: true } },
    },
    orderBy: { id: 'asc' },
  });
  const password = await bcrypt.hash(DEMO_PASSWORD, 12);

  for (let i = 0; i < 12; i++) {
    const email = `apprenant${i + 1}@linguago.test`;
    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        pseudo: faker.internet.username().slice(0, 20),
        password,
        firstLogin: false,
        avatarId: faker.helpers.arrayElement(avatars).id,
        stats: { create: {} },
      },
      update: {},
    });

    const picked = faker.helpers.arrayElements(
      series.slice(0, 30),
      faker.number.int({ min: 1, max: 8 }),
    );
    let points = 0;
    let successful = 0;
    let completedSeries = 0;
    for (const s of picked) {
      const full = faker.datatype.boolean(0.6);
      const exercises = full
        ? s.exercises
        : s.exercises.slice(
            0,
            faker.number.int({ min: 1, max: s.exercises.length }),
          );
      for (const exercise of exercises) {
        const completedAt = faker.date.recent({ days: 12 });
        await prisma.completedExercise.upsert({
          where: {
            userId_exerciseId: { userId: user.id, exerciseId: exercise.id },
          },
          create: {
            userId: user.id,
            exerciseId: exercise.id,
            seriesId: s.id,
            pointsWon: s.level.pointsPerExercise,
            completedAt,
          },
          update: {},
        });
        points += s.level.pointsPerExercise;
        successful += 1;
      }
      if (full) {
        await prisma.completedSeries.upsert({
          where: { userId_seriesId: { userId: user.id, seriesId: s.id } },
          create: { userId: user.id, seriesId: s.id },
          update: {},
        });
        completedSeries += 1;
      }
    }
    await prisma.userStats.update({
      where: { userId: user.id },
      data: {
        points,
        successfulExercises: successful,
        failedExercises: faker.number.int({ min: 0, max: 12 }),
        completedSeries,
        timeSpentSeconds: faker.number.int({ min: 600, max: 36_000 }),
      },
    });
  }
  console.log(
    'Activité de démonstration : 12 apprenants avec des exercices récents.',
  );
}

async function main() {
  const catalogueFile = [
    resolve(__dirname, 'seed/catalogue.json'),
    resolve(__dirname, '../../prisma/seed/catalogue.json'),
  ].find((file) => existsSync(file));
  if (!catalogueFile) throw new Error('Catalogue introuvable.');
  const catalogue = JSON.parse(
    readFileSync(catalogueFile, 'utf8'),
  ) as Catalogue;

  if (reset) {
    await clearAll();
    console.log('Base vidée.');
  }
  await seedCatalogue(catalogue);
  await seedAccounts();
  if (demo) await seedDemoActivity();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
