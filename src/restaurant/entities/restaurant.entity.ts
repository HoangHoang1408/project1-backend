import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Image } from 'src/common/dto/objectType';
import { CoreEntity } from 'src/common/entities/core.entity';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  RelationId,
} from 'typeorm';
import { User } from './../../user/entities/user.entity';
import { DishGroup } from './dishGroup.entity';
import { Order } from './order.entity';
import { RestaurantCategory } from './restaurantCategory.entity';

@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
  @Field()
  @Column({ unique: true })
  restaurantName: string;

  @Field()
  @Column()
  address: string;

  @Field(() => Image, { nullable: true })
  @Column('json', { nullable: true })
  backgroundImage: Image;

  @Field({ nullable: true })
  @Column({ nullable: true })
  openTime?: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  closeTime?: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  isPromoted?: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  promoteUtil: Date;

  @Field({ nullable: true })
  @Column('numeric', { nullable: true })
  rating: number;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.restaurants, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  owner?: User;

  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;

  @Field(() => [DishGroup], { nullable: true })
  @OneToMany(() => DishGroup, (dishGroup) => dishGroup.restaurant, {
    nullable: true,
  })
  dishGroups?: DishGroup[];

  @Field(() => [RestaurantCategory], { nullable: true })
  @ManyToMany(() => RestaurantCategory, (category) => category.restaurants, {
    eager: true,
    cascade: true,
    onDelete: 'SET NULL',
    nullable: true,
  })
  categories?: RestaurantCategory[];

  @Field(() => [Order], { nullable: true })
  @OneToMany(() => Order, (order) => order.restaurant, {
    nullable: true,
  })
  orders?: Order[];

  calculateRatings() {
    if (!(this.dishGroups && this.dishGroups.length > 0)) return;
    this.rating = this.dishGroups
      .map((group) => group.dishes)
      .flat()
      .map((dish) => +dish.averageRating)
      .reduce((acc, cur) => {
        if (!cur) return acc;
        return acc + cur;
      }, 0);
  }
}
