import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  Repository,
} from 'typeorm';

import { OrderEntity } from '../entities/order.entity';
import { IOrderRepository } from '../interfaces/order.repository.interface';

@Injectable()
export class TypeOrmOrderRepository
  implements IOrderRepository
{
  constructor(
    @InjectRepository(OrderEntity)
    private readonly repository: Repository<OrderEntity>,
  ) {}

  private getRepository(manager?: EntityManager) {
    return manager
      ? manager.getRepository(OrderEntity)
      : this.repository;
  }

  async findById(
    id: string,
    manager?: EntityManager,
  ): Promise<OrderEntity | null> {
    return this.getRepository(manager).findOne({
      where: { id },
      relations: { items: true },
    });
  }

  async findByOrderId(
    orderId: string,
    manager?: EntityManager,
  ): Promise<OrderEntity | null> {
    return this.getRepository(manager).findOne({
      where: {
        order_id: orderId,
      },
      relations: { items: true },
    });
  }

  async findByIdempotencyKey(
    idempotencyKey: string,
    manager?: EntityManager,
  ): Promise<OrderEntity | null> {
    return this.getRepository(manager).findOne({
      where: {
        idempotency_key: idempotencyKey,
      },
      relations: { items: true },
    });
  }

  async create(
    order: OrderEntity,
    manager?: EntityManager,
  ): Promise<OrderEntity> {
    return this.getRepository(manager).save(order);
  }

  async save(
    order: OrderEntity,
    manager?: EntityManager,
  ): Promise<OrderEntity> {
    return this.getRepository(manager).save(order);
  }
}