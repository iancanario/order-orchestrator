import {
  IsString,
  IsUUID,
} from 'class-validator';

export class OrderCurrencyConversionRequestedDto {
  @IsUUID()
  event_id!: string;

  @IsString()
  event_type!: string;

  @IsString()
  aggregate_type!: string;

  @IsUUID()
  aggregate_id!: string;

  payload!: {
    order_uuid: string;
  };
}