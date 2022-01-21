import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Length, ValidateNested } from 'class-validator';
import { Image } from 'src/common/dto/objectType';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@InputType('RestaurantCategoryInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class RestaurantCategory extends CoreEntity {
  @Field()
  @Column({ unique: true })
  @Length(1, 50)
  name: string;

  @Field(() => Image, { nullable: true })
  @Column('json', { nullable: true })
  @ValidateNested()
  coverImage: Image;

  @Field()
  @Column({ unique: true })
  slug: string;

  @Field(() => [Restaurant])
  @ManyToMany(() => Restaurant, (res) => res.categories)
  @JoinTable()
  restaurants: Restaurant[];
}
