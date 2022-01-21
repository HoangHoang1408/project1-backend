import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import { CategoryRepository } from './entities/customEntities/customRestaurantTag.entity';
import { Dish } from './entities/dish.entity';
import { DishComment } from './entities/dishComment.entity';
import { DishGroup } from './entities/dishGroup.entity';
import { Order, OrderItem } from './entities/order.entity';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantResolver } from './restaurant.resolver';
import { RestaurantService } from './restaurant.service';

@Module({
  providers: [
    RestaurantService,
    RestaurantResolver,
    {
      provide: 'PUB_SUB',
      useValue: new PubSub(),
    },
  ],
  imports: [
    TypeOrmModule.forFeature([
      Restaurant,
      Dish,
      DishGroup,
      CategoryRepository,
      Order,
      OrderItem,
      DishComment,
    ]),
  ],
})
export class RestaurantModule {}
