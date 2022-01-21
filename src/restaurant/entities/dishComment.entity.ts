import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsInt, Max, Min } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { User } from './../../user/entities/user.entity';
import { Dish } from './dish.entity';

@InputType('DishCommentInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class DishComment extends CoreEntity {
  @Field()
  @Column()
  text: string;

  @Field(() => User)
  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  user: User;

  @RelationId((comment: DishComment) => comment.user)
  userId: number;

  @Field(() => Dish)
  @ManyToOne(() => Dish, (dish) => dish.comments, {
    onDelete: 'CASCADE',
  })
  dish: Dish;

  @RelationId((comment: DishComment) => comment.dish)
  dishId: number;

  @Field()
  @Column()
  @IsInt()
  @Min(0)
  @Max(5)
  rating: number;
}
