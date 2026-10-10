import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ACCESS_COOKIE } from '../../auth/cookies';
import { TokensService } from '../../auth/tokens.service';
import { IS_PUBLIC } from '../decorators/public.decorator';
import type { AuthenticatedRequest } from '../decorators/current-user.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokens: TokensService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const cookies = request.cookies as Record<string, string | undefined>;
    const token = cookies[ACCESS_COOKIE];
    if (!token) throw new UnauthorizedException('Authentification requise');

    const payload = this.tokens.verifyAccessToken(token);
    if (!payload) throw new UnauthorizedException('Session expirée');

    request.user = { id: payload.sub, role: payload.role };
    return true;
  }
}
