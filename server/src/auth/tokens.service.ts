import { createHash, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { env } from '../config/env';
import type { Role } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';

export interface AccessTokenPayload {
  sub: string;
  role: Role;
}

const ISSUER = 'linguago';
const AUDIENCE = 'linguago-client';

export const hashToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');

@Injectable()
export class TokensService {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  signAccessToken(payload: AccessTokenPayload): string {
    return this.jwt.sign(
      { role: payload.role },
      {
        subject: payload.sub,
        secret: env.JWT_SECRET,
        expiresIn: `${env.ACCESS_TOKEN_TTL_MINUTES}m`,
        issuer: ISSUER,
        audience: AUDIENCE,
      },
    );
  }

  verifyAccessToken(token: string): AccessTokenPayload | null {
    try {
      const decoded = this.jwt.verify<{ sub: string; role: Role }>(token, {
        secret: env.JWT_SECRET,
        issuer: ISSUER,
        audience: AUDIENCE,
      });
      return { sub: decoded.sub, role: decoded.role };
    } catch {
      return null;
    }
  }

  async issueRefreshToken(userId: string): Promise<string> {
    const token = randomBytes(48).toString('base64url');
    await this.prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(token),
        userId,
        expiresAt: new Date(
          Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60_000,
        ),
      },
    });
    return token;
  }

  async rotateRefreshToken(
    token: string,
  ): Promise<{ userId: string; token: string } | null> {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(token) },
    });
    if (!stored) return null;

    if (stored.revokedAt) {
      await this.revokeAll(stored.userId);
      return null;
    }
    if (stored.expiresAt.getTime() < Date.now()) return null;

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });
    const fresh = await this.issueRefreshToken(stored.userId);
    return { userId: stored.userId, token: fresh };
  }

  async revoke(token: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: hashToken(token), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAll(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async purgeExpired(): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { revokedAt: { not: null } }],
      },
    });
  }
}
