import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from './../../user/entities/user.entity';

@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
  @Field()
  @Column()
  name: string;

  @Field()
  @ManyToOne(() => User, (user) => user, {
    onDelete: 'SET NULL',
    nullable: true,
    lazy: true,
  })
  owner?: User;
}
