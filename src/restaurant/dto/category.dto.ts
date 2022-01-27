import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/output.dto';
import { RestaurantCategory } from '../entities/restaurantCategory.entity';

@ObjectType()
export class TopCategoriesOutput extends CoreOutput {
  @Field(() => [RestaurantCategory], { nullable: true })
  restaurantCategories?: RestaurantCategory[];
}
