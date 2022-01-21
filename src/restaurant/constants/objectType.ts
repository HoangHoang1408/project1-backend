import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber, ValidateNested } from 'class-validator';

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
