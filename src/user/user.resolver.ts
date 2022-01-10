import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CustomContext } from './../common/constants/common.constants';
import { CoreOutput } from './../common/dto/output.dto';
import { LoginInput, LoginOutput } from './dto/login.dto';
import { SignUpInput, SignUpOutput } from './dto/signup.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => SignUpOutput)
  signup(@Args('input') input: SignUpInput): Promise<SignUpOutput> {
    return this.userService.signup(input);
  }

  @Query(() => LoginOutput)
  login(
    @Args('input') input: LoginInput,
    @Context() ctx: CustomContext,
  ): Promise<LoginOutput> {
    return this.userService.login(input, ctx.res);
  }

  @Mutation(() => CoreOutput)
  logout(@Context() ctx: CustomContext): Promise<CoreOutput> {
    return this.userService.logout(ctx.req);
  }
}
