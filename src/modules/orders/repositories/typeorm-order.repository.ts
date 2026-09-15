import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrderEntity } from '../entities/order.entity';
import { OrderRepository } from '../interfaces/order.repository.interface';

@Injectable()
export class TypeOrmOrderRepository
  implements OrderRepository
{
  constructor(
    @InjectRepository(OrderEntity)
    private readonly repository: Repository<OrderEntity>,
  ) {}

  async findById(
    id: string,
  ): Promise<OrderEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: { items: true },
    });
  }

  async findByOrderId(
    orderId: string,
  ): Promise<OrderEntity | null> {
    return this.repository.findOne({
      where: {
        order_id: orderId,
      },
      relations: { items: true },
    });
  }

  async findByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<OrderEntity | null> {
    return this.repository.findOne({
      where: {
        idempotency_key: idempotencyKey,
      },
      relations: { items: true },
    });
  }

  async create(
    order: OrderEntity,
  ): Promise<OrderEntity> {
    return this.repository.save(order);
  }

  async save(
    order: OrderEntity,
  ): Promise<OrderEntity> {
    return this.repository.save(order);
  }
}