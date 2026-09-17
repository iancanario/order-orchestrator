import { Injectable } from '@nestjs/common';

import {
  QUEUE_EXCHANGES,
  ROUTING_KEYS,
} from '../queue.constants';

import { RabbitMQService } from '../rabbitmq.service';

@Injectable()
export class MessageRetryService {
  private readonly retryRoutingKeys = [
    ROUTING_KEYS.ORDER_CURRENCY_CONVERSION_RETRY_1,
    ROUTING_KEYS.ORDER_CURRENCY_CONVERSION_RETRY_2,
    ROUTING_KEYS.ORDER_CURRENCY_CONVERSION_RETRY_3,
  ];

  constructor(
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async retry(
    message: Record<string, unknown>,
    retryCount: number,
  ): Promise<boolean> {
    const nextRetry = retryCount + 1;

    const routingKey =
      this.retryRoutingKeys[nextRetry - 1];

    if (!routingKey) {
      return false;
    }

    await this.rabbitMQService.publishRetry(
      routingKey,
      message,
      nextRetry,
    );

    return true;
  }
}