import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { compare, hash } from 'bcrypt';
import { randomBytes } from 'crypto';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

export enum VerificationType {
  ForgotPassword = 'ForgotPassword',
  VerifyEmail = 'VerifyEmail',
}
registerEnumType(VerificationType, {
  name: 'VerificationType',
});

@Entity()
@ObjectType()
export class Verification extends CoreEntity {
  @Field(() => User)
  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @Field(() => VerificationType)
  @Column('enum', {
    enum: VerificationType,
  })
  verificationType: VerificationType;

  @Field()
  @Column()
  code: string;

  static async createCodes(userId: number) {
    const [a, b] = [1, 2].map(() =>
      randomBytes(8).toString('hex').replace(new RegExp('id', 'g'), 'ab'),
    );
    const publicCode = `${a}id${userId}id${b}`;
    const hashedCode = await hash(publicCode, 12);
    return { publicCode, hashedCode };
  }
  static getUserIdFromPublicCode(publicCode: string) {
    return +publicCode.split('id')[1];
  }
  async compareCodes(publicCode: string) {
    return compare(publicCode, this.code);
  }
}
