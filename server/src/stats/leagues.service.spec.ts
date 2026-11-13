import { PrismaService } from '../prisma/prisma.service';
import { LeaderboardService } from './leaderboard.service';
import { LeaguePlayer, LeaguesService } from './leagues.service';

process.env.JWT_SECRET ??=
  'secret-de-test-suffisamment-long-pour-passer-la-validation';
process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/test';

const players = (tier: number, points: number[]): LeaguePlayer[] =>
  points.map((p, i) => ({ id: `${tier}-${i}`, tier, points: p }));

describe('LeaguesService', () => {
  const service = new LeaguesService(
    {} as PrismaService,
    {} as LeaderboardService,
  );

  describe('weekStart', () => {
    it('renvoie le lundi 0 h, heure de Paris', () => {
      const thursday = new Date('2026-11-12T14:00:00Z');
      expect(service.weekStart(thursday).toISOString()).toBe(
        '2026-11-08T23:00:00.000Z',
      );
      expect(service.weekStart(thursday, -1).toISOString()).toBe(
        '2026-11-01T23:00:00.000Z',
      );
      expect(service.weekStart(thursday, 1).toISOString()).toBe(
        '2026-11-15T23:00:00.000Z',
      );
    });

    it('fait commencer la semaine le lundi à minuit', () => {
      expect(
        service.weekStart(new Date('2026-11-15T22:30:00Z')).toISOString(),
      ).toBe('2026-11-08T23:00:00.000Z');
      expect(
        service.weekStart(new Date('2026-11-15T23:10:00Z')).toISOString(),
      ).toBe('2026-11-15T23:00:00.000Z');
    });

    it("suit le passage à l'heure d'été", () => {
      const wednesday = new Date('2026-04-01T10:00:00Z');
      expect(service.weekStart(wednesday).toISOString()).toBe(
        '2026-03-29T22:00:00.000Z',
      );
      expect(service.weekStart(wednesday, -1).toISOString()).toBe(
        '2026-03-22T23:00:00.000Z',
      );
    });
  });

  describe('planRotation', () => {
    it('fait monter un joueur seul dans sa ligue', () => {
      expect(service.planRotation(players(1, [40]))).toEqual(
        new Map([['1-0', 2]]),
      );
    });

    it('ne fait pas monter sans points', () => {
      expect(service.planRotation(players(1, [0, 0]))).toEqual(new Map());
    });

    it('fait monter les trois premiers qui ont marqué', () => {
      expect(service.planRotation(players(1, [10, 50, 0, 30, 20]))).toEqual(
        new Map([
          ['1-1', 2],
          ['1-3', 2],
          ['1-4', 2],
        ]),
      );
    });

    it("ne fait monter que d'un cran par semaine", () => {
      const moves = service.planRotation([
        ...players(1, [100]),
        ...players(2, [10]),
      ]);
      expect(moves.get('1-0')).toBe(2);
      expect(moves.get('2-0')).toBe(3);
    });

    it('ne fait pas monter au-delà du Diamant', () => {
      expect(service.planRotation(players(4, [500]))).toEqual(new Map());
    });

    it('fait descendre les trois derniers dans une ligue de plus de six membres', () => {
      expect(service.planRotation(players(2, [6, 5, 4, 3, 2, 1])).size).toBe(3);
      const moves = service.planRotation(players(2, [7, 6, 5, 4, 3, 2, 1]));
      expect([...moves].filter(([, to]) => to === 1).map(([id]) => id)).toEqual(
        ['2-4', '2-5', '2-6'],
      );
    });

    it('ne fait jamais descendre sous le Bronze', () => {
      expect(
        service.planRotation(players(1, [0, 0, 0, 0, 0, 0, 0, 0])).size,
      ).toBe(0);
    });
  });
});
