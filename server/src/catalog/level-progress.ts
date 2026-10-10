import type { LevelCode } from '../generated/prisma/enums';

export interface LevelSummary {
  code: LevelCode;
  title: string;
  position: number;
  pointsPerExercise: number;
  exerciseCount: number;
}

export interface LevelProgress {
  current: { code: LevelCode; title: string };
  next: { code: LevelCode; title: string; pointsRequired: number } | null;
  pointsInLevel: number;
  pointsForLevel: number;
  progress: number;
}

export const winnablePoints = (level: LevelSummary) =>
  level.exerciseCount * level.pointsPerExercise;

export function computeLevelProgress(
  levels: LevelSummary[],
  points: number,
): LevelProgress {
  const ordered = [...levels].sort((a, b) => a.position - b.position);
  if (ordered.length === 0) throw new Error('Aucun niveau défini');

  let start = 0;
  let index = 0;
  for (let i = 0; i < ordered.length; i++) {
    const needed = winnablePoints(ordered[i]);
    if (points >= start + needed && i < ordered.length - 1) {
      start += needed;
      index = i + 1;
    } else {
      break;
    }
  }

  const current = ordered[index];
  const next = ordered[index + 1];
  const pointsForLevel = winnablePoints(current);
  const pointsInLevel = Math.max(0, Math.min(points - start, pointsForLevel));

  return {
    current: { code: current.code, title: current.title },
    next: next
      ? {
          code: next.code,
          title: next.title,
          pointsRequired: start + pointsForLevel,
        }
      : null,
    pointsInLevel,
    pointsForLevel,
    progress:
      pointsForLevel === 0 ? 1 : Math.min(1, pointsInLevel / pointsForLevel),
  };
}
