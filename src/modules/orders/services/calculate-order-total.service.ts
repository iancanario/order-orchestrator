import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import { CreateOrderItemDto } from '../dto/create-order.dto';

@Injectable()
export class CalculateOrderTotalService {
  execute(items: CreateOrderItemDto[]): string {
    const total = items.reduce(
      (accumulator, item) => {
        const unitPrice = new Decimal(item.unit_price);

        return accumulator.plus(
          unitPrice.mul(item.qty),
        );
      },
      new Decimal(0),
    );

    return total.toFixed(2);
  }
}