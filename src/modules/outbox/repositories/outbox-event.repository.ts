import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OutboxEventEntity } from '../entities/outbox-event.entity';

@Injectable()
export class OutboxEventRepository {
  constructor(
    @InjectRepository(OutboxEventEntity)
    private readonly repository: Repository<OutboxEventEntity>,
  ) {}

  async create(
    event: OutboxEventEntity,
  ): Promise<OutboxEventEntity> {
    return this.repository.save(event);
  }

  async findPending(
    limit = 100,
  ): Promise<OutboxEventEntity[]> {
    return this.repository.find({
      where: {
        published: false,
      },
      order: {
        created_at: 'ASC',
      },
      take: limit,
    });
  }

  async markAsPublished(
    event: OutboxEventEntity,
  ): Promise<void> {
    event.published = true;
    event.published_at = new Date();

    await this.repository.save(event);
  }

  async markAsFailed(
    event: OutboxEventEntity,
    error: string,
  ): Promise<void> {
    event.attempts += 1;
    event.last_error = error;

    await this.repository.save(event);
  }
}