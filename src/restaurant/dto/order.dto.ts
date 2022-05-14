import { Field, ID, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { ValidateNested } from 'class-validator';
import { CoreOutput } from './../../common/dto/output.dto';
import { Order, OrderItem, OrderStatus } from './../entities/order.entity';

@InputType()
export class CreateOrderItemInput extends PickType(OrderItem, [
  'extraRequirement',
  'quantity',
  'choosenOptions',
]) {
  @Field(() => ID)
  dishId: number;
}

@InputType()
export class CreateOrderInput extends PickType(Order, [
  'addressDetail',
  'deliveryAddress',
  'deliveryNote',
  'deliveryTime',
  'addressCoordinates',
  'method',
]) {
  @Field(() => [CreateOrderItemInput])
  @ValidateNested()
  orderItemsInput: CreateOrderItemInput[];

  @Field(() => ID)
  restaurantId: number;
}

@ObjectType()
export class CreateOrderOutput extends CoreOutput {}

@InputType()
export class UpdateOrderStatusInput extends PickType(Order, ['orderStatus']) {
  @Field()
  orderId: number;
}

@ObjectType()
export class UpdateOrderStatusOutput extends CoreOutput {}

@InputType()
export class RegisterDriverInput {
  @Field()
  orderId: number;
}

@ObjectType()
export class RegisterDriverOutput extends CoreOutput {}

@InputType()
export class GetOrdersInput {
  @Field(() => OrderStatus, { nullable: true })
  orderStatus?: OrderStatus;
}

@ObjectType()
export class GetOrdersOuput extends CoreOutput {
  @Field(() => [Order], { nullable: true })
  orders?: Order[];
}

@InputType()
export class GetOrderInput {
  @Field()
  orderId: number;
}

@ObjectType()
export class GetOrderOuput extends CoreOutput {
  @Field(() => Order, { nullable: true })
  order?: Order;
}
