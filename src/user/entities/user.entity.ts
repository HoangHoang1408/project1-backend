import { Field, InputType, ObjectType } from '@nestjs/graphql';
import * as bcrypt from 'bcrypt';
import { IsEmail, IsPhoneNumber } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Field()
  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Field()
  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  tokenVersion?: string;

  @Field()
  @Column()
  name: string;

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
}
