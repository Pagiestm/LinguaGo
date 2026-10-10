import { computeLevelProgress, LevelSummary } from './level-progress';

const levels: LevelSummary[] = [
  {
    code: 'A1',
    title: 'Débutant',
    position: 1,
    pointsPerExercise: 1,
    exerciseCount: 10,
  },
  {
    code: 'A2',
    title: 'Élémentaire',
    position: 2,
    pointsPerExercise: 2,
    exerciseCount: 10,
  },
  {
    code: 'B1',
    title: 'Intermédiaire',
    position: 3,
    pointsPerExercise: 3,
    exerciseCount: 10,
  },
];

describe('computeLevelProgress', () => {
  it('commence au premier niveau sans point', () => {
    const progress = computeLevelProgress(levels, 0);
    expect(progress.current.code).toBe('A1');
    expect(progress.next?.code).toBe('A2');
    expect(progress.next?.pointsRequired).toBe(10);
    expect(progress.progress).toBe(0);
  });

  it('passe au niveau suivant une fois les points du niveau gagnés', () => {
    const progress = computeLevelProgress(levels, 10);
    expect(progress.current.code).toBe('A2');
    expect(progress.pointsInLevel).toBe(0);
    expect(progress.pointsForLevel).toBe(20);
  });

  it('mesure la progression dans le niveau courant', () => {
    const progress = computeLevelProgress(levels, 15);
    expect(progress.current.code).toBe('A2');
    expect(progress.pointsInLevel).toBe(5);
    expect(progress.progress).toBe(0.25);
  });

  it('reste au dernier niveau sans suivant', () => {
    const progress = computeLevelProgress(levels, 500);
    expect(progress.current.code).toBe('B1');
    expect(progress.next).toBeNull();
    expect(progress.progress).toBe(1);
  });
});
