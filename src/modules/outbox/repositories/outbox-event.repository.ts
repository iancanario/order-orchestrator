import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  Repository,
} from 'typeorm';

import { OutboxEventEntity } from '../entities/outbox-event.entity';
import { IOutboxEventRepository } from '../interfaces/outbox-event.repository.interface';

@Injectable()
export class OutboxEventRepository
  implements IOutboxEventRepository
{
  constructor(
    @InjectRepository(OutboxEventEntity)
    private readonly repository: Repository<OutboxEventEntity>,
  ) {}

  private getRepository(manager?: EntityManager) {
    return manager
      ? manager.getRepository(OutboxEventEntity)
      : this.repository;
  }

  async create(
    event: Partial<OutboxEventEntity>,
    manager?: EntityManager,
  ): Promise<OutboxEventEntity> {
    const repository = this.getRepository(manager);

    const entity = repository.create(event);

    return repository.save(entity);
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