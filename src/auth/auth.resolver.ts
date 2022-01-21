import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { CustomContext } from './../common/constants/common.constants';
import { AuthService } from './auth.service';
import {
  ForgotPasswordInput,
  ForgotPasswordOutput,
  LoginInput,
  LoginOutput,
  SignUpInput,
  SignUpOutput,
  VerifyEmailVerificationInput,
  VerifyEmailVerificationOutput,
  VerifyForgotPasswordInput,
  VerifyForgotPasswordOutput,
} from './dto';

@Resolver()
export class AuthResolver {
  constructor(private readonly authSer: AuthService) {}
  @Mutation(() => LoginOutput)
  login(
    @Args('input') input: LoginInput,
    @Context() ctx: CustomContext,
  ): Promise<LoginOutput> {
    return this.authSer.login(input, ctx.res);
  }

  @Mutation(() => SignUpOutput)
  signup(@Args('input') input: SignUpInput): Promise<SignUpOutput> {
    return this.authSer.signup(input);
  }

  @Mutation(() => VerifyEmailVerificationOutput)
  verifyEmailVerification(@Args('input') input: VerifyEmailVerificationInput) {
    return this.authSer.verifyEmailVerification(input);
  }

  @Mutation(() => ForgotPasswordOutput)
  forgotPassword(@Args('input') input: ForgotPasswordInput) {
    return this.authSer.forgotPassword(input);
  }

  @Mutation(() => VerifyForgotPasswordOutput)
  verifyForgotPassword(@Args('input') input: VerifyForgotPasswordInput) {
    return this.authSer.verifyForgotPassword(input);
  }
}
