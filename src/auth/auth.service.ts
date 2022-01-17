import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import {
  bindRefreshTokenToCookie,
  createTokens,
  customError,
} from 'src/common/utilFunc';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { EmailService } from './../email/email.service';
import { UserRole } from './../user/entities/user.entity';
import {
  ForgotPasswordInput,
  ForgotPasswordOutput,
  LoginInput,
  LoginOutput,
  LogoutOutput,
  SignUpInput,
  SignUpOutput,
  VerifyEmailVerificationInput,
  VerifyEmailVerificationOutput,
  VerifyForgotPasswordInput,
  VerifyForgotPasswordOutput,
} from './dto';
import { Verification, VerificationType } from './entities/verification.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Verification)
    private readonly verificationRepo: Repository<Verification>,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async signup({
    email,
    password,
    name,
    role,
  }: SignUpInput): Promise<SignUpOutput> {
    let verification: Verification;
    let user: User;
    try {
      const existed = await this.userRepo.findOne({ email });
      if (existed) return customError('email', 'Email was already registered!');
      if (role === UserRole.Admin || !Object.keys(UserRole).includes(role))
        customError('Role', `You are not allowed to be ${role} role!`);
      user = await this.userRepo.save(
        this.userRepo.create({ email, password, name, role }),
      );
      const { hashedCode, publicCode } = await Verification.createCodes(
        user.id,
      );
      verification = await this.verificationRepo.save(
        this.verificationRepo.create({
          code: hashedCode,
          user,
          verificationType: VerificationType.VerifyEmail,
        }),
      );
      await this.emailService.sendConfirmEmail(email, publicCode);
      return {
        ok: true,
      };
    } catch {
      await Promise.all([
        this.verificationRepo.remove(verification),
        this.userRepo.remove(user),
      ]);
      return customError(
        'Server',
        'Can not register new account. Please try again later',
      );
    }
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

  async logout(req: Request): Promise<LogoutOutput> {
    try {
      // get access token
      const accessToken = req.get('ACCESS_JWT');
      if (!accessToken) return customError('token', 'Invalid token');

      // check token validation
      const decoded = jwt.verify(
        accessToken,
        this.configService.get('ACCESS_TOKEN_SECRET'),
      );
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

  async forgotPassword({
    email,
  }: ForgotPasswordInput): Promise<ForgotPasswordOutput> {
    let verification: Verification;
    try {
      const user = await this.userRepo.findOne({ email });
      if (!user) return customError('Email', 'Email does not exist');
      const { hashedCode, publicCode } = await Verification.createCodes(
        user.id,
      );
      verification = await this.verificationRepo.save(
        this.verificationRepo.create({
          verificationType: VerificationType.ForgotPassword,
          user,
          code: hashedCode,
        }),
      );
      await this.emailService.sendForgotPassword(user.email, publicCode);
      return {
        ok: true,
      };
    } catch (error) {
      await this.verificationRepo.remove(verification);
      return customError(
        'Server',
        'Can not reset your password right now. Try again later',
      );
    }
  }

  async verifyForgotPassword({
    publicCode,
    newPassword,
  }: VerifyForgotPasswordInput): Promise<VerifyForgotPasswordOutput> {
    const id = Verification.getUserIdFromPublicCode(publicCode);
    const user = await this.userRepo.findOne(
      { id },
      {
        select: ['id', 'password'],
      },
    );
    const verification = await this.verificationRepo.findOne({ user });
    if (
      !user ||
      !verification ||
      !verification.compareCodes(publicCode) ||
      verification.verificationType !== VerificationType.ForgotPassword
    )
      return customError('Verification Code', 'Invalid forgot password code!');
    user.password = newPassword;
    await Promise.all([
      this.userRepo.save(user),
      this.verificationRepo.remove(verification),
    ]);
    return {
      ok: true,
    };
  }

  async verifyEmailVerification({
    publicCode,
  }: VerifyEmailVerificationInput): Promise<VerifyEmailVerificationOutput> {
    const id = Verification.getUserIdFromPublicCode(publicCode);
    const user = await this.userRepo.findOne({ id });
    const verification = await this.verificationRepo.findOne({ user });
    if (
      !user ||
      !verification ||
      !verification.compareCodes(publicCode) ||
      verification.verificationType !== VerificationType.VerifyEmail
    )
      return customError(
        'Verification Code',
        'Invalid email verification code!',
      );
    user.verified = true;
    await Promise.all([
      this.userRepo.save(user),
      this.verificationRepo.remove(verification),
    ]);
    return {
      ok: true,
    };
  }
}
