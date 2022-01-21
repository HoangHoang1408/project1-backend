import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Dish } from './dish.entity';
import { Restaurant } from './restaurant.entity';

@InputType('DishGroupInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class DishGroup extends CoreEntity {
  @Field()
  @Column()
  dishGroupName: string;

  @Field(() => Restaurant)
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.dishGroups)
  restaurant: Restaurant;

  @Field(() => [Dish], { nullable: true })
  @OneToMany(() => Dish, (dish) => dish.dishGroup, {
    eager: true,
    nullable: true,
  })
  dishes?: Dish[];
}
