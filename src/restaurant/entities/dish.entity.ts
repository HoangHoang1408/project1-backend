import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  IsNumber,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Image } from 'src/common/dto/objectType';
import { CoreEntity } from 'src/common/entities/core.entity';
import {
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  RelationId,
} from 'typeorm';
import { DishOption } from './../constants/objectType';
import { DishComment } from './dishComment.entity';
import { DishGroup } from './dishGroup.entity';
import { Restaurant } from './restaurant.entity';

@InputType('DishInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Dish extends CoreEntity {
  @Field()
  @Column()
  name: string;

  @Field(() => Image, { nullable: true })
  @Column('json', { nullable: true })
  dishImage: Image;

  @Field()
  @Column('numeric')
  price: number;

  @Field({ nullable: true })
  @Column('numeric', { nullable: true })
  averageRating: number;

  @Field()
  @Column()
  description: string;

  @Field({ nullable: true })
  @Column('numeric', { nullable: true, default: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  discount?: number;

  @Field(() => [DishOption], { nullable: true })
  @ValidateNested()
  @Column('json', { nullable: true })
  dishOptions?: DishOption[];

  @Field(() => Restaurant)
  @ManyToOne(() => Restaurant, {
    onDelete: 'CASCADE',
    eager: true,
  })
  restaurant: Restaurant;

  @RelationId((dish: Dish) => dish.restaurant)
  restaurantId: number;

  @Field(() => DishGroup)
  @ManyToOne(() => DishGroup, {
    onDelete: 'CASCADE',
  })
  dishGroup: DishGroup;

  @RelationId((dish: Dish) => dish.dishGroup)
  dishGroupId: number;

  @Field(() => [DishComment], { nullable: true })
  @OneToMany(() => DishComment, (comment) => comment.dish, {
    nullable: true,
    cascade: true,
  })
  comments?: DishComment[];

  @BeforeUpdate()
  calculateRatings() {
    if (!(this.comments && this.comments.length > 0)) return;
    const ratings = this.comments.map((comment) => +comment.rating);
    this.averageRating = Math.round(
      ratings.reduce((acc, cur) => acc + cur, 0) / ratings.length,
    );
  }
}
