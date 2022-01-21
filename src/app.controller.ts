import { Controller, Get, Req, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { AppService } from './app.service';
import { User } from './user/entities/user.entity';

@Controller('refresh-jwt')
export class AppController {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly appService: AppService,
  ) {}

  @Get('new-refresh-token')
  async getNewTokens(@Req() req: Request, @Res() res: Response) {
    return this.appService.getNewTokens(req, res);
  }

  @Get('logout')
  async logout(@Req() req: Request) {
    return this.appService.logout(req);
  }

  @Get('logout-all')
  async logoutAllDevice(@Req() req: Request) {
    return this.appService.logoutAll(req);
  }
  
  
}
