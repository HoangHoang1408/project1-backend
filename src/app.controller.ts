import { Controller, Get, Injectable, Req, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import {
  bindRefreshTokenToCookie,
  createTokens,
  JWT_REFRESH,
  refreshTokenSecret,
} from './common/utilFunc/util';
import { User } from './user/entities/user.entity';

@Controller()
@Injectable()
export class AppController {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}
  @Get('/refresh_token')
  async getNewTokens(@Req() req: Request, @Res() res: Response) {
    try {
      const refreshToken = req.cookies[JWT_REFRESH];
      if (!refreshToken) throw new Error('validatefail');

      const decoded = jwt.verify(refreshToken, refreshTokenSecret);
      if (!decoded || !decoded['userId'] || !decoded['tokenVersion'])
        throw new Error('validatefail');

      const user = await this.userRepo.findOne({ id: decoded['userId'] });
      if (!user || decoded['tokenVersion'] !== user.tokenVersion)
        throw new Error('validatefail');

      const { accessToken, refreshToken: newRefreshToken } = await createTokens(
        user,
        this.userRepo,
      );
      bindRefreshTokenToCookie(res, newRefreshToken);
      console.log('oke');
      res.status(200).json({
        ok: true,
        accessToken,
      });
    } catch (error) {
      console.log(error.message);
      res.status(200).json({
        ok: false,
        accessToken: '',
      });
    }
  }
}
