import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/output.dto';

@ObjectType()
export class VerifyForgotPasswordOutput extends CoreOutput {}

@InputType()
export class VerifyForgotPasswordInput {
  @Field()
  publicCode: string;

  @Field()
  newPassword: string;
}
