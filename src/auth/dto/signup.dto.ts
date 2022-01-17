import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from '../../common/dto/output.dto';
import { User, UserRole } from '../../user/entities/user.entity';

@InputType()
export class SignUpInput extends PickType(User, ['email', 'password', 'name']) {
  @Field(() => UserRole)
  role: UserRole;
}

@ObjectType()
export class SignUpOutput extends CoreOutput {}
