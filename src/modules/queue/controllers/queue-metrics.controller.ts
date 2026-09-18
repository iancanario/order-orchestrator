import {
  Controller,
  Get,
} from '@nestjs/common';

import { QueueMetricsService } from '../services/queue-metrics.service';

@Controller('queue')
export class QueueMetricsController {
  constructor(
    private readonly queueMetricsService: QueueMetricsService,
  ) {}

  @Get('metrics')
  async getMetrics() {
    return this.queueMetricsService.execute();
  }
}