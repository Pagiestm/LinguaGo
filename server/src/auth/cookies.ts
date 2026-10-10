import type { CookieOptions, Response } from 'express';
import { env, isProduction } from '../config/env';

export const ACCESS_COOKIE = 'lg_access';
export const REFRESH_COOKIE = 'lg_refresh';

const base: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  path: '/',
  domain: env.COOKIE_DOMAIN,
};

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {
  res.cookie(ACCESS_COOKIE, accessToken, {
    ...base,
    maxAge: env.ACCESS_TOKEN_TTL_MINUTES * 60_000,
  });
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...base,
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60_000,
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_COOKIE, base);
  res.clearCookie(REFRESH_COOKIE, base);
}
