import { Injectable } from '@nestjs/common';

import { OrderStatus } from '../../orders/enums/order-status.enum';
import { IOrderRepository } from '../../orders/interfaces/order.repository.interface';

@Injectable()
export class FailOrderConversionService {
  constructor(
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(
    orderId: string,
    reason: string,
  ): Promise<void> {
    const order =
      await this.orderRepository.findById(
        orderId,
      );

    if (!order) {
      return;
    }

    order.status =
      OrderStatus.FAILED_CONVERSION;

    order.failure_reason =
      reason;

    order.processed_at =
      new Date();

    console.log(`Order ${orderId} failed conversion: ${reason} - ${order.failure_reason}`);

    const savedOrder = await this.orderRepository.save(order);

  }
}