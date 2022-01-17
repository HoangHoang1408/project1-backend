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
  IsUrl,
  ValidateNested,
} from 'class-validator';
import * as jwt from 'jsonwebtoken';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import { v4 } from 'uuid';

@InputType('ImageInputType')
@ObjectType()
class Image {
  @Field()
  @IsString()
  imagePath: string;

  @Field()
  @IsUrl()
  imageUrl: string;
}

export enum UserRole {
  Client = 'Client',
  
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

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (!this.password) return;
    this.password = await bcrypt.hash(this.password, 10);
  }

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
          expiresIn: '15m',
        },
      ),
      refreshToken: jwt.sign(
        { userId: this.id, tokenVersion },
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: '30d',
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
