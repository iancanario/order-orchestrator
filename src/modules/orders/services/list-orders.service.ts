import { Injectable } from '@nestjs/common';

import { OrderStatus } from '../enums/order-status.enum';
import { OrderResponseMapper } from '../mappers/order-response.mapper';
import { IOrderRepository } from '../interfaces/order.repository.interface';

@Injectable()
export class ListOrdersService {
  constructor(
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(
    status: OrderStatus | undefined,
    page: number,
    limit: number,
  ) {
    const { data, total } =
      await this.orderRepository.findAll(
        status,
        page,
        limit,
      );

    return {
      data: OrderResponseMapper.toResponseList(data),

      meta: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }
}