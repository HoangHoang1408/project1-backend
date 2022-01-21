import {
  Field,
  ID,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CoreOutput } from './../../common/dto/output.dto';
import { Dish } from './../entities/dish.entity';
import { DishGroup } from './../entities/dishGroup.entity';
// create
@InputType()
export class CreateDishGroupInput extends PickType(DishGroup, [
  'dishGroupName',
]) {
  @Field(() => ID)
  restaurantId: number;
}

@ObjectType()
export class CreateDishGroupOutput extends CoreOutput {}

// update




// delete
@InputType()
export class DeleteDishGroupInput {
  @Field(() => ID)
  dishGroupId: number;
}
@ObjectType()
export class DeleteDishGroupOutput extends CoreOutput {}


