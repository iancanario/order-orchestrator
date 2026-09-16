import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OutboxEventEntity } from './entities/outbox-event.entity';
import { OutboxEventRepository } from './repositories/outbox-event.repository';
import { IOutboxEventRepository } from './interfaces/outbox-event.repository.interface';
import { OutboxPublisherService } from './services/outbox-publisher.service';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [
    QueueModule,
    TypeOrmModule.forFeature([
      OutboxEventEntity,
    ]),
  ],
  providers: [
    {
      provide: IOutboxEventRepository,
      useClass: OutboxEventRepository,
    },
    OutboxPublisherService,
  ],
  exports: [
    IOutboxEventRepository,
  ],
})
export class OutboxModule {}