import { Inject } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { Roles } from 'src/auth/role.decorator';
import { CurrentUser } from 'src/auth/user.decorator';
import { User } from 'src/user/entities/user.entity';
import { PUB_SUB } from './../common/constants/common.constants';
import {
  NewCookedOrder,
  NewPendingOrderPayload,
  NEW_COOKED_ORDER,
  NEW_PENDING_ORDER,
} from './constants/subscription';
import {
  AddDishCommentInput,
  AddDishCommentOutput,
  AddDishToDishGroupInput,
  AddDishToDishGroupOutput,
  CreateDishGroupInput,
  CreateDishGroupOutput,
  CreateOrderInput,
  CreateOrderOutput,
  CreateRestaurantInput,
  CreateRestaurantOutput,
  DeleteDishGroupInput,
  DeleteDishGroupOutput,
  DeleteDishInput,
  DeleteDishOutput,
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
  GetDishInput,
  GetDishOutput,
  GetOrderInput,
  GetOrderOuput,
  GetOrdersInput,
  GetOrdersOuput,
  GetRestaurantInput,
  GetRestaurantOutput,
  RegisterDriverInput,
  RegisterDriverOutput,
  SearchRestaurantByCategoryOutput,
  SearchRestaurantByNameInput,
  SearchRestaurantByNameOutput,
  UpdateDishCommentInput,
  UpdateDishCommentOutput,
  UpdateDishInput,
  UpdateDishOutput,
  UpdateOrderStatusInput,
  UpdateOrderStatusOutput,
  UpdateRestaurantInput,
  UpdateRestaurantOutput,
} from './dto';
import { SearchRestaurantByCategoryInput } from './dto/restaurant.dto';
import { Order } from './entities/order.entity';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurant.service';

@Resolver(() => Restaurant)
export class RestaurantResolver {
  constructor(
    private readonly restaurantService: RestaurantService,
    @Inject(PUB_SUB) private readonly pubsub: PubSub,
  ) {}

  @Query(() => GetRestaurantOutput)
  getRestaurant(
    @Args('input') input: GetRestaurantInput,
  ): Promise<GetRestaurantOutput> {
    return this.restaurantService.getRestaurant(input);
  }

  @Query(() => SearchRestaurantByCategoryOutput)
  searchRestaurantByCategory(
    @Args('input') input: SearchRestaurantByCategoryInput,
  ): Promise<SearchRestaurantByCategoryOutput> {
    return this.restaurantService.searchRestaurantByCategory(input);
  }

  @Query(() => SearchRestaurantByNameOutput)
  searchRestaurantByName(
    @Args('input') input: SearchRestaurantByNameInput,
  ): Promise<SearchRestaurantByNameOutput> {
    return this.restaurantService.searchRestaurantByName(input);
  }

  @Mutation(() => CreateRestaurantOutput)
  @Roles(['Owner'])
  createRestaurant(
    @CurrentUser() owner: User,
    @Args('input') input: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantService.createRestaurant(owner, input);
  }

  @Mutation(() => UpdateRestaurantOutput)
  @Roles(['Owner'])
  updateRestaurant(
    @CurrentUser() owner: User,
    @Args('input') input: UpdateRestaurantInput,
  ): Promise<UpdateRestaurantOutput> {
    return this.restaurantService.updateRestaurant(owner, input);
  }
  @Mutation(() => DeleteRestaurantOutput)
  @Roles(['Owner'])
  deleteRestaurant(
    @CurrentUser() owner: User,
    @Args('input') input: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    return this.restaurantService.deleteRestaurant(owner, input);
  }

  @Roles(['Owner'])
  @Mutation(() => CreateDishGroupOutput)
  createDishGroup(
    @CurrentUser() owner: User,
    @Args('input') input: CreateDishGroupInput,
  ): Promise<CreateDishGroupOutput> {
    return this.restaurantService.createDishGroup(owner, input);
  }

  @Roles(['Owner'])
  @Mutation(() => DeleteDishGroupOutput)
  deleteDishGroup(
    @CurrentUser() owner: User,
    @Args('input') input: DeleteDishGroupInput,
  ): Promise<DeleteDishGroupOutput> {
    return this.restaurantService.deleteDishGroup(owner, input);
  }

  @Query(() => GetDishOutput)
  getDishDetail(@Args('input') input: GetDishInput): Promise<GetDishOutput> {
    return this.restaurantService.getDish(input);
  }

  @Roles(['Owner'])
  @Mutation(() => AddDishToDishGroupOutput)
  addDishToDishGroup(
    @CurrentUser() owner: User,
    @Args('input') input: AddDishToDishGroupInput,
  ): Promise<AddDishToDishGroupOutput> {
    return this.restaurantService.addDishToDishGroup(owner, input);
  }

  @Roles(['Owner'])
  @Mutation(() => DeleteDishOutput)
  deleteDish(
    @CurrentUser() owner: User,
    @Args('input') input: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    return this.restaurantService.deleteDish(owner, input);
  }

  @Roles(['Owner'])
  @Mutation(() => UpdateDishOutput)
  updateDish(
    @CurrentUser() owner: User,
    @Args('input') input: UpdateDishInput,
  ): Promise<UpdateDishOutput> {
    return this.restaurantService.updateDish(owner, input);
  }

  @Roles(['Customer'])
  @Mutation(() => CreateOrderOutput)
  createOrder(
    @CurrentUser() customer: User,
    @Args('input') input: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.restaurantService.createOrder(customer, input);
  }
  @Roles(['Any'])
  @Mutation(() => GetOrdersOuput)
  getOrders(
    @CurrentUser() customer: User,
    @Args('input') input: GetOrdersInput,
  ): Promise<GetOrdersOuput> {
    return this.restaurantService.getOrders(customer, input);
  }

  @Roles(['Any'])
  @Mutation(() => GetOrderOuput)
  getOrder(
    @CurrentUser() customer: User,
    @Args('input') input: GetOrderInput,
  ): Promise<GetOrderOuput> {
    return this.restaurantService.getOrder(customer, input);
  }

  @Roles(['Any'])
  @Mutation(() => UpdateOrderStatusOutput)
  updateOrderStatus(
    @CurrentUser() user: User,
    @Args('input') input: UpdateOrderStatusInput,
  ): Promise<UpdateOrderStatusOutput> {
    return this.restaurantService.updateOrderStatus(user, input);
  }

  @Roles(['Driver'])
  @Mutation(() => UpdateOrderStatusOutput)
  registerDriver(
    @CurrentUser() user: User,
    @Args('input') input: RegisterDriverInput,
  ): Promise<RegisterDriverOutput> {
    return this.restaurantService.registerDriver(user, input);
  }

  // dish comment
  @Roles(['Customer'])
  @Mutation(() => AddDishCommentOutput)
  addDishComment(
    @CurrentUser() user: User,
    @Args('input') input: AddDishCommentInput,
  ): Promise<AddDishCommentOutput> {
    return this.restaurantService.addDishComment(user, input);
  }

  @Roles(['Customer'])
  @Mutation(() => UpdateDishCommentOutput)
  updateDishComment(
    @CurrentUser() user: User,
    @Args('input') input: UpdateDishCommentInput,
  ): Promise<UpdateDishCommentOutput> {
    return this.restaurantService.updateDishComment(user, input);
  }

  // subscription
  @Roles(['Owner'])
  @Subscription(() => Order, {
    resolve({ order }: NewPendingOrderPayload) {
      return order;
    },
  })
  newPendingOrder() {
    return this.pubsub.asyncIterator(NEW_PENDING_ORDER);
  }

  @Roles(['Driver'])
  @Subscription(() => Order, {
    resolve({ order }: NewCookedOrder) {
      return order;
    },
  })
  newCookedOrder() {
    return this.pubsub.asyncIterator(NEW_COOKED_ORDER);
  }
}
