import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface RabbitMQQueueMetric {
  name: string;
  messages: number;
  messages_ready: number;
  messages_unacknowledged: number;
}

@Injectable()
export class RabbitMQManagementClient {
  private readonly logger = new Logger(
    RabbitMQManagementClient.name,
  );

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getQueue(
    queue: string,
  ): Promise<RabbitMQQueueMetric> {
    const host =
      this.configService.getOrThrow<string>(
        'queue.host',
      );

    const port =
      this.configService.getOrThrow<number>(
        'queue.managementPort',
      );

    const username =
      this.configService.getOrThrow<string>(
        'queue.username',
      );

    const password =
      this.configService.getOrThrow<string>(
        'queue.password',
      );

    const vhost =
      this.configService.getOrThrow<string>(
        'queue.vhost',
      );

    const encodedVhost = encodeURIComponent(vhost);
    const encodedQueue = encodeURIComponent(queue);

    const url =
      `http://${host}:${port}` +
      `/api/queues/${encodedVhost}/${encodedQueue}`;

    try {
      const response =
        await firstValueFrom(
          this.httpService.get<RabbitMQQueueMetric>(
            url,
            {
              auth: {
                username,
                password,
              },
            },
          ),
        );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch metrics for queue ${queue}`,
        error instanceof Error
          ? error.stack
          : String(error),
      );

      throw error;
    }
  }
}