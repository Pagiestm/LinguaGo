import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { LevelCode, SeriesCard, SeriesDetail, SeriesType } from '@/shared/api/types';

export type PendingAction =
  | { kind: 'answer'; exerciseId: number; seriesId: number; answer: string; createdAt: number }
  | { kind: 'time'; seriesId: number; seconds: number; createdAt: number };

export interface DownloadedLevel {
  key: string;
  code: LevelCode;
  type: SeriesType;
  count: number;
  downloadedAt: number;
}

export const BACKGROUND_SYNC_TAG = 'linguago-queue';

const levelKey = (code: LevelCode, type: SeriesType) => `${code}:${type}`;

interface LinguaGoDB extends DBSchema {
  favorites: { key: number; value: SeriesDetail };
  series: {
    key: number;
    value: SeriesDetail & { levelKey: string };
    indexes: { levelKey: string };
  };
  levels: { key: string; value: DownloadedLevel };
  queue: { key: number; value: PendingAction; indexes: { createdAt: number } };
}

let database: Promise<IDBPDatabase<LinguaGoDB>> | null = null;

function db() {
  database ??= openDB<LinguaGoDB>('linguago', 2, {
    upgrade(upgrade, oldVersion) {
      if (oldVersion < 1) {
        upgrade.createObjectStore('favorites', { keyPath: 'id' });
        const queue = upgrade.createObjectStore('queue', { autoIncrement: true });
        queue.createIndex('createdAt', 'createdAt');
      }
      if (oldVersion < 2) {
        const series = upgrade.createObjectStore('series', { keyPath: 'id' });
        series.createIndex('levelKey', 'levelKey');
        upgrade.createObjectStore('levels', { keyPath: 'key' });
      }
    },
  });
  return database;
}

export async function cacheFavorites(series: SeriesDetail[]) {
  const connection = await db();
  const tx = connection.transaction('favorites', 'readwrite');
  await tx.store.clear();
  await Promise.all(series.map((s) => tx.store.put(s)));
  await tx.done;
}

export async function cachedFavorites(): Promise<SeriesDetail[]> {
  return (await db()).getAll('favorites');
}

export async function cachedSeries(id: number): Promise<SeriesDetail | undefined> {
  const connection = await db();
  return (await connection.get('favorites', id)) ?? (await connection.get('series', id));
}

export async function cacheLevel(code: LevelCode, type: SeriesType, series: SeriesDetail[]) {
  const connection = await db();
  const key = levelKey(code, type);
  const tx = connection.transaction(['series', 'levels'], 'readwrite');
  const store = tx.objectStore('series');
  for (const existing of await store.index('levelKey').getAllKeys(key)) {
    await store.delete(existing);
  }
  await Promise.all(series.map((s) => store.put({ ...s, levelKey: key })));
  await tx
    .objectStore('levels')
    .put({ key, code, type, count: series.length, downloadedAt: Date.now() });
  await tx.done;
}

export async function removeLevel(code: LevelCode, type: SeriesType) {
  const connection = await db();
  const key = levelKey(code, type);
  const tx = connection.transaction(['series', 'levels'], 'readwrite');
  const store = tx.objectStore('series');
  for (const existing of await store.index('levelKey').getAllKeys(key)) {
    await store.delete(existing);
  }
  await tx.objectStore('levels').delete(key);
  await tx.done;
}

export async function downloadedLevel(
  code: LevelCode,
  type: SeriesType,
): Promise<DownloadedLevel | undefined> {
  return (await db()).get('levels', levelKey(code, type));
}

export async function downloadedLevels(): Promise<DownloadedLevel[]> {
  return (await db()).getAll('levels');
}

export async function cachedSeriesForLevel(
  code: LevelCode,
  type: SeriesType,
): Promise<SeriesCard[]> {
  const rows = await (await db()).getAllFromIndex('series', 'levelKey', levelKey(code, type));
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    level: row.level,
    exerciseCount: row.exerciseCount,
    completedCount: row.completedCount,
    isFavorite: row.isFavorite,
    isCompleted: row.isCompleted,
  }));
}

export async function markCachedExerciseCompleted(seriesId: number, exerciseId: number) {
  const connection = await db();
  for (const storeName of ['favorites', 'series'] as const) {
    const series = await connection.get(storeName, seriesId);
    if (!series) continue;
    const exercise = series.exercises.find((e) => e.id === exerciseId);
    if (!exercise || exercise.isCompleted) continue;
    exercise.isCompleted = true;
    series.completedCount += 1;
    await connection.put(storeName, series as SeriesDetail & { levelKey: string });
  }
}

export async function enqueue(action: PendingAction) {
  await (await db()).add('queue', action);
  void requestBackgroundSync();
}

export async function requestBackgroundSync() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.ready;
    const sync = (registration as { sync?: { register(tag: string): Promise<void> } }).sync;
    await sync?.register(BACKGROUND_SYNC_TAG);
  } catch {
    return;
  }
}

export async function pendingActions(): Promise<{ key: number; action: PendingAction }[]> {
  const connection = await db();
  const tx = connection.transaction('queue', 'readonly');
  const entries: { key: number; action: PendingAction }[] = [];
  let cursor = await tx.store.index('createdAt').openCursor();
  while (cursor) {
    entries.push({ key: cursor.primaryKey, action: cursor.value });
    cursor = await cursor.continue();
  }
  return entries;
}

export async function removePending(key: number) {
  await (await db()).delete('queue', key);
}

export async function pendingCount(): Promise<number> {
  return (await db()).count('queue');
}

export async function clearOfflineData() {
  const connection = await db();
  await Promise.all([
    connection.clear('favorites'),
    connection.clear('series'),
    connection.clear('levels'),
    connection.clear('queue'),
  ]);
}
