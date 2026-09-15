import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderEntity } from '../entities/order.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { IOrderRepository } from '../interfaces/order.repository.interface';
import { CalculateOrderTotalService } from './calculate-order-total.service';
import { IOutboxEventRepository } from '../../outbox/interfaces/outbox-event.repository.interface';

@Injectable()
export class CreateOrderService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly orderRepository: IOrderRepository,
    private readonly outboxEventRepository: IOutboxEventRepository,
    private readonly calculateOrderTotalService: CalculateOrderTotalService,
  ) {}

  async execute(
    dto: CreateOrderDto,
  ): Promise<OrderEntity> {
    const existingByIdempotency =
      await this.orderRepository.findByIdempotencyKey(
        dto.idempotency_key,
      );

    if (existingByIdempotency) {
      return existingByIdempotency;
    }

    const existingByOrderId =
      await this.orderRepository.findByOrderId(
        dto.order_id,
      );

    if (existingByOrderId) {
      throw new ConflictException(
        'Order already exists',
      );
    }

    const totalAmount =
      this.calculateOrderTotalService.execute(
        dto.items,
      );

    return this.dataSource.transaction(
      async (manager) => {
        const order = manager.create(OrderEntity, {
          order_id: dto.order_id,
          idempotency_key: dto.idempotency_key,
          customer_email: dto.customer.email,
          customer_name: dto.customer.name,
          currency: dto.currency.toUpperCase(),
          total_amount: totalAmount,
          status: OrderStatus.RECEIVED,
          converted_amount: null,
          converted_currency: null,
          exchange_rate: null,
          failure_reason: null,
          processed_at: null,
          items: dto.items.map((item) => ({
            sku: item.sku,
            qty: item.qty,
            unit_price: item.unit_price.toFixed(2),
          })),
        });

        const savedOrder =
          await this.orderRepository.create(
            order,
            manager,
          );

        await this.outboxEventRepository.create(
          {
            event_type:
              'ORDER_CURRENCY_CONVERSION_REQUESTED',

            aggregate_type: 'order',

            aggregate_id: savedOrder.id,

            payload: {
              order_uuid: savedOrder.id,
            },

            published: false,

            attempts: 0,

            last_error: null,

            published_at: null,
          },
          manager,
        );

        return savedOrder;
      },
    );
  }
}