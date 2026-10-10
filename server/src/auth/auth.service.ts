import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import { env } from '../config/env';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  toPublicUser,
  type PublicUser,
  userWithAvatar,
} from '../users/user.mapper';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokensService } from './tokens.service';

const BCRYPT_ROUNDS = 12;

export interface Session {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokensService,
    private readonly mail: MailService,
  ) {}

  async register(dto: RegisterDto): Promise<Session> {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing)
      throw new ConflictException('Un compte existe déjà avec cet email');

    const avatars = await this.prisma.avatar.findMany({ select: { id: true } });
    const avatar = avatars[Math.floor(Math.random() * avatars.length)];

    const user = await this.prisma.user.create({
      data: {
        pseudo: dto.pseudo.trim(),
        email,
        password: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
        avatarId: avatar?.id,
        stats: { create: {} },
      },
      ...userWithAvatar,
    });

    this.mail
      .sendWelcome(user.email, user.pseudo, env.CLIENT_URL)
      .catch((error: unknown) =>
        this.logger.warn(`Email de bienvenue non envoyé : ${String(error)}`),
      );

    return this.openSession(user);
  }

  async login(dto: LoginDto): Promise<Session> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
      ...userWithAvatar,
    });
    const valid = user
      ? await bcrypt.compare(dto.password, user.password)
      : false;
    if (!user || !valid)
      throw new UnauthorizedException('Email ou mot de passe incorrect');

    return this.openSession(user);
  }

  async refresh(refreshToken: string): Promise<Session> {
    const rotated = await this.tokens.rotateRefreshToken(refreshToken);
    if (!rotated) throw new UnauthorizedException('Session expirée');

    const user = await this.prisma.user.findUnique({
      where: { id: rotated.userId },
      ...userWithAvatar,
    });
    if (!user) throw new UnauthorizedException('Session expirée');

    return {
      user: toPublicUser(user),
      accessToken: this.tokens.signAccessToken({
        sub: user.id,
        role: user.role,
      }),
      refreshToken: rotated.token,
    };
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    if (refreshToken) await this.tokens.revoke(refreshToken);
  }

  async openSession(
    user: Parameters<typeof toPublicUser>[0],
  ): Promise<Session> {
    return {
      user: toPublicUser(user),
      accessToken: this.tokens.signAccessToken({
        sub: user.id,
        role: user.role,
      }),
      refreshToken: await this.tokens.issueRefreshToken(user.id),
    };
  }
}
