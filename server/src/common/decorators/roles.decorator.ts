import { SetMetadata } from '@nestjs/common';
import type { Role } from '../../generated/prisma/enums';

export const ROLES = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES, roles);
