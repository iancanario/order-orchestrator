import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  Channel,
  ChannelModel,
  connect,
} from 'amqplib';

import {
  QUEUE_EXCHANGES,
  QUEUES,
  ROUTING_KEYS,
} from './queue.constants';

@Injectable()
export class RabbitMQService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(
    RabbitMQService.name,
  );

  private connection!: ChannelModel;
  private channel!: Channel;

  async onModuleInit(): Promise<void> {
    const host =
      process.env.RABBITMQ_HOST ?? 'localhost';

    const port =
      process.env.RABBITMQ_PORT ?? '5672';

    const username =
      process.env.RABBITMQ_USER ?? 'rabbitmq';

    const password =
      process.env.RABBITMQ_PASSWORD ?? 'rabbitmq';

    const vhost =
      process.env.RABBITMQ_VHOST ?? '/';

    const url =
      `amqp://${username}:${password}` +
      `@${host}:${port}${vhost}`;

    this.connection = await connect(url);

    this.channel =
      await this.connection.createChannel();

    await this.setupTopology();

    this.logger.log(
      'RabbitMQ connection established',
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }

  async publish(
    routingKey: string,
    message: Record<string, unknown>,
  ): Promise<void> {
    const published =
      this.channel.publish(
        QUEUE_EXCHANGES.ORDERS,
        routingKey,
        Buffer.from(JSON.stringify(message)),
        {
          persistent: true,
          contentType: 'application/json',
        },
      );

    if (!published) {
      throw new Error(
        `RabbitMQ rejected message: ${routingKey}`,
      );
    }
  }

  private async setupTopology(): Promise<void> {
    await this.channel.assertExchange(
      QUEUE_EXCHANGES.ORDERS,
      'direct',
      {
        durable: true,
      },
    );

    await this.channel.assertQueue(
      QUEUES.ORDERS_CURRENCY_CONVERSION,
      {
        durable: true,
      },
    );

    await this.channel.bindQueue(
      QUEUES.ORDERS_CURRENCY_CONVERSION,
      QUEUE_EXCHANGES.ORDERS,
      ROUTING_KEYS.ORDER_CURRENCY_CONVERSION,
    );

    await this.channel.assertQueue(
      QUEUES.ORDERS_CURRENCY_CONVERSION_DLQ,
      {
        durable: true,
      },
    );

    await this.channel.bindQueue(
      QUEUES.ORDERS_CURRENCY_CONVERSION_DLQ,
      QUEUE_EXCHANGES.ORDERS,
      ROUTING_KEYS.ORDERS_CURRENCY_CONVERSION_DLQ,
    );
  }
}