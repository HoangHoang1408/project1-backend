import { Response } from 'express';
import { REFRESH_JWT } from './../constants/common.constants';

export function bindRefreshTokenToCookie(res: Response, refreshToken: string) {
  res.cookie(REFRESH_JWT, refreshToken, {
    httpOnly: true,
    sameSite: true,
    path: '/refresh_token',
    // secure: true,
  });
}
