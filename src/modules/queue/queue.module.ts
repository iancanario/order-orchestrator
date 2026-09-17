import { Global, Module } from '@nestjs/common';

import { RabbitMQService } from './rabbitmq.service';
import { MessageRetryService } from './services/message-retry.service';

@Global()
@Module({
  providers: [RabbitMQService, MessageRetryService],
  exports: [RabbitMQService, MessageRetryService],
})
export class QueueModule {}