import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { env, isProduction } from '../config/env';
import { UsersService } from '../users/users.service';
import { AuthService, Session } from './auth.service';
import { clearAuthCookies, REFRESH_COOKIE, setAuthCookies } from './cookies';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-reset.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleService } from './google.service';
import { PasswordResetService } from './password-reset.service';

const SENSITIVE = { default: { limit: 10, ttl: 15 * 60_000 } };
const STATE_COOKIE = 'lg_oauth_state';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
    private readonly google: GoogleService,
    private readonly passwordReset: PasswordResetService,
  ) {}

  @Public()
  @Get('providers')
  @ApiOperation({ summary: 'Les fournisseurs de connexion disponibles' })
  providers() {
    return { google: this.google.configured };
  }

  @Public()
  @Throttle(SENSITIVE)
  @Post('register')
  @ApiOperation({ summary: 'Créer un compte et ouvrir une session' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.send(res, await this.auth.register(dto));
  }

  @Public()
  @Throttle(SENSITIVE)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Se connecter' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.send(res, await this.auth.login(dto));
  }

  @Public()
  @Get('google')
  @ApiOperation({ summary: 'Démarrer la connexion avec Google' })
  googleStart(@Res() res: Response) {
    const state = randomBytes(16).toString('base64url');
    res.cookie(STATE_COOKIE, state, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 10 * 60_000,
      path: '/',
    });
    res.redirect(this.google.authorizationUrl(state));
  }

  @Public()
  @Get('google/callback')
  @ApiOperation({ summary: 'Retour de Google : ouvre la session' })
  async googleCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const cookies = req.cookies as Record<string, string | undefined>;
    res.clearCookie(STATE_COOKIE, { path: '/' });
    if (!code || !state || cookies[STATE_COOKIE] !== state) {
      res.redirect(`${env.CLIENT_URL}/login?error=google`);
      return;
    }
    try {
      const session = await this.google.exchange(code);
      setAuthCookies(res, session.accessToken, session.refreshToken);
      res.redirect(`${env.CLIENT_URL}/dashboard`);
    } catch {
      res.redirect(`${env.CLIENT_URL}/login?error=google`);
    }
  }

  @Public()
  @Throttle(SENSITIVE)
  @Post('forgot')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Envoyer un lien de réinitialisation du mot de passe par email',
  })
  forgot(@Body() dto: ForgotPasswordDto) {
    return this.passwordReset.request(dto.email);
  }

  @Public()
  @Throttle(SENSITIVE)
  @Post('reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Choisir un nouveau mot de passe avec le lien reçu',
  })
  reset(@Body() dto: ResetPasswordDto) {
    return this.passwordReset.reset(dto.token, dto.password);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      "Renouveler le jeton d'accès à partir du jeton de rafraîchissement",
  })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = req.cookies as Record<string, string | undefined>;
    const token = cookies[REFRESH_COOKIE];
    try {
      return this.send(res, await this.auth.refresh(token ?? ''));
    } catch (error) {
      clearAuthCookies(res);
      throw error;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth('lg_access')
  @ApiOperation({ summary: 'Fermer la session' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookies = req.cookies as Record<string, string | undefined>;
    await this.auth.logout(cookies[REFRESH_COOKIE]);
    clearAuthCookies(res);
  }

  @Get('me')
  @ApiCookieAuth('lg_access')
  @ApiOperation({ summary: 'Le compte connecté' })
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.users.getProfile(user.id);
  }

  private send(res: Response, session: Session) {
    setAuthCookies(res, session.accessToken, session.refreshToken);
    return session.user;
  }
}
