import { EntityManager } from 'typeorm';
import { OutboxEventEntity } from '../entities/outbox-event.entity';

export abstract class IOutboxEventRepository {
  abstract create(
    event: Partial<OutboxEventEntity>,
    manager?: EntityManager,
  ): Promise<OutboxEventEntity>;

  abstract findPending(
    limit?: number,
  ): Promise<OutboxEventEntity[]>;

  abstract markAsPublished(
    event: OutboxEventEntity,
  ): Promise<void>;

  abstract markAsFailed(
    event: OutboxEventEntity,
    error: string,
  ): Promise<void>;
}