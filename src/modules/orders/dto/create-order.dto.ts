import {
  IsArray,
  IsEmail,
  IsInt,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsString()
  @Length(1, 100)
  sku!: string;

  @IsInt()
  @Min(1)
  qty!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  unit_price!: number;
}

export class CreateOrderCustomerDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(1, 150)
  name!: string;
}

export class CreateOrderDto {
  @IsString()
  @Length(1, 100)
  order_id!: string;

  @ValidateNested()
  @Type(() => CreateOrderCustomerDto)
  customer!: CreateOrderCustomerDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @IsString()
  @Length(3, 3)
  currency!: string;

  @IsUUID()
  idempotency_key!: string;
}