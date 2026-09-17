import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { OrderResponseMapper } from '../mappers/order-response.mapper';
import { IOrderRepository } from '../interfaces/order.repository.interface';

@Injectable()
export class GetOrderService {
  constructor(
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(id: string) {
    const order =
      await this.orderRepository.findById(id);

    if (!order) {
      throw new NotFoundException(
        `Order ${id} not found`,
      );
    }

    return OrderResponseMapper.toResponse(order);
  }
}