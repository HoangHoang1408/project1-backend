import {
  Field,
  ID,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/output.dto';
import { Dish } from './../entities/dish.entity';
import { DishComment } from './../entities/dishComment.entity';

@InputType()
export class AddDishToDishGroupInput extends PickType(Dish, [
  'name',
  'price',
  'description',
  'discount',
  'dishImage',
  'dishOptions',
]) {
  @Field(() => ID)
  dishGroupId: number;
}

@ObjectType()
export class AddDishToDishGroupOutput extends CoreOutput {}

@InputType()
export class GetDishInput {
  @Field(() => ID)
  dishId: number;
}

@ObjectType()
export class GetDishOutput extends CoreOutput {
  @Field(() => Dish, { nullable: true })
  dish?: Dish;
}

@InputType()
export class GetDishBySlugInput {
  @Field()
  slug: string;
}

@InputType()
export class DeleteDishInput {
  @Field(() => ID)
  dishId: number;
}

@ObjectType()
export class DeleteDishOutput extends CoreOutput {}

@InputType()
export class UpdateDishInput extends PartialType(
  PickType(Dish, [
    'name',
    'price',
    'description',
    'discount',
    'dishImage',
    'dishOptions',
  ]),
) {
  @Field(() => ID)
  dishId: number;
}

@ObjectType()
export class UpdateDishOutput extends CoreOutput {}

// dish comment
@InputType()
export class AddDishCommentInput extends PickType(DishComment, [
  'text',
  'rating',
]) {
  @Field(() => ID)
  orderItemId: number;
}

@ObjectType()
export class AddDishCommentOutput extends CoreOutput {}

@InputType()
export class UpdateDishCommentInput extends PartialType(
  PickType(DishComment, ['text', 'rating']),
) {
  @Field(() => ID)
  dishCommentId: number;
}

@ObjectType()
export class UpdateDishCommentOutput extends CoreOutput {}
