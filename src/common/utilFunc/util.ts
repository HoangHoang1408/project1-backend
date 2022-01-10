import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { v1 } from 'uuid';
import { CoreOutput } from '../dto/output.dto';
import { User } from './../../user/entities/user.entity';
export function customError(
  field: string,
  message: string,
): Pick<CoreOutput, 'error' | 'ok'> {
  return {
    ok: false,
    error: {
      message,
      field,
    },
  };
}
export const accessTokenSecret = 'secret1';
export const refreshTokenSecret = 'secret2';
export const JWT_REFRESH = 'JWT_REFRESH';

export async function createTokens(user: User, userRepo: Repository<User>) {
  const tokenVersion = v1();
  await userRepo.save({ ...user, tokenVersion });
  return {
    accessToken: jwt.sign({ userId: user.id }, accessTokenSecret, {
      expiresIn: '5m',
    }),
    refreshToken: jwt.sign(
      { userId: user.id, tokenVersion },
      refreshTokenSecret,
      {
        expiresIn: '30d',
      },
    ),
  };
}

export function bindRefreshTokenToCookie(res: Response, refreshToken: string) {
  res.cookie(JWT_REFRESH, refreshToken, {
    httpOnly: true,
    sameSite: true,
    path: '/refresh_token',
    // secure: true,
  });
}
