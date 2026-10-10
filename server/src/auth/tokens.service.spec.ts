import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { hashToken, TokensService } from './tokens.service';

process.env.JWT_SECRET ??=
  'secret-de-test-suffisamment-long-pour-passer-la-validation';
process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/test';

function fakePrisma() {
  const rows = new Map<
    string,
    {
      id: string;
      tokenHash: string;
      userId: string;
      expiresAt: Date;
      revokedAt: Date | null;
    }
  >();
  return {
    rows,
    refreshToken: {
      create: jest.fn(
        async ({
          data,
        }: {
          data: { tokenHash: string; userId: string; expiresAt: Date };
        }) => {
          const row = { id: String(rows.size + 1), revokedAt: null, ...data };
          rows.set(row.tokenHash, row);
          return row;
        },
      ),
      findUnique: jest.fn(
        async ({ where }: { where: { tokenHash: string } }) =>
          rows.get(where.tokenHash) ?? null,
      ),
      update: jest.fn(
        async ({
          where,
          data,
        }: {
          where: { id: string };
          data: { revokedAt: Date };
        }) => {
          const row = [...rows.values()].find((r) => r.id === where.id)!;
          row.revokedAt = data.revokedAt;
          return row;
        },
      ),
      updateMany: jest.fn(
        async ({
          where,
          data,
        }: {
          where: { userId?: string; tokenHash?: string };
          data: { revokedAt: Date };
        }) => {
          for (const row of rows.values()) {
            if (
              (where.userId && row.userId === where.userId) ||
              (where.tokenHash && row.tokenHash === where.tokenHash)
            ) {
              row.revokedAt = data.revokedAt;
            }
          }
          return { count: 1 };
        },
      ),
      deleteMany: jest.fn(),
    },
  };
}

describe('TokensService', () => {
  let prisma: ReturnType<typeof fakePrisma>;
  let service: TokensService;

  beforeEach(() => {
    prisma = fakePrisma();
    service = new TokensService(
      new JwtService({}),
      prisma as unknown as PrismaService,
    );
  });

  it('signe et vérifie un jeton d’accès', () => {
    const token = service.signAccessToken({ sub: 'u1', role: 'USER' });
    expect(service.verifyAccessToken(token)).toEqual({
      sub: 'u1',
      role: 'USER',
    });
    expect(service.verifyAccessToken(token + 'x')).toBeNull();
  });

  it('ne stocke que l’empreinte du jeton de rafraîchissement', async () => {
    const token = await service.issueRefreshToken('u1');
    expect([...prisma.rows.keys()]).toEqual([hashToken(token)]);
    expect([...prisma.rows.keys()]).not.toContain(token);
  });

  it('fait tourner le jeton : l’ancien ne sert qu’une fois', async () => {
    const first = await service.issueRefreshToken('u1');
    const rotated = await service.rotateRefreshToken(first);
    expect(rotated?.userId).toBe('u1');
    expect(rotated?.token).not.toBe(first);

    expect(await service.rotateRefreshToken(first)).toBeNull();
  });

  it('révoque toute la famille quand un jeton déjà tourné est rejoué', async () => {
    const first = await service.issueRefreshToken('u1');
    const second = (await service.rotateRefreshToken(first))!.token;
    await service.rotateRefreshToken(first);

    expect(await service.rotateRefreshToken(second)).toBeNull();
  });

  it('refuse un jeton expiré', async () => {
    const token = await service.issueRefreshToken('u1');
    prisma.rows.get(hashToken(token))!.expiresAt = new Date(Date.now() - 1000);
    expect(await service.rotateRefreshToken(token)).toBeNull();
  });
});
