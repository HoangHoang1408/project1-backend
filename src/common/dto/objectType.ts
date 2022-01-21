import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, IsUrl } from 'class-validator';
@InputType('ImageInputType')
@ObjectType()
export class Image {
  @Field()
  @IsString()
  imagePath: string;

  @Field()
  @IsUrl()
  imageUrl: string;
}
