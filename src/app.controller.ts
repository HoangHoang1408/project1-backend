import { Controller, Get, Injectable, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { REFRESH_JWT } from './common/constants/common.constants';
import { bindRefreshTokenToCookie, createTokens } from './common/utilFunc';
import { User } from './user/entities/user.entity';

@Controller()
@Injectable()
export class AppController {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly configService: ConfigService,
  ) {}
  @Get('/refresh_token')
  async getNewTokens(@Req() req: Request, @Res() res: Response) {
    try {
      const refreshToken = req.cookies[REFRESH_JWT];
      if (!refreshToken) throw new Error('validatefail');

      const decoded = jwt.verify(
        refreshToken,
        this.configService.get('REFRESH_TOKEN_SECRET'),
      );
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
      res.status(200).json({
        ok: false,
        accessToken: '',
      });
    }
  }
}
