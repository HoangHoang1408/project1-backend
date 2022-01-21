import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import * as bcrypt from 'bcrypt';
import {
  IsEmail,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import * as jwt from 'jsonwebtoken';
import { Image } from 'src/common/dto/objectType';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import { v4 } from 'uuid';
import { Order } from './../../restaurant/entities/order.entity';
import { Restaurant } from './../../restaurant/entities/restaurant.entity';

export enum UserRole {
  Customer = 'Customer',
  Owner = 'Owner',
  Driver = 'Driver',
  Admin = 'Admin',
}

registerEnumType(UserRole, {
  name: 'UserRole',
});

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Field()
  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Field()
  @Column({ default: false })
  verified: boolean;

  @Field()
  @Column({ select: false })
  @IsString()
  password: string;

  @Field()
  @Column()
  @IsString()
  name: string;

  @Field(() => UserRole)
  @Column('enum', {
    enum: UserRole,
  })
  role: UserRole;

  @Field(() => Image, { nullable: true })
  @Column('json', { nullable: true })
  @ValidateNested()
  avatarImage?: Image;

  @Field(() => Image, { nullable: true })
  @Column('json', { nullable: true })
  @ValidateNested()
  backgroundImage?: Image;

  @Column('simple-array', { nullable: true })
  tokenVersions?: string[];

  @Field({ nullable: true })
  @Column({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  @IsPhoneNumber('VN')
  phoneNumber?: string;

  @Field(() => [Restaurant], { nullable: true })
  @OneToMany(() => Restaurant, (restaurant) => restaurant.owner, {
    nullable: true,
    lazy: true,
  })
  restaurants?: Restaurant[];

  @Field(() => [Order], { nullable: true })
  @OneToMany(() => Order, (order) => order.customer, {
    nullable: true,
  })
  orders?: Order[];

  @Field(() => [Order], { nullable: true })
  @OneToMany(() => Order, (order) => order.driver, {
    nullable: true,
  })
  rides?: Order[];

  // listeners
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (!this.password) return;
    this.password = await bcrypt.hash(this.password, 10);
  }

  // util funcs
  checkPassword(inputPassword: string): Promise<boolean> {
    return bcrypt.compare(inputPassword, this.password);
  }
  createTokens() {
    const tokenVersion = v4();
    return {
      accessToken: jwt.sign(
        { userId: this.id },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
        },
      ),
      refreshToken: jwt.sign(
        { userId: this.id, tokenVersion },
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
        },
      ),
      tokenVersion,
    };
  }
  removeOldTokenVersion(oldTokenVersion: string) {
    if (!this.tokenVersions) return;
    this.tokenVersions = this.tokenVersions.filter(
      (tokenVersion) => tokenVersion !== oldTokenVersion,
    );
  }
  addNewTokenVersion(tokenVersion: string) {
    if (!this.tokenVersions) this.tokenVersions = [];
    this.tokenVersions.push(tokenVersion);
  }
}
