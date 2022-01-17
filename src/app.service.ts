import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { REFRESH_JWT } from './common/constants/common.constants';
import { bindRefreshTokenToCookie } from './common/utilFunc';
import { User } from './user/entities/user.entity';
@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly configService: ConfigService,
  ) {}
  private async checkRefreshTokenAndRemoveOldTokenVersion(req: Request) {
    const refreshToken = req.cookies[REFRESH_JWT];
    if (!refreshToken) throw new BadRequestException('Invalid token');
    const decoded = jwt.verify(
      refreshToken,
      this.configService.get('REFRESH_TOKEN_SECRET'),
    );
    const userId = decoded['userId'];
    const oldTokenVersion = decoded['tokenVersion'];
    if (!decoded || !userId || !oldTokenVersion)
      throw new BadRequestException('Invalid token');
    const user = await this.userRepo.findOne({ id: userId });
    if (!user) throw new BadRequestException('Invalid token');
    if (!user.tokenVersions.includes(oldTokenVersion))
      throw new BadRequestException('Already logged out');
    user.removeOldTokenVersion(oldTokenVersion);
    return user;
  }
  private generateTokensAndBindToCookie(user: User, res: Response) {
    const {
      accessToken,
      refreshToken: newRefreshToken,
      tokenVersion: newTokenVersion,
    } = user.createTokens();
    user.addNewTokenVersion(newTokenVersion);
    bindRefreshTokenToCookie(res, newRefreshToken);
    return {
      userWithNewTokenVersion: user,
      accessToken,
    };
  }

  async getNewTokens(req: Request, res: Response) {
    try {
      const user = await this.checkRefreshTokenAndRemoveOldTokenVersion(req);
      const { accessToken, userWithNewTokenVersion } =
        this.generateTokensAndBindToCookie(user, res);
      await this.userRepo.save(userWithNewTokenVersion);

      res.status(200).json({
        ok: true,
        accessToken,
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError)
        throw new BadRequestException('Token expired');
      throw new BadRequestException('Invalid token');
    }
  }

  async logout(req: Request) {
    try {
      const user = await this.checkRefreshTokenAndRemoveOldTokenVersion(req);
      await this.userRepo.save(user);
      return {
        ok: true,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError)
        throw new BadRequestException('Token expired');
      throw new BadRequestException('Invalid token');
    }
  }

  async logoutAll(req: Request) {
    try {
      const user = await this.checkRefreshTokenAndRemoveOldTokenVersion(req);
      user.tokenVersions = null;
      await this.userRepo.save(user);
      return {
        ok: true,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError)
        throw new BadRequestException('Token expired');
      throw new BadRequestException('Invalid token');
    }
  }
}
