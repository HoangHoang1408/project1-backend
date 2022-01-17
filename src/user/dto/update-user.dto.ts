import { InputType, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/output.dto';
import { User } from 'src/user/entities/user.entity';

@InputType()
export class UpdateUserInput extends PartialType(
  PickType(User, [
    'address',
    'password',
    'phoneNumber',
    'avatarImage',
    'backgroundImage',
  ]),
) {}

@ObjectType()
export class UpdateUserOutput extends CoreOutput {}
