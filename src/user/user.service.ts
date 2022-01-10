import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { CoreOutput } from 'src/common/dto/output.dto';
import {
  bindRefreshTokenToCookie,
  createTokens,
  customError,
} from 'src/common/utilFunc/util';
import { Repository } from 'typeorm';
import { accessTokenSecret } from './../common/utilFunc/util';
import { LoginInput, LoginOutput, SignUpInput, SignUpOutput } from './dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async signup({ email, password, name }: SignUpInput): Promise<SignUpOutput> {
    const existed = await this.userRepo.findOne({ email });
    if (existed) return customError('email', 'Email was already registered!');
    await this.userRepo.save(this.userRepo.create({ email, password, name }));
    return {
      ok: true,
    };
  }

  async login(
    { email, password }: LoginInput,
    res: Response,
  ): Promise<LoginOutput> {
    const user = await this.userRepo.findOne(
      { email },
      { select: ['password', 'id'] },
    );
    if (!user || !(await user.checkPassword(password)))
      return customError('email', 'Email or Password was wrong!');

    const { accessToken, refreshToken } = await createTokens(
      user,
      this.userRepo,
    );

    bindRefreshTokenToCookie(res, refreshToken);

    return {
      ok: true,
      accessToken: accessToken,
    };
  }

  async logout(req: Request): Promise<CoreOutput> {
    try {
      // get access token
      const accessToken = req.get('ACCESS_JWT');
      if (!accessToken) return customError('token', 'Invalid token');

      // check token validation
      const decoded = jwt.verify(accessToken, accessTokenSecret);
      if (!decoded || !decoded['userId'])
        return customError('token', 'Invalid token');

      // check token with user
      const user = await this.userRepo.findOne({ id: decoded['userId'] });
      if (!user) return customError('token', 'Invalid token');
      if (!user.tokenVersion) return customError('user', 'Already logged out');
      await this.userRepo.save({ ...user, tokenVersion: null });

      // valid token
      return {
        ok: true,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError)
        return customError('token', 'Invalid token');
      return customError('token', 'Logout fail');
    }
  }
}
