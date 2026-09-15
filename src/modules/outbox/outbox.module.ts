import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OutboxEventEntity } from './entities/outbox-event.entity';
import { OutboxEventRepository } from './repositories/outbox-event.repository';
import { IOutboxEventRepository } from './interfaces/outbox-event.repository.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OutboxEventEntity,
    ]),
  ],
  providers: [
    {
      provide: IOutboxEventRepository,
      useClass: OutboxEventRepository,
    },
  ],
  exports: [
    IOutboxEventRepository,
  ],
})
export class OutboxModule {}