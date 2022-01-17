import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Role } from 'src/auth/role.decorator';
import { CurrentUser } from './../auth/user.decorator';
import { MeOutPut, UpdateUserInput, UpdateUserOutput } from './dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Role(['Any'])
  @Query(() => MeOutPut)
  me(@CurrentUser() user: User) {
    return {
      ok: true,
      user,
    };
  }

  @Role(['Any'])
  @Mutation(() => UpdateUserOutput)
  updateUser(@CurrentUser() user: User, @Args('input') input: UpdateUserInput) {
    return this.userService.updateUser(user, input);
  }
}
