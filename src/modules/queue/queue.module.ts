import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { RabbitMQService } from './rabbitmq.service';
import { MessageRetryService } from './services/message-retry.service';
import { RabbitMQManagementClient } from './clients/rabbitmq-management.client';
import { QueueMetricsService } from './services/queue-metrics.service';
import { QueueMetricsController } from './controllers/queue-metrics.controller';

@Global()
@Module({
  imports: [HttpModule],
  controllers: [QueueMetricsController],
  providers: [
    RabbitMQService, 
    MessageRetryService, 
    RabbitMQManagementClient, 
    QueueMetricsService
  ],
  exports: [RabbitMQService, MessageRetryService],
})
export class QueueModule {}