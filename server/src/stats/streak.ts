const DAY = 24 * 60 * 60_000;

export interface Streak {
  current: number;
  best: number;
  doneToday: boolean;
}

export interface ActivityRow {
  completedAt: Date;
  pointsWon: number;
}

export const dateKey = (date: Date, timeZone: string) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

export const isValidTimeZone = (timeZone: string) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
};

export const safeTimeZone = (timeZone: string) =>
  isValidTimeZone(timeZone) ? timeZone : 'Europe/Paris';

const shiftDay = (key: string, delta: number) =>
  new Date(Date.parse(`${key}T00:00:00Z`) + delta * DAY)
    .toISOString()
    .slice(0, 10);

export function computeStreak(
  days: Iterable<string>,
  today: string,
  yesterday: string,
): Streak {
  const set = new Set(days);
  const doneToday = set.has(today);

  let current = 0;
  let cursor: string | null = doneToday
    ? today
    : set.has(yesterday)
      ? yesterday
      : null;
  while (cursor && set.has(cursor)) {
    current += 1;
    cursor = shiftDay(cursor, -1);
  }

  let best = 0;
  let run = 0;
  let previous: string | null = null;
  for (const key of [...set].sort()) {
    run = previous !== null && shiftDay(previous, 1) === key ? run + 1 : 1;
    best = Math.max(best, run);
    previous = key;
  }

  return { current, best: Math.max(best, current), doneToday };
}

export function dailyPoints(
  rows: ActivityRow[],
  timeZone: string,
): Map<string, number> {
  const tz = safeTimeZone(timeZone);
  const points = new Map<string, number>();
  for (const row of rows) {
    const key = dateKey(row.completedAt, tz);
    points.set(key, (points.get(key) ?? 0) + row.pointsWon);
  }
  return points;
}

export function streakFromActivity(
  rows: ActivityRow[],
  goal: number,
  now: Date,
  timeZone: string,
): Streak & { todayPoints: number } {
  const tz = safeTimeZone(timeZone);
  const points = dailyPoints(rows, tz);
  const today = dateKey(now, tz);
  const reached = [...points.entries()]
    .filter(([, value]) => value >= Math.max(1, goal))
    .map(([key]) => key);
  return {
    ...computeStreak(
      reached,
      today,
      dateKey(new Date(now.getTime() - DAY), tz),
    ),
    todayPoints: points.get(today) ?? 0,
  };
}

export function streakFromDates(
  dates: Date[],
  now: Date,
  timeZone: string,
): Streak {
  return streakFromActivity(
    dates.map((completedAt) => ({ completedAt, pointsWon: 1 })),
    1,
    now,
    timeZone,
  );
}
