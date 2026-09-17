import { OrderEntity } from '../entities/order.entity';

export class OrderResponseMapper {
  static toResponse(order: OrderEntity) {
    return {
      id: order.id,
      order_id: order.order_id,

      customer: {
        email: order.customer_email,
        name: order.customer_name,
      },

      items: order.items?.map((item) => ({
        sku: item.sku,
        qty: item.qty,
        unit_price: item.unit_price,
      })) ?? [],

      currency: order.currency,
      total_amount: order.total_amount,

      converted_amount: order.converted_amount,
      converted_currency: order.converted_currency,
      exchange_rate: order.exchange_rate,

      status: order.status,
      failure_reason: order.failure_reason,

      created_at: order.created_at,
      updated_at: order.updated_at,
      processed_at: order.processed_at,
    };
  }

  static toResponseList(orders: OrderEntity[]) {
    return orders.map((order) =>
      this.toResponse(order),
    );
  }
}