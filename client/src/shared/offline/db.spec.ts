import { beforeEach, describe, expect, it } from 'vitest';
import type { SeriesDetail } from '@/shared/api/types';
import {
  cacheLevel,
  cachedSeries,
  cachedSeriesForLevel,
  clearOfflineData,
  downloadedLevel,
  markCachedExerciseCompleted,
  removeLevel,
} from './db';

const series = (id: number): SeriesDetail => ({
  id,
  title: `Série ${id}`,
  description: null,
  type: 'DEFAULT',
  level: { code: 'A1', title: 'Débutant', pointsPerExercise: 1 },
  exerciseCount: 1,
  completedCount: 0,
  isFavorite: false,
  isCompleted: false,
  exercises: [
    {
      id: id * 10,
      type: 'TRUE_FALSE',
      question: 'Q',
      choices: [],
      isCompleted: false,
      answerHash: 'h',
    },
  ],
});

describe('niveaux téléchargés', () => {
  beforeEach(() => clearOfflineData());

  it('enregistre un niveau et le retrouve sans ses exercices dans la liste', async () => {
    await cacheLevel('A1', 'DEFAULT', [series(1), series(2)]);

    const cards = await cachedSeriesForLevel('A1', 'DEFAULT');
    expect(cards.map((c) => c.id)).toEqual([1, 2]);
    expect(cards[0]).not.toHaveProperty('exercises');
    expect((await downloadedLevel('A1', 'DEFAULT'))?.count).toBe(2);
    expect((await cachedSeries(2))?.exercises).toHaveLength(1);
  });

  it('remplace le contenu au second téléchargement et marque les exercices faits', async () => {
    await cacheLevel('A1', 'DEFAULT', [series(1), series(2)]);
    await cacheLevel('A1', 'DEFAULT', [series(3)]);
    expect((await cachedSeriesForLevel('A1', 'DEFAULT')).map((c) => c.id)).toEqual([3]);

    await markCachedExerciseCompleted(3, 30);
    const detail = await cachedSeries(3);
    expect(detail?.completedCount).toBe(1);
    expect(detail?.exercises[0]?.isCompleted).toBe(true);
  });

  it('retire un niveau', async () => {
    await cacheLevel('A2', 'TALK', [series(5)]);
    await removeLevel('A2', 'TALK');
    expect(await cachedSeriesForLevel('A2', 'TALK')).toEqual([]);
    expect(await downloadedLevel('A2', 'TALK')).toBeUndefined();
    expect(await cachedSeries(5)).toBeUndefined();
  });
});
