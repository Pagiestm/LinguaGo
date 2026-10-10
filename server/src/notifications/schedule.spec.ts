import { nextAfterSending, nextOccurrence, zonedDate } from './schedule';

const paris = 'Europe/Paris';

describe('zonedDate', () => {
  it('convertit une heure locale en instant UTC, heure d’été comprise', () => {
    expect(zonedDate(2026, 7, 14, 17, 0, paris).toISOString()).toBe(
      '2026-07-14T15:00:00.000Z',
    );
    expect(zonedDate(2026, 1, 14, 17, 0, paris).toISOString()).toBe(
      '2026-01-14T16:00:00.000Z',
    );
  });
});

describe('nextOccurrence', () => {
  it('programme aujourd’hui si l’heure n’est pas passée', () => {
    const now = new Date('2026-10-08T10:00:00.000Z');
    expect(nextOccurrence(now, '17:00', paris, 1).toISOString()).toBe(
      '2026-10-08T15:00:00.000Z',
    );
  });

  it('programme le lendemain si l’heure est passée', () => {
    const now = new Date('2026-10-08T16:30:00.000Z');
    expect(nextOccurrence(now, '17:00', paris, 1).toISOString()).toBe(
      '2026-10-09T15:00:00.000Z',
    );
  });

  it('respecte la fréquence en jours', () => {
    const now = new Date('2026-10-08T16:30:00.000Z');
    expect(nextOccurrence(now, '17:00', paris, 3).toISOString()).toBe(
      '2026-10-11T15:00:00.000Z',
    );
  });
});

describe('nextAfterSending', () => {
  it('avance d’une fréquence à partir de l’heure prévue', () => {
    const scheduled = new Date('2026-10-08T15:00:00.000Z');
    const now = new Date('2026-10-08T15:00:30.000Z');
    expect(
      nextAfterSending(scheduled, now, '17:00', paris, 2).toISOString(),
    ).toBe('2026-10-10T15:00:00.000Z');
  });

  it('rattrape un retard sans programmer dans le passé', () => {
    const scheduled = new Date('2026-10-01T15:00:00.000Z');
    const now = new Date('2026-10-08T16:00:00.000Z');
    expect(
      nextAfterSending(scheduled, now, '17:00', paris, 1).toISOString(),
    ).toBe('2026-10-09T15:00:00.000Z');
  });

  it('garde l’heure locale au passage à l’heure d’hiver', () => {
    const scheduled = new Date('2026-10-24T15:00:00.000Z');
    const now = new Date('2026-10-24T15:00:10.000Z');
    expect(
      nextAfterSending(scheduled, now, '17:00', paris, 1).toISOString(),
    ).toBe('2026-10-25T16:00:00.000Z');
  });
});
