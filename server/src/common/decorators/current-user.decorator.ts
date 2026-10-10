import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { Role } from '../../generated/prisma/enums';

export interface AuthenticatedUser {
  id: string;
  role: Role;
}

export type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
