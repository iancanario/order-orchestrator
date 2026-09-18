import { registerAs } from '@nestjs/config';

export const queueConfig = registerAs('queue', () => ({
  host: process.env.RABBITMQ_HOST ?? 'localhost',
  port: parseInt(process.env.RABBITMQ_PORT ?? '5672', 10),
  managementPort: parseInt(
    process.env.RABBITMQ_MANAGEMENT_PORT ?? '15672',
    10,
  ),
  username: process.env.RABBITMQ_USER ?? 'rabbitmq',
  password: process.env.RABBITMQ_PASSWORD ?? 'rabbitmq',
  vhost: process.env.RABBITMQ_VHOST ?? '/',

  exchange: 'orders.exchange',

  ordersQueue: process.env.RABBITMQ_ORDERS_QUEUE ?? 'orders.currency-conversion',

  retryQueues: [
    'orders.currency-conversion.retry.1',
    'orders.currency-conversion.retry.2',
    'orders.currency-conversion.retry.3',
  ],

  deadLetterQueue:
    process.env.RABBITMQ_ORDERS_DLQ ?? 'orders.currency-conversion.dlq',

  maxRetries: parseInt(
    process.env.RABBITMQ_MAX_RETRIES ?? '3',
    10,
  ),
}));