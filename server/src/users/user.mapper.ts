import type { Avatar, Role, User } from '../generated/prisma/client';

export const userWithAvatar = { include: { avatar: true } } as const;

export interface PublicUser {
  id: string;
  pseudo: string;
  email: string;
  role: Role;
  firstLogin: boolean;
  dailyGoal: number;
  leagueTier: number;
  hasGoogle: boolean;
  createdAt: Date;
  avatar: { id: number; svg: string } | null;
}

export function toPublicUser(
  user: User & { avatar: Avatar | null },
): PublicUser {
  return {
    id: user.id,
    pseudo: user.pseudo,
    email: user.email,
    role: user.role,
    firstLogin: user.firstLogin,
    dailyGoal: user.dailyGoal,
    leagueTier: user.leagueTier,
    hasGoogle: user.googleId !== null,
    createdAt: user.createdAt,
    avatar: user.avatar ? { id: user.avatar.id, svg: user.avatar.svg } : null,
  };
}
