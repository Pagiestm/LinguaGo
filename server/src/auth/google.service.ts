import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';
import { env } from '../config/env';
import { PrismaService } from '../prisma/prisma.service';
import { userWithAvatar } from '../users/user.mapper';
import { AuthService, type Session } from './auth.service';

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

interface GoogleProfile {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
}

@Injectable()
export class GoogleService {
  private readonly logger = new Logger(GoogleService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
  ) {}

  get configured(): boolean {
    return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
  }

  private get callbackUrl(): string {
    return (
      env.GOOGLE_CALLBACK_URL ??
      `http://localhost:${env.PORT}/auth/google/callback`
    );
  }

  authorizationUrl(state: string): string {
    if (!this.configured)
      throw new NotFoundException('La connexion Google n’est pas activée');
    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID!,
      redirect_uri: this.callbackUrl,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      prompt: 'select_account',
    });
    return `${AUTH_URL}?${params.toString()}`;
  }

  async exchange(code: string): Promise<Session> {
    if (!this.configured)
      throw new NotFoundException('La connexion Google n’est pas activée');

    const tokenResponse = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID!,
        client_secret: env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: this.callbackUrl,
        grant_type: 'authorization_code',
      }),
    });
    if (!tokenResponse.ok) {
      this.logger.warn(`Échange Google refusé (${tokenResponse.status})`);
      throw new UnauthorizedException('Connexion Google refusée');
    }
    const tokens = (await tokenResponse.json()) as { access_token?: string };
    if (!tokens.access_token)
      throw new UnauthorizedException('Connexion Google refusée');

    const profileResponse = await fetch(USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!profileResponse.ok)
      throw new UnauthorizedException('Profil Google inaccessible');
    const profile = (await profileResponse.json()) as GoogleProfile;
    if (!profile.email || profile.email_verified === false)
      throw new UnauthorizedException('Adresse Google non vérifiée');

    return this.auth.openSession(await this.findOrCreate(profile));
  }

  private async findOrCreate(profile: GoogleProfile) {
    const byGoogle = await this.prisma.user.findUnique({
      where: { googleId: profile.sub },
      ...userWithAvatar,
    });
    if (byGoogle) return byGoogle;

    const email = profile.email.trim().toLowerCase();
    const byEmail = await this.prisma.user.findUnique({
      where: { email },
      ...userWithAvatar,
    });
    if (byEmail) {
      return this.prisma.user.update({
        where: { id: byEmail.id },
        data: { googleId: profile.sub },
        ...userWithAvatar,
      });
    }

    const avatars = await this.prisma.avatar.findMany({ select: { id: true } });
    const avatar = avatars[Math.floor(Math.random() * avatars.length)];
    const base = (profile.given_name ?? profile.name ?? email.split('@')[0])
      .trim()
      .slice(0, 32);
    return this.prisma.user.create({
      data: {
        pseudo: await this.uniquePseudo(base || 'Apprenant'),
        email,
        googleId: profile.sub,
        password: await bcrypt.hash(randomBytes(32).toString('base64url'), 12),
        avatarId: avatar?.id,
        stats: { create: {} },
      },
      ...userWithAvatar,
    });
  }

  private async uniquePseudo(base: string): Promise<string> {
    let candidate = base;
    for (let i = 2; i < 100; i++) {
      const taken = await this.prisma.user.findFirst({
        where: { pseudo: { equals: candidate, mode: 'insensitive' } },
        select: { id: true },
      });
      if (!taken) return candidate;
      candidate = `${base} ${i}`.slice(0, 40);
    }
    return `${base.slice(0, 30)} ${Date.now() % 10000}`;
  }
}
