import { Inject, Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import { customError } from 'src/common/utilFunc';
import { ILike, Repository } from 'typeorm';
import { PUB_SUB } from './../common/constants/common.constants';
import { User, UserRole } from './../user/entities/user.entity';
import {
  CREATE_ORDER_ITEM_FAIL,
  INVALID_INPUT_DISH_OPTION,
  INVALID_ORDER_STATUS,
  UPDATE_ORDER_STATUS_INVALID_USER_ID,
} from './constants/errorType';
import {
  NewCookedOrder,
  NewPendingOrderPayload,
  NEW_COOKED_ORDER,
  NEW_PENDING_ORDER,
} from './constants/subscription';
import {
  AddDishToDishGroupInput,
  AddDishToDishGroupOutput,
  CreateDishGroupInput,
  CreateDishGroupOutput,
  CreateOrderInput,
  CreateOrderOutput,
  CreateRestaurantInput,
  CreateRestaurantOutput,
  DeleteDishGroupInput,
  DeleteDishInput,
  DeleteDishOutput,
  DeleteRestaurantInput,
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
  SearchRestaurantByCategoryInput,
  SearchRestaurantByCategoryOutput,
  SearchRestaurantByNameInput,
  SearchRestaurantByNameOutput,
  TopCategoriesOutput,
  TopRestaurantsOutput,
  UpdateDishCommentInput,
  UpdateDishCommentOutput,
  UpdateDishInput,
  UpdateDishOutput,
  UpdateOrderStatusInput,
  UpdateOrderStatusOutput,
  UpdateRestaurantInput,
  UpdateRestaurantOutput,
} from './dto';
import { AddDishCommentInput, AddDishCommentOutput } from './dto/dish.dto';
import { CategoryRepository } from './entities/customEntities/customRestaurantTag.entity';
import { Dish } from './entities/dish.entity';
import { DishComment } from './entities/dishComment.entity';
import { DishGroup } from './entities/dishGroup.entity';
import { Order, OrderItem, OrderStatus } from './entities/order.entity';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantCategory } from './entities/restaurantCategory.entity';

@Injectable()
export class RestaurantService {
  private readonly logger = new Logger('Restaurant Service');
  constructor(
    private readonly categoryRepo: CategoryRepository,
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
    @InjectRepository(Dish) private readonly dishRepo: Repository<Dish>,
    @InjectRepository(DishGroup)
    private readonly dishGroupRepo: Repository<DishGroup>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(DishComment)
    private readonly dishCommentRepo: Repository<DishComment>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @Inject(PUB_SUB) private readonly pubsub: PubSub,
  ) {}

  // restaurant
  async topRestaurant(): Promise<TopRestaurantsOutput> {
    const restaurants = await this.restaurantRepo.find({
      take: 10,
      order: {
        rating: 'DESC',
        totalOrders: 'DESC',
        isPromoted: 'DESC',
      },
    });
    return {
      ok: true,
      restaurants,
    };
  }

  async getRestaurant(input: GetRestaurantInput): Promise<GetRestaurantOutput> {
    const restaurant = await this.restaurantRepo.findOne(
      {
        id: input.restaurantId,
      },
      {
        relations: ['dishGroups'],
      },
    );
    console.log(
      restaurant.dishGroups[0].dishes
        .map((e) => e.dishOptions)[0]
        .map((e) => e.options),
    );
    if (!restaurant) return customError('Restaurant', 'Restaurant not found');
    return {
      ok: true,
      restaurant,
    };
  }

  async searchRestaurantByName({
    page,
    resultsPerPage,
    nameSearchTerm,
  }: SearchRestaurantByNameInput): Promise<SearchRestaurantByNameOutput> {
    const [restaurants, totalResults] = await this.restaurantRepo.findAndCount({
      where: {
        restaurantName: ILike(`%${nameSearchTerm.trim()}%`),
      },
      take: +resultsPerPage,
      skip: +(page - 1) * +resultsPerPage,
      order: {
        isPromoted: 'DESC',
        rating: 'DESC',
      },
    });
    return {
      ok: true,
      restaurants,
      totalResults,
      totalPages: Math.ceil(totalResults / +resultsPerPage),
    };
  }
  async searchRestaurantByCategory({
    resultsPerPage,
    page,
    categorySearchTerm,
  }: SearchRestaurantByCategoryInput): Promise<SearchRestaurantByCategoryOutput> {
    const categories = await this.categoryRepo.find({
      where: {
        name: ILike(`%${categorySearchTerm.trim()}%`),
      },
      relations: ['restaurants', 'restaurants.dishGroups'],
    });
    if (!categories || categories.length === 0)
      return customError(
        'Category',
        `Can not find any restaurant with category ${categorySearchTerm}`,
      );
    const restaurants: Restaurant[] = Array.from(
      new Set(
        categories
          .map((category) => category.restaurants)
          .flat()
          .filter((_, index) => {
            const skip = (+page - 1) * +resultsPerPage;
            const end = skip + +resultsPerPage;
            return index >= skip && index < end;
          })
          .reduce(
            (acc, cur) => {
              if (!acc[1].includes(cur.id)) {
                acc[1].push(cur.id);
                acc[0].push(cur);
              }
              return acc;
            },
            [[], []],
          )[0],
      ),
    );
    return {
      ok: true,
      totalResults: restaurants.length,
      totalPages: Math.ceil(restaurants.length / +resultsPerPage),
      restaurants,
      suggestedCategories: categories.filter((_, index) => index < 10),
    };
  }

  async createRestaurant(
    owner: User,
    input: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    const exist = await this.restaurantRepo.findOne({
      restaurantName: input.restaurantName,
    });
    if (exist) return customError('Name', 'Restaurant name already existed');

    let categories: RestaurantCategory[];
    if (input.categoryNames && input.categoryNames.length > 0)
      categories = await Promise.all(
        input.categoryNames.map((name) =>
          this.categoryRepo.getCategoryByName(name),
        ),
      );
    await this.restaurantRepo.save(
      this.restaurantRepo.create({ ...input, categories, owner }),
    );
    return {
      ok: true,
    };
  }

  async updateRestaurant(
    owner: User,
    input: UpdateRestaurantInput,
  ): Promise<UpdateRestaurantOutput> {
    const restaurant = await this.restaurantRepo.findOne({
      id: input.restaurantId,
    });
    if (!restaurant || restaurant.ownerId !== owner.id)
      return customError('Id', 'Invalid Restaurant');
    Object.entries(input).forEach(([key, val]) => {
      if (val) restaurant[key] = val;
    });
    // update categories (override old data with the given data)
    if (input.categoryNames && input.categoryNames.length > 0) {
      const categories = await Promise.all(
        input.categoryNames.map((name) =>
          this.categoryRepo.getCategoryByName(name),
        ),
      );
      restaurant.categories = categories;
    }
    await this.restaurantRepo.save(restaurant);
    return {
      ok: true,
    };
  }
  async deleteRestaurant(owner: User, { restaurantId }: DeleteRestaurantInput) {
    const restaurant = await this.restaurantRepo.findOne({ id: restaurantId });
    if (!restaurant) return customError('Id', 'Restaurant does not exist');
    if (restaurant.ownerId !== owner.id)
      return customError('User', 'You are not the owner of the restaurant');
    await this.restaurantRepo.remove(restaurant);
  }

  // dish group
  async createDishGroup(
    owner: User,
    { restaurantId, dishGroupName }: CreateDishGroupInput,
  ): Promise<CreateDishGroupOutput> {
    const restaurant = await this.restaurantRepo.findOne({ id: restaurantId });
    if (!restaurant)
      return customError('Restaurant', 'Restaurant does not exist');
    const existed = await this.dishGroupRepo.findOne({
      dishGroupName,
      restaurant,
    });
    if (existed)
      return customError(
        'Dish Group',
        'Dish group already existed in the restaurant',
      );

    if (restaurant.ownerId !== owner.id)
      return customError('Onwer', 'You are not the owner of the restaurant');
    await this.dishGroupRepo.save(
      this.dishGroupRepo.create({
        restaurant,
        dishGroupName,
      }),
    );
    return {
      ok: true,
    };
  }

  async deleteDishGroup(
    owner: User,
    { dishGroupId }: DeleteDishGroupInput,
  ): Promise<CreateDishGroupOutput> {
    const dishGroup = await this.dishGroupRepo.findOne(
      { id: dishGroupId },
      { relations: ['restaurant'] },
    );
    if (!dishGroup)
      return customError('Dish Group', 'Dish group does not exist');
    if (dishGroup.restaurant.ownerId !== owner.id)
      return customError('Onwer', 'You are not the owner of the restaurant');
    await this.dishGroupRepo.remove(dishGroup);
    return {
      ok: true,
    };
  }

  // dish
  async getDish({ dishId }: GetDishInput): Promise<GetDishOutput> {
    const dish = await this.dishRepo.findOne(
      { id: dishId },
      {
        relations: ['comments', 'comments.user'],
      },
    );
    if (!dish) return customError('Dish', 'Dish not found');
    return {
      ok: true,
      dish,
    };
  }
  async addDishToDishGroup(
    owner: User,
    input: AddDishToDishGroupInput,
  ): Promise<AddDishToDishGroupOutput> {
    const dishGroup = await this.dishGroupRepo.findOne(
      {
        id: input.dishGroupId,
      },
      { relations: ['restaurant'] },
    );
    if (!dishGroup)
      return customError('Dish group', 'Dish Group does not exist');

    // check dish name existed
    const exist = await this.dishRepo.findOne({
      name: input.name,
      restaurant: dishGroup.restaurant,
    });
    if (exist)
      return customError(
        'Dish name',
        'Dish name alreadry existed in this restaurant',
      );

    if (dishGroup.restaurant.ownerId !== owner.id)
      return customError('Onwer', 'You are not the owner of the restaurant');

    await this.dishRepo.save(
      this.dishRepo.create({
        ...input,
        restaurant: dishGroup.restaurant,
        dishGroup,
      }),
    );
    return {
      ok: true,
    };
  }

  async deleteDish(
    owner: User,
    { dishId }: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    const dish = await this.dishRepo.findOne(
      {
        id: dishId,
      },
      { relations: ['restaurant'] },
    );
    if (!dish) return customError('Dish', 'Dish does not exist');
    if (dish.restaurant.ownerId !== owner.id)
      return customError('Onwer', 'You are not the owner of the restaurant');
    await this.dishRepo.remove(dish);
    return {
      ok: true,
    };
  }

  async updateDish(
    owner: User,
    input: UpdateDishInput,
  ): Promise<UpdateDishOutput> {
    const dish = await this.dishRepo.findOne(
      {
        id: input.dishId,
      },
      { relations: ['restaurant'] },
    );
    if (!dish) return customError('Dish', 'Dish does not exist');
    if (dish.restaurant.ownerId !== owner.id)
      return customError('Onwer', 'You are not the owner of the restaurant');
    Object.entries(input).forEach(([k, v]) => {
      if (v) dish[k] = v;
    });
    await this.dishRepo.save(dish);
    return {
      ok: true,
    };
  }

  // order
  async createOrder(
    customer: User,
    input: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const newOrderItemsPromise = input.orderItemsInput.map(
        async (orderItem) => {
          const dish = await this.dishRepo.findOne({ id: orderItem.dishId });
          if (!dish || dish.restaurantId !== +input.restaurantId)
            throw new Error(CREATE_ORDER_ITEM_FAIL);
          return this.orderItemRepo.create({
            dish,
            ...orderItem,
          });
        },
      );
      const newOrderItems = await Promise.all(newOrderItemsPromise);
      const restaurant = await this.restaurantRepo.findOne({
        id: input.restaurantId,
      });
      if (!restaurant)
        return customError('Restaurant id', 'Invalid restaurant id');
      const order = await this.orderRepo.save(
        this.orderRepo.create({
          customer,
          restaurant,
          orderItems: newOrderItems,
          ...input,
          deliveryTime: new Date(input.deliveryTime),
        }),
      );

      // subscription publish
      const payload: NewPendingOrderPayload = {
        order,
      };
      this.pubsub.publish(NEW_PENDING_ORDER, payload);
      return {
        ok: true,
      };
    } catch (error) {
      if (error.message === CREATE_ORDER_ITEM_FAIL)
        return customError('Dish Id', 'Invalid dish id or restaurant id');
      if (error.message === INVALID_INPUT_DISH_OPTION)
        return customError('Choosen Option', 'Invalid input dish option');
      return customError('Order', 'Create order fail');
    }
  }

  async getOrders(
    user: User,
    { orderStatus }: GetOrdersInput,
  ): Promise<GetOrdersOuput> {
    let orders: Order[] = [];
    switch (user.role) {
      case UserRole.Customer:
        orders = await this.orderRepo.find({
          where: {
            customer: user,
            ...(orderStatus && { orderStatus }),
          },
          order: {
            updatedAt: 'DESC',
          },
        });
        break;
      case UserRole.Driver:
        orders = await this.orderRepo.find({
          where: {
            driver: user,
            ...(orderStatus && { orderStatus }),
          },
          order: {
            updatedAt: 'DESC',
          },
        });
        break;
      case UserRole.Owner:
        const restaurants = await this.restaurantRepo.find({
          where: {
            owner: user,
          },
          relations: ['orders'],
        });
        orders = restaurants.map((restaurant) => restaurant.orders).flat();
        if (orderStatus)
          orders = orders
            .filter((order) => order.orderStatus === orderStatus)
            .sort((a, b) => {
              return b.updatedAt.getTime() - a.updatedAt.getTime();
            });
        break;
    }
    return {
      ok: true,
      orders,
    };
  }

  async getOrder(
    user: User,
    { orderId }: GetOrderInput,
  ): Promise<GetOrderOuput> {
    const order: Order = await this.orderRepo.findOne(
      { id: orderId },
      { relations: ['restaurant'] },
    );
    if (!order) return customError('Order id', 'Order does not exist');
    if (!Order.canAccess(user, order))
      return customError('User', 'You are not allowed to access this order');
    return {
      ok: true,
      order,
    };
  }

  async updateOrderStatus(
    user: User,
    { orderId, orderStatus: newStatus }: UpdateOrderStatusInput,
  ): Promise<UpdateOrderStatusOutput> {
    try {
      const order = await this.orderRepo.findOne(
        { id: orderId },
        {
          relations: ['restaurant'],
        },
      );
      if (!order) return customError('Order id', 'Order does not exist');

      order.setStatus(user, newStatus);
      await this.orderRepo.save(order);
      if (newStatus === OrderStatus.RestaurantCooked) {
        const payload: NewCookedOrder = {
          order,
        };
        this.pubsub.publish(NEW_COOKED_ORDER, payload);
      }
      return {
        ok: true,
      };
    } catch (error) {
      if (error.message === INVALID_ORDER_STATUS)
        return customError('Order status', 'Invalid order status');
      if (error.message === UPDATE_ORDER_STATUS_INVALID_USER_ID)
        return customError(
          'Order status',
          'You are not allowed to update order status',
        );
      return customError('Error', error.message);
    }
  }

  async registerDriver(
    driver: User,
    { orderId }: RegisterDriverInput,
  ): Promise<RegisterDriverOutput> {
    const order = await this.orderRepo.findOne(
      { id: orderId },
      {
        relations: ['restaurant'],
      },
    );
    if (!order) return customError('Order id', 'Order does not exist');
    if (order.driverId)
      return customError('Driver', 'This order already has a driver');
    order.driver = driver;
    await this.orderRepo.save(order);
    return {
      ok: true,
    };
  }

  // dish comment
  async addDishComment(
    customer: User,
    input: AddDishCommentInput,
  ): Promise<AddDishCommentOutput> {
    const orderItem = await this.orderItemRepo.findOne(
      { id: input.orderItemId },
      { relations: ['order'] },
    );
    if (!orderItem) return customError('Order Item', 'Order item not found');
    if (!orderItem.dishId) return customError('Dish', 'Dish has been deleted');
    if (orderItem.order.customerId !== customer.id)
      return customError('User', 'You are not allowed');
    const dish = await this.dishRepo.findOne(
      {
        id: orderItem.dishId,
      },
      { relations: ['comments', 'restaurant', 'restaurant.dishGroups'] },
    );
    if (dish.comments?.map((comment) => comment.userId).includes(customer.id))
      return customError('Comment', 'User already commented');
    const comment = this.dishCommentRepo.create({
      ...input,
      user: customer,
      dish,
    });
    if (!dish.comments) dish.comments = [comment];
    else dish.comments.push(comment);
    dish.restaurant.calculateRatings();
    dish.updatedAt = new Date();
    await this.dishRepo.save(dish);
    return {
      ok: true,
    };
  }

  async updateDishComment(
    user: User,
    input: UpdateDishCommentInput,
  ): Promise<UpdateDishCommentOutput> {
    const comment = await this.dishCommentRepo.findOne({
      id: input.dishCommentId,
    });
    if (comment.userId !== user.id)
      return customError('User', 'You are not allowed');
    Object.entries(input).forEach(([k, v]) => {
      if (v) comment[k] = v;
    });
    await this.dishCommentRepo.save(comment);
    const dish = await this.dishRepo.findOne(
      { id: comment.dishId },
      { relations: ['comments'] },
    );
    dish.updatedAt = new Date();
    await this.dishRepo.save(dish);
    return {
      ok: true,
    };
  }

  // category
  async topRestaurantCategories(): Promise<TopCategoriesOutput> {
    const categories = await this.categoryRepo.find({
      order: {
        totalRestaurants: 'DESC',
      },
    });
    return {
      ok: true,
      restaurantCategories: categories,
    };
  }

  // interval jobs
  @Interval(12 * 60 * 60 * 1000) // 12h
  async deleteUnnecessaryRestaurantCategories() {
    const categories = await this.categoryRepo.find({
      relations: ['restaurants'],
    });
    const deleteCategories = categories.filter((category) => {
      return !category.restaurants || category.restaurants.length === 0;
    });
    await this.categoryRepo.remove(deleteCategories);
    this.logger.log('Delete unecessary restaurant categories');
  }
}
