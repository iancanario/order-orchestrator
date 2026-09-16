import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import { RabbitMQService } from '../../queue/rabbitmq.service';
import { ROUTING_KEYS } from '../../queue/queue.constants';
import { OutboxEventEntity } from '../entities/outbox-event.entity';
import { OUTBOX_EVENT_TYPES } from '../outbox.constants';
import { IOutboxEventRepository } from '../interfaces/outbox-event.repository.interface';

@Injectable()
export class OutboxPublisherService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(
    OutboxPublisherService.name,
  );

  private pollingInterval?: NodeJS.Timeout;

  private isProcessing = false;

  private readonly pollingIntervalMs = 1000;

  constructor(
    private readonly outboxEventRepository: IOutboxEventRepository,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.publishPendingEvents();

    this.pollingInterval = setInterval(
      () => {
        void this.publishPendingEvents();
      },
      this.pollingIntervalMs,
    );
  }

  onModuleDestroy(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  private async publishPendingEvents(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      const events =
        await this.outboxEventRepository.findPending(
          100,
        );

      for (const event of events) {
        await this.publishEvent(event);
      }
    } catch (error) {
      this.logger.error(
        'Failed to process outbox events',
        error instanceof Error
          ? error.stack
          : String(error),
      );
    } finally {
      this.isProcessing = false;
    }
  }

  private async publishEvent(
    event: OutboxEventEntity,
  ): Promise<void> {
    try {
      const message =
        this.buildMessage(event);

      const routingKey =
        this.getRoutingKey(event.event_type);

      await this.rabbitMQService.publish(
        routingKey,
        message,
      );

      await this.outboxEventRepository.markAsPublished(
        event,
      );

      this.logger.log(
        `Outbox event ${event.id} published`,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      await this.outboxEventRepository.markAsFailed(
        event,
        message,
      );

      this.logger.error(
        `Failed to publish event ${event.id}: ${message}`,
      );
    }
  }

  private buildMessage(
    event: OutboxEventEntity,
  ): Record<string, unknown> {
    return {
      event_id: event.id,
      event_type: event.event_type,
      aggregate_type: event.aggregate_type,
      aggregate_id: event.aggregate_id,
      payload: event.payload,
    };
  }

  private getRoutingKey(
    eventType: string,
  ): string {
    switch (eventType) {
      case OUTBOX_EVENT_TYPES
        .ORDER_CURRENCY_CONVERSION_REQUESTED:
        return ROUTING_KEYS.ORDER_CURRENCY_CONVERSION;

      default:
        throw new Error(
          `Unsupported event type: ${eventType}`,
        );
    }
  }
}