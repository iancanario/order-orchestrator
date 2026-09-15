import { registerAs } from '@nestjs/config';

export const queueConfig = registerAs('queue', () => ({
  host: process.env.RABBITMQ_HOST ?? 'localhost',
  port: parseInt(process.env.RABBITMQ_PORT ?? '5672', 10),
  username: process.env.RABBITMQ_USER ?? 'rabbitmq',
  password: process.env.RABBITMQ_PASSWORD ?? 'rabbitmq',
  vhost: process.env.RABBITMQ_VHOST ?? '/',

  exchange: 'orders.exchange',

  ordersQueue: process.env.RABBITMQ_ORDERS_QUEUE ?? 'orders.currency-conversion',

  deadLetterQueue:
    process.env.RABBITMQ_ORDERS_DLQ ?? 'orders.currency-conversion.dlq',

  maxRetries: parseInt(
    process.env.RABBITMQ_MAX_RETRIES ?? '3',
    10,
  ),
}));