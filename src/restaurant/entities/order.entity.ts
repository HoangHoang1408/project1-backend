import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsInt, IsNumber, IsString, Min } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { decimalSum } from 'src/common/utilFunc';
import { User, UserRole } from 'src/user/entities/user.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  RelationId,
} from 'typeorm';
import {
  INVALID_INPUT_DISH_OPTION,
  INVALID_ORDER_STATUS,
  UPDATE_ORDER_STATUS_INVALID_USER_ID,
} from './../constants/errorType';
import { ChoosenOption } from './../constants/objectType';
import { Dish } from './dish.entity';
import { Restaurant } from './restaurant.entity';

export enum OrderStatus {
  PendingOrder = 'PendingOrder',
  RestaurantCooking = 'RestaurantCooking',
  RestaurantReject = 'RestaurantReject',
  RestaurantCooked = 'RestaurantCooked',
  DriverDelivering = 'DriverDelivering',
  DriverDelivered = 'DriverDelivered',
  DriverAbort = 'DriverAbort',
  CustomerReject = 'CustomerReject',
}
registerEnumType(OrderStatus, {
  name: 'OrderStatus',
});

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  @Field()
  @Column()
  deliveryAddress: string;

  @Field()
  @Column()
  addressDetail: string;

  @Field()
  @Column()
  deliveryNote: string;

  @Field()
  @Column()
  deliveryTime: Date;

  @Field()
  @Column('numeric')
  @IsNumber({ maxDecimalPlaces: 2 })
  totalPrice: number;

  @Field(() => OrderStatus)
  @Column('enum', {
    enum: OrderStatus,
    default: OrderStatus.PendingOrder,
  })
  orderStatus: OrderStatus;

  @Field(() => Restaurant, { nullable: true })
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  restaurant?: Restaurant;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (customer) => customer.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  customer?: User;

  @RelationId((order: Order) => order.customer)
  customerId: number;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (driver) => driver.rides, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  driver?: User;

  @RelationId((order: Order) => order.driver)
  driverId: number;

  @Field(() => [OrderItem])
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
  })
  orderItems: OrderItem[];

  // need to load the restauran relation
  setStatus(user: User, newStatus: OrderStatus) {
    let ok = false;
    const checkNewStatusAndSet = (...acceptStatus) => {
      if (!acceptStatus.includes(newStatus))
        throw new Error(INVALID_ORDER_STATUS);
      this.orderStatus = newStatus;
      return (ok = true);
    };
    const oldStatus = this.orderStatus;
    if (user.role === UserRole.Owner) {
      if (user.id !== this.restaurant.ownerId)
        throw new Error(UPDATE_ORDER_STATUS_INVALID_USER_ID);
      if (oldStatus === OrderStatus.PendingOrder)
        checkNewStatusAndSet(
          OrderStatus.RestaurantReject,
          OrderStatus.RestaurantCooking,
        );
      if (oldStatus === OrderStatus.RestaurantCooking)
        checkNewStatusAndSet(OrderStatus.RestaurantCooked);
    }
    if (user.role === UserRole.Driver) {
      if (user.id !== this.driverId)
        throw new Error(UPDATE_ORDER_STATUS_INVALID_USER_ID);
      if (oldStatus === OrderStatus.RestaurantCooked)
        checkNewStatusAndSet(OrderStatus.DriverDelivering);
      if (oldStatus === OrderStatus.DriverDelivering)
        checkNewStatusAndSet(
          OrderStatus.DriverDelivered,
          OrderStatus.CustomerReject,
        );
    }
    if (user.role === UserRole.Customer || user.role === UserRole.Admin)
      throw new Error(UPDATE_ORDER_STATUS_INVALID_USER_ID);
    if (ok) return;
    throw new Error(INVALID_ORDER_STATUS);
  }
  static canAccess(user: User, order: Order): boolean {
    const a = user.role === UserRole.Customer && order.customerId !== user.id;
    const b = user.role === UserRole.Driver && order.driverId !== user.id;
    const c =
      user.role === UserRole.Owner && order.restaurant.ownerId !== user.id;
    if (a || b || c) return false;
    return true;
  }
  @BeforeInsert()
  calculateTotalPrice() {
    let totalPrice = 0;
    this.orderItems.forEach((orderItem) => {
      totalPrice = decimalSum(totalPrice, orderItem.dish.price);
      const dishOptions = orderItem.dish.dishOptions;
      orderItem.choosenOptions.forEach((choosenOption) => {
        const dishOption = dishOptions.find(
          (option) => option.typeName === choosenOption.typeName,
        );
        if (!dishOption) throw new Error(INVALID_INPUT_DISH_OPTION);
        const option = dishOption.options.find((option) => {
          return option.optionName === choosenOption.optionName;
        });
        if (!option) throw new Error(INVALID_INPUT_DISH_OPTION);
        totalPrice = decimalSum(2, totalPrice, +option.extraPrice);
      });
    });
    this.totalPrice = totalPrice;
  }
}

@InputType('OrderItemInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
  @Field(() => Dish)
  @ManyToOne(() => Dish, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  dish?: Dish;

  @RelationId((orderItem: OrderItem) => orderItem.dish)
  dishId?: number;

  @Field()
  @Column()
  @IsString()
  extraRequirement: string;

  @Field()
  @Column()
  @IsInt()
  @Min(0)
  quantity: number;

  @Field(() => [ChoosenOption])
  @Column('json')
  choosenOptions: ChoosenOption[];

  @Field(() => Order)
  @ManyToOne(() => Order, (order) => order.orderItems, {
    onDelete: 'CASCADE',
  })
  order: Order;
}
