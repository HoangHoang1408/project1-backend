import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/output.dto';
import { User } from 'src/user/entities/user.entity';

@ObjectType()
export class MeOutPut extends CoreOutput {
  @Field(() => User, { nullable: true })
  user?: User;
}
