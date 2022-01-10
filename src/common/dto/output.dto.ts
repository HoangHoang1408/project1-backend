import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
class CustomError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
export class CoreOutput {
  @Field()
  ok: boolean;

  @Field(() => CustomError, { nullable: true })
  error?: CustomError;
}
