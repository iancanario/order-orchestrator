import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';

import { RabbitMQService } from '../../queue/rabbitmq.service';
import { MessageRetryService } from '../../queue/services/message-retry.service';
import { QUEUES } from '../../queue/queue.constants';

import { ConvertOrderCurrencyService } from '../services/convert-order-currency.service';
import { FailOrderConversionService } from '../services/fail-order-conversion.service';

@Injectable()
export class CurrencyConversionWorker
  implements OnModuleInit
{
  private readonly logger = new Logger(
    CurrencyConversionWorker.name,
  );

  private readonly maxAttempts = 3;

  constructor(
    private readonly rabbitMQService: RabbitMQService,

    private readonly messageRetryService:
      MessageRetryService,

    private readonly convertOrderCurrencyService:
      ConvertOrderCurrencyService,

    private readonly failOrderConversionService:
      FailOrderConversionService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.rabbitMQService.consume(
      QUEUES.ORDERS_CURRENCY_CONVERSION,
      async (message, metadata) => {
        await this.process(
          message,
          metadata.retryCount,
        );
      },
    );
  }

  private async process(
    message: Record<string, unknown>,
    retryCount: number,
  ): Promise<void> {
    const payload = message.payload as {
      order_uuid: string;
    };

    const currentAttempt = retryCount + 1;

    try {
      this.logger.log(
        `Processing order ${payload.order_uuid} ` +
          `(attempt: ${currentAttempt}/${this.maxAttempts})`,
      );

      await this.convertOrderCurrencyService.execute(
        payload.order_uuid,
      );

      this.logger.log(
        `Order ${payload.order_uuid} converted successfully`,
      );
    } catch (error) {
      const hasRetry = currentAttempt < this.maxAttempts;

      if (!hasRetry) {
        await this.sendToDlq(
          message,
          retryCount,
        );

        await this.failOrderConversionService.execute(
          payload.order_uuid,
          error instanceof Error
            ? error.message
            : String(error),
        );

        this.logger.error(
          `Order ${payload.order_uuid} exceeded maximum attempts ` +
            `(${this.maxAttempts})`,
        );

        return;
      }

      await this.messageRetryService.retry(
        message,
        retryCount,
      );

    }
  }

  private async sendToDlq(
    message: Record<string, unknown>,
    retryCount: number,
  ): Promise<void> {
    await this.rabbitMQService.publishToDlq(
      message,
      retryCount,
    );
    
  }
}