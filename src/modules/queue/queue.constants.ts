export const QUEUE_EXCHANGES = {
  ORDERS: 'orders.exchange',
} as const;

export const QUEUES = {
  ORDERS_CURRENCY_CONVERSION: 'orders.currency-conversion',
  ORDERS_CURRENCY_CONVERSION_DLQ: 'orders.currency-conversion.dlq',
} as const;

export const ROUTING_KEYS = {
  ORDER_CURRENCY_CONVERSION: 'order.currency-conversion',
  ORDERS_CURRENCY_CONVERSION_DLQ: 'orders.currency-conversion.dlq',
} as const;