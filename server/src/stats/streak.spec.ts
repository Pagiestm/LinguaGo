import { computeStreak, streakFromActivity, streakFromDates } from './streak';

describe('computeStreak', () => {
  it('vaut zéro sans activité', () => {
    expect(computeStreak([], '2026-10-09', '2026-10-08')).toEqual({
      current: 0,
      best: 0,
      doneToday: false,
    });
  });

  it('compte les jours consécutifs jusqu’à aujourd’hui', () => {
    const streak = computeStreak(
      ['2026-10-07', '2026-10-08', '2026-10-09', '2026-10-09'],
      '2026-10-09',
      '2026-10-08',
    );
    expect(streak).toEqual({ current: 3, best: 3, doneToday: true });
  });

  it('garde la série vivante si hier est fait mais pas encore aujourd’hui', () => {
    const streak = computeStreak(
      ['2026-10-06', '2026-10-07', '2026-10-08'],
      '2026-10-09',
      '2026-10-08',
    );
    expect(streak).toEqual({ current: 3, best: 3, doneToday: false });
  });

  it('casse la série après un jour manqué et retient le meilleur score', () => {
    const streak = computeStreak(
      ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-09'],
      '2026-10-09',
      '2026-10-08',
    );
    expect(streak).toEqual({ current: 1, best: 4, doneToday: true });
  });

  it('passe au fuseau horaire demandé', () => {
    const now = new Date('2026-10-09T23:30:00Z');
    const streak = streakFromDates([now], now, 'Europe/Paris');
    expect(streak.doneToday).toBe(true);
    expect(streak.current).toBe(1);
  });
});

describe('streakFromActivity', () => {
  const now = new Date('2026-10-09T12:00:00Z');
  const at = (day: string, pointsWon: number) => ({
    completedAt: new Date(`${day}T10:00:00Z`),
    pointsWon,
  });

  it('ne compte un jour que si l’objectif est atteint', () => {
    const streak = streakFromActivity(
      [at('2026-10-08', 5), at('2026-10-09', 2), at('2026-10-09', 2)],
      5,
      now,
      'Europe/Paris',
    );
    expect(streak).toEqual({
      current: 1,
      best: 1,
      doneToday: false,
      todayPoints: 4,
    });
  });

  it('additionne les points d’une même journée', () => {
    const streak = streakFromActivity(
      [at('2026-10-09', 3), at('2026-10-09', 3)],
      5,
      now,
      'Europe/Paris',
    );
    expect(streak.doneToday).toBe(true);
    expect(streak.todayPoints).toBe(6);
  });
});
