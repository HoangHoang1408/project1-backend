import {
  Field,
  ID,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import {
  CoreOutput,
  PaginationInput,
  PaginationOutput,
} from '../../common/dto/output.dto';
import { Restaurant } from '../entities/restaurant.entity';
import { RestaurantCategory } from './../entities/restaurantCategory.entity';

@ObjectType()
export class TopRestaurantsOutput extends CoreOutput {
  @Field(() => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];
}

@InputType()
export class GetRestaurantInput {
  @Field(() => ID)
  restaurantId: number;
}
@ObjectType()
export class GetRestaurantOutput extends CoreOutput {
  @Field(() => Restaurant, { nullable: true })
  restaurant?: Restaurant;
}

@InputType()
export class SearchRestaurantByCategoryInput extends PaginationInput {
  @Field()
  categorySearchTerm: string;
}
@InputType()
export class SearchRestaurantByNameInput extends PaginationInput {
  @Field()
  nameSearchTerm: string;
}

@ObjectType()
export class SearchRestaurantByNameOutput extends PaginationOutput {
  @Field(() => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];
}
@ObjectType()
export class SearchRestaurantByCategoryOutput extends PaginationOutput {
  @Field(() => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];

  @Field(() => [RestaurantCategory], { nullable: true })
  suggestedCategories?: RestaurantCategory[];
}

// create
@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, [
  'restaurantName',
  'address',
  'coordinates',
  'backgroundImage',
  'closeTime',
  'openTime',
]) {
  @Field(() => [String], { nullable: true })
  categoryNames?: string[];
}

@ObjectType()
export class CreateRestaurantOutput extends CoreOutput {}

// udpate
@InputType()
export class UpdateRestaurantInput extends PartialType(CreateRestaurantInput) {
  @Field(() => ID)
  restaurantId: number;
}

@ObjectType()
export class UpdateRestaurantOutput extends CoreOutput {}

// delete
@InputType()
export class DeleteRestaurantInput {
  @Field(() => ID)
  restaurantId: number;
}

@ObjectType()
export class DeleteRestaurantOutput extends CoreOutput {}
