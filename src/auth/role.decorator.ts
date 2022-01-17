import { SetMetadata } from '@nestjs/common';
import { UserRole } from './../user/entities/user.entity';

export type AllowedRole = keyof typeof UserRole | 'Any';
export function Role(roles: AllowedRole[]) {
  return SetMetadata('roles', roles);
}
