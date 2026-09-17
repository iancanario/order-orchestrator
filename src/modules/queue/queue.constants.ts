export const QUEUE_EXCHANGES = {
  ORDERS: 'orders.exchange',
  ORDERS_RETRY: 'orders.retry',
} as const;

export const QUEUES = {
  ORDERS_CURRENCY_CONVERSION:
    'orders.currency-conversion',

  ORDERS_CURRENCY_CONVERSION_RETRY_1:
    'orders.currency-conversion.retry.1',

  ORDERS_CURRENCY_CONVERSION_RETRY_2:
    'orders.currency-conversion.retry.2',

  ORDERS_CURRENCY_CONVERSION_RETRY_3:
    'orders.currency-conversion.retry.3',

  ORDERS_CURRENCY_CONVERSION_DLQ:
    'orders.currency-conversion.dlq',
} as const;

export const ROUTING_KEYS = {
  ORDER_CURRENCY_CONVERSION:
    'order.currency-conversion',

  ORDER_CURRENCY_CONVERSION_RETRY_1:
    'order.currency-conversion.retry.1',

  ORDER_CURRENCY_CONVERSION_RETRY_2:
    'order.currency-conversion.retry.2',

  ORDER_CURRENCY_CONVERSION_RETRY_3:
    'order.currency-conversion.retry.3',

  ORDER_CURRENCY_CONVERSION_DLQ:
    'order.currency-conversion.dlq',
} as const;