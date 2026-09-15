import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderRepository } from '../interfaces/order.repository.interface';
import { CalculateOrderTotalService } from './calculate-order-total.service';
import { OutboxEventEntity } from '../../outbox/entities/outbox-event.entity';

@Injectable()
export class CreateOrderService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly orderRepository: OrderRepository,
    private readonly calculateOrderTotalService: CalculateOrderTotalService,
  ) {}

  async execute(
    dto: CreateOrderDto,
  ): Promise<OrderEntity> {
    const existingOrder =
      await this.orderRepository.findByIdempotencyKey(
        dto.idempotency_key,
      );

    if (existingOrder) {
      return existingOrder;
    }

    const existingOrderByExternalId =
      await this.orderRepository.findByOrderId(
        dto.order_id,
      );

    if (existingOrderByExternalId) {
      return existingOrderByExternalId;
    }

    const totalAmount =
      this.calculateOrderTotalService.execute(
        dto.items,
      );

    return this.dataSource.transaction(
      async (manager) => {
        const orderRepository =
          manager.getRepository(OrderEntity);

        const outboxRepository =
          manager.getRepository(OutboxEventEntity);

        const order = orderRepository.create({
          order_id: dto.order_id,
          idempotency_key: dto.idempotency_key,
          customer_email: dto.customer.email,
          customer_name: dto.customer.name,
          currency: dto.currency.toUpperCase(),
          total_amount: totalAmount.toFixed(2),
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
          })) as OrderItemEntity[],
        });

        const savedOrder =
          await orderRepository.save(order);

        const outboxEvent =
          outboxRepository.create({
            event_type:
              'ORDER_CURRENCY_CONVERSION_REQUESTED',
            aggregate_type: 'ORDER',
            aggregate_id: savedOrder.id,
            payload: {
              order_id: savedOrder.id,
            },
            published: false,
            attempts: 0,
            last_error: null,
            published_at: null,
          });

        await outboxRepository.save(outboxEvent);

        return savedOrder;
      },
    );
  }
}