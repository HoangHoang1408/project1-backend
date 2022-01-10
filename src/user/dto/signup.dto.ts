import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from '../../common/dto/output.dto';
import { User } from './../entities/user.entity';

@InputType()
export class SignUpInput extends PickType(User, [
  'email',
  'password',
  'name',
]) {}

@ObjectType()
export class SignUpOutput extends CoreOutput {}
