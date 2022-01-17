import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/output.dto';

@ObjectType()
export class ForgotPasswordOutput extends CoreOutput {}

@InputType()
export class ForgotPasswordInput {
  @Field()
  email: string;
}
