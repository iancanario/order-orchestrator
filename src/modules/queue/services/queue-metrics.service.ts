import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { RabbitMQManagementClient } from '../clients/rabbitmq-management.client';

@Injectable()
export class QueueMetricsService {
  constructor(
    private readonly client: RabbitMQManagementClient,
    private readonly configService: ConfigService,
  ) {}

  async execute() {
    const ordersQueue =
      this.configService.getOrThrow<string>(
        'queue.ordersQueue',
      );

    const retryQueues =
      this.configService.getOrThrow<string[]>(
        'queue.retryQueues',
      );

    const deadLetterQueue =
      this.configService.getOrThrow<string>(
        'queue.deadLetterQueue',
      );

    const queues = [
      ordersQueue,
      ...retryQueues,
      deadLetterQueue,
    ];

    const metrics = await Promise.all(
      queues.map((queue) =>
        this.client.getQueue(queue),
      ),
    );

    return {
      queues: metrics.map((metric) => ({
        name: metric.name,
        ready: metric.messages_ready,
        unacked:
          metric.messages_unacknowledged,
      })),
    };
  }
}