import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  IsLatitude,
  IsLongitude,
  IsNumber,
  ValidateNested,
} from 'class-validator';

@InputType('OptionInputType')
@ObjectType()
export class Option {
  @Field()
  optionName: string;

  @Field()
  @IsNumber({ maxDecimalPlaces: 2 })
  extraPrice: number;
}

@InputType('DishOptionInputType')
@ObjectType()
export class DishOption {
  @Field()
  typeName: string;

  @Field(() => [Option])
  @ValidateNested()
  options: Option[];
}

@InputType('ChoosenOptionInputType')
@ObjectType()
export class ChoosenOption {
  @Field()
  typeName: string;

  @Field()
  optionName: string;
}

@InputType('CoordinateInputType')
@ObjectType()
export class Coordinates {
  @Field()
  @IsLatitude()
  latitude: number;

  @Field()
  @IsLongitude()
  longtitude: number;
}
