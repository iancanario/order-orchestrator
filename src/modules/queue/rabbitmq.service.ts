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
    options?: {
      headers?: Record<string, unknown>;
    },
  ): Promise<void> {
    const published =
      this.channel.publish(
        QUEUE_EXCHANGES.ORDERS,
        routingKey,
        Buffer.from(
          JSON.stringify(message),
        ),
        {
          persistent: true,
          contentType: 'application/json',
          headers: options?.headers,
        },
      );

    if (!published) {
      throw new Error(
        `RabbitMQ rejected message: ${routingKey}`,
      );
    }
  }

  async publishRetry(
    routingKey: string,
    message: Record<string, unknown>,
    retryCount: number,
  ): Promise<void> {
    const published =
      this.channel.publish(
        QUEUE_EXCHANGES.ORDERS_RETRY,
        routingKey,
        Buffer.from(
          JSON.stringify(message),
        ),
        {
          persistent: true,
          contentType: 'application/json',

          headers: {
            'x-retry-count': retryCount,
          },
        },
      );

    if (!published) {
      throw new Error(
        `RabbitMQ rejected retry message: ${routingKey}`,
      );
    }
  }

  async publishToDlq(
    message: Record<string, unknown>,
    retryCount: number,
  ): Promise<void> {
    const published =
      this.channel.publish(
        QUEUE_EXCHANGES.ORDERS,
        ROUTING_KEYS.ORDER_CURRENCY_CONVERSION_DLQ,
        Buffer.from(
          JSON.stringify(message),
        ),
        {
          persistent: true,
          contentType: 'application/json',

          headers: {
            'x-retry-count': retryCount,
            'x-failure-reason':
              'MAX_RETRIES_EXCEEDED',
          },
        },
      );

    if (!published) {
      throw new Error(
        'RabbitMQ rejected DLQ message',
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

    await this.channel.assertExchange(
      QUEUE_EXCHANGES.ORDERS_RETRY,
      'direct',
      {
        durable: true,
      },
    );

    await this.assertMainQueue();

    await this.assertRetryQueue(
      QUEUES.ORDERS_CURRENCY_CONVERSION_RETRY_1,
      ROUTING_KEYS.ORDER_CURRENCY_CONVERSION_RETRY_1,
      1000,
    );

    await this.assertRetryQueue(
      QUEUES.ORDERS_CURRENCY_CONVERSION_RETRY_2,
      ROUTING_KEYS.ORDER_CURRENCY_CONVERSION_RETRY_2,
      2000,
    );

    await this.assertRetryQueue(
      QUEUES.ORDERS_CURRENCY_CONVERSION_RETRY_3,
      ROUTING_KEYS.ORDER_CURRENCY_CONVERSION_RETRY_3,
      4000,
    );

    await this.assertDlq();
  }

  async consume(
    queue: string,
    handler: (
      message: Record<string, unknown>,
      metadata: {
        retryCount: number;
      },
    ) => Promise<void>,
  ): Promise<void> {
    await this.channel.prefetch(1);

    await this.channel.consume(
      queue,
      async (message) => {
        if (!message) {
          return;
        }

        try {
          const payload =
            JSON.parse(
              message.content.toString(),
            ) as Record<string, unknown>;

          const retryCount =
            Number(
              message.properties.headers?.[
                'x-retry-count'
              ] ?? 0,
            );

          await handler(
            payload,
            {
              retryCount,
            },
          );

          this.channel.ack(message);
        } catch (error) {
          this.logger.error(
            `Failed to process message from ${queue}`,
            error instanceof Error
              ? error.stack
              : String(error),
          );

          this.channel.nack(
            message,
            false,
            false,
          );
        }
      },
    );
  }

  private async assertMainQueue(): Promise<void> {
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
  }

  private async assertRetryQueue(
    queue: string,
    routingKey: string,
    ttl: number,
  ): Promise<void> {
    await this.channel.assertQueue(
      queue,
      {
        durable: true,

        arguments: {
          'x-message-ttl': ttl,

          'x-dead-letter-exchange':
            QUEUE_EXCHANGES.ORDERS,

          'x-dead-letter-routing-key':
            ROUTING_KEYS.ORDER_CURRENCY_CONVERSION,
        },
      },
    );

    await this.channel.bindQueue(
      queue,
      QUEUE_EXCHANGES.ORDERS_RETRY,
      routingKey,
    );
  }

  private async assertDlq(): Promise<void> {
    await this.channel.assertQueue(
      QUEUES.ORDERS_CURRENCY_CONVERSION_DLQ,
      {
        durable: true,
      },
    );

    await this.channel.bindQueue(
      QUEUES.ORDERS_CURRENCY_CONVERSION_DLQ,
      QUEUE_EXCHANGES.ORDERS,
      ROUTING_KEYS.ORDER_CURRENCY_CONVERSION_DLQ,
    );
  }
}