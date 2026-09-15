import { OrderEntity } from '../entities/order.entity';
import { EntityManager } from 'typeorm';

export abstract class IOrderRepository {
  abstract findById(
    id: string,
    manager?: EntityManager,
  ): Promise<OrderEntity | null>;

  abstract findByOrderId(
    orderId: string,
    manager?: EntityManager,
  ): Promise<OrderEntity | null>;

  abstract findByIdempotencyKey(
    idempotencyKey: string,
    manager?: EntityManager,
  ): Promise<OrderEntity | null>;

  abstract save(
    order: OrderEntity,
    manager?: EntityManager,
  ): Promise<OrderEntity>;

  abstract create(
    order: OrderEntity,
    manager?: EntityManager,
  ): Promise<OrderEntity>;
}