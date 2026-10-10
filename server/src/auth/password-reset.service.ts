import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';
import { env } from '../config/env';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

const TTL = 60 * 60_000;

const hash = (token: string) =>
  createHash('sha256').update(token).digest('hex');

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async request(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, email: true, pseudo: true },
    });
    if (!user) return;

    const token = randomBytes(32).toString('base64url');
    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        tokenHash: hash(token),
        expiresAt: new Date(Date.now() + TTL),
      },
    });
    await this.mail.sendPasswordReset(
      user.email,
      user.pseudo,
      `${env.CLIENT_URL}/reset?token=${token}`,
    );
  }

  async reset(token: string, password: string): Promise<void> {
    const entry = await this.prisma.passwordReset.findUnique({
      where: { tokenHash: hash(token) },
    });
    if (!entry || entry.usedAt || entry.expiresAt < new Date())
      throw new BadRequestException('Lien invalide ou expiré');

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: entry.userId },
        data: { password: await bcrypt.hash(password, 12) },
      }),
      this.prisma.passwordReset.update({
        where: { id: entry.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: entry.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }
}
