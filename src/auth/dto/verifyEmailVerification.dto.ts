import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/output.dto';

@ObjectType()
export class VerifyEmailVerificationOutput extends CoreOutput {}

@InputType()
export class VerifyEmailVerificationInput {
  @Field()
  publicCode: string;
}
