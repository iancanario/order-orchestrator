import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Channel,
  ChannelWrapper,
  connect,
} from 'amqp-connection-manager';

import {
  QUEUE_EXCHANGES,
  QUEUES,
  ROUTING_KEYS,
} from './queue.constants';

@Injectable()
export class RabbitMQService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RabbitMQService.name);

  private connection!: ReturnType<typeof connect>;
  private channel!: ChannelWrapper;

  constructor(
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    const host = this.configService.getOrThrow<string>(
      'queue.host',
    );

    const port = this.configService.getOrThrow<number>(
      'queue.port',
    );

    const username = this.configService.getOrThrow<string>(
      'queue.username',
    );

    const password = this.configService.getOrThrow<string>(
      'queue.password',
    );

    const vhost = this.configService.getOrThrow<string>(
      'queue.vhost',
    );

    const url =
      `amqp://${encodeURIComponent(username)}` +
      `:${encodeURIComponent(password)}` +
      `@${host}:${port}` +
      `/${encodeURIComponent(vhost)}`;

    this.connection = connect([url]);

    this.connection.on('connect', () => {
      this.logger.log('RabbitMQ connected');
    });

    this.connection.on('disconnect', (params) => {
      this.logger.error(
        `RabbitMQ disconnected: ${params.err?.message}`,
      );
    });

    this.channel = this.connection.createChannel({
      setup: async (channel: Channel) => {
        await this.setupTopology(channel);
      },
    });

    await this.channel.waitForConnect();
  }

  private async setupTopology(
    channel: Channel,
  ): Promise<void> {
    await channel.assertExchange(
      QUEUE_EXCHANGES.ORDERS,
      'direct',
      {
        durable: true,
      },
    );

    await channel.assertQueue(
      QUEUES.ORDERS_CURRENCY_CONVERSION,
      {
        durable: true,
      },
    );

    await channel.assertQueue(
      QUEUES.ORDERS_CURRENCY_CONVERSION_DLQ,
      {
        durable: true,
      },
    );

    await channel.bindQueue(
      QUEUES.ORDERS_CURRENCY_CONVERSION,
      QUEUE_EXCHANGES.ORDERS,
      ROUTING_KEYS.ORDER_CURRENCY_CONVERSION,
    );

    await channel.bindQueue(
      QUEUES.ORDERS_CURRENCY_CONVERSION_DLQ,
      QUEUE_EXCHANGES.ORDERS,
      ROUTING_KEYS.ORDERS_CURRENCY_CONVERSION_DLQ,
    );
  }

  async publish(
    routingKey: string,
    message: unknown,
  ): Promise<void> {
    await this.channel.publish(
      QUEUE_EXCHANGES.ORDERS,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
        contentType: 'application/json',
      },
    );
  }

  getChannel(): ChannelWrapper {
    return this.channel;
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}