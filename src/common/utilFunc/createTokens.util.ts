import * as jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { v1 } from 'uuid';
import { User } from './../../user/entities/user.entity';

export async function createTokens(user: User, userRepo: Repository<User>) {
  const tokenVersion = v1();
  await userRepo.save({ ...user, tokenVersion });
  return {
    accessToken: jwt.sign(
      { userId: user.id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: '50m',
      },
    ),
    refreshToken: jwt.sign(
      { userId: user.id, tokenVersion },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: '30d',
      },
    ),
  };
}
