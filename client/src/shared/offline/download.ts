import { catalog } from '@/shared/api/endpoints';
import type { LevelCode, SeriesDetail, SeriesType } from '@/shared/api/types';
import { cacheLevel } from './db';

const PARALLEL = 3;

export async function downloadLevel(
  code: LevelCode,
  type: SeriesType,
  onProgress?: (done: number, total: number) => void,
): Promise<number> {
  const list = await catalog.series(code, type);
  const details: SeriesDetail[] = [];
  onProgress?.(0, list.length);
  for (let i = 0; i < list.length; i += PARALLEL) {
    const chunk = list.slice(i, i + PARALLEL);
    details.push(...(await Promise.all(chunk.map((s) => catalog.seriesDetail(s.id)))));
    onProgress?.(details.length, list.length);
  }
  await cacheLevel(code, type, details);
  return details.length;
}
