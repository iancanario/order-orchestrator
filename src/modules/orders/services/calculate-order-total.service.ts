import { Injectable } from "@nestjs/common";
import { CreateOrderItemDto } from "../dto/create-order.dto";

@Injectable()
export class CalculateOrderTotalService {
  execute(items: CreateOrderItemDto[]): number {
    return items.reduce(
      (total, item) =>
        total + item.qty * item.unit_price,
      0,
    );
  }
}