import { OrderEntity } from '../entities/order.entity';

export abstract class OrderRepository {
  abstract findById(
    id: string,
  ): Promise<OrderEntity | null>;

  abstract findByOrderId(
    orderId: string,
  ): Promise<OrderEntity | null>;

  abstract findByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<OrderEntity | null>;

  abstract save(
    order: OrderEntity,
  ): Promise<OrderEntity>;

  abstract create(
    order: OrderEntity,
  ): Promise<OrderEntity>;
}