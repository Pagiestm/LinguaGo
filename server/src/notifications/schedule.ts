const DAY = 24 * 60 * 60_000;

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
}

function offsetMinutes(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date);
  const value = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? '0');
  const asUtc = Date.UTC(
    value('year'),
    value('month') - 1,
    value('day'),
    value('hour'),
    value('minute'),
    value('second'),
  );
  return Math.round((asUtc - date.getTime()) / 60_000);
}

export function localDate(
  date: Date,
  timeZone: string,
): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const value = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? '0');
  return { year: value('year'), month: value('month'), day: value('day') };
}

export function zonedDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const first = new Date(
    guess - offsetMinutes(new Date(guess), timeZone) * 60_000,
  );
  return new Date(guess - offsetMinutes(first, timeZone) * 60_000);
}

export function parseTime(time: string): { hour: number; minute: number } {
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) throw new Error(`Heure invalide : ${time}`);
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

export function nextOccurrence(
  now: Date,
  time: string,
  timeZone: string,
  frequencyDays: number,
): Date {
  const { hour, minute } = parseTime(time);
  const today = localDate(now, timeZone);
  let candidate = zonedDate(
    today.year,
    today.month,
    today.day,
    hour,
    minute,
    timeZone,
  );
  const step = Math.max(1, frequencyDays);
  while (candidate.getTime() <= now.getTime()) {
    const next = localDate(
      new Date(candidate.getTime() + step * DAY),
      timeZone,
    );
    candidate = zonedDate(
      next.year,
      next.month,
      next.day,
      hour,
      minute,
      timeZone,
    );
  }
  return candidate;
}

export function nextAfterSending(
  scheduled: Date,
  now: Date,
  time: string,
  timeZone: string,
  frequencyDays: number,
): Date {
  const { hour, minute } = parseTime(time);
  const step = Math.max(1, frequencyDays);
  let candidate = scheduled;
  do {
    const next = localDate(
      new Date(candidate.getTime() + step * DAY),
      timeZone,
    );
    candidate = zonedDate(
      next.year,
      next.month,
      next.day,
      hour,
      minute,
      timeZone,
    );
  } while (candidate.getTime() <= now.getTime());
  return candidate;
}
