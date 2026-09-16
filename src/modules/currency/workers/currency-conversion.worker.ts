import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';

import { RabbitMQService } from '../../queue/rabbitmq.service';
import { QUEUES } from '../../queue/queue.constants';

import { ConvertOrderCurrencyService } from '../services/convert-order-currency.service';

@Injectable()
export class CurrencyConversionWorker
  implements OnModuleInit
{
  private readonly logger = new Logger(
    CurrencyConversionWorker.name,
  );

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly convertOrderCurrencyService:
      ConvertOrderCurrencyService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.rabbitMQService.consume(
      QUEUES.ORDERS_CURRENCY_CONVERSION,
      async (message) => {
        await this.process(message);
      },
    );
  }

  private async process(
    message: Record<string, unknown>,
  ): Promise<void> {
    const payload = message.payload as {
      order_uuid: string;
    };

    this.logger.log(
      `Processing order ${payload.order_uuid}`,
    );

    await this.convertOrderCurrencyService.execute(
      payload.order_uuid,
    );

    this.logger.log(
      `Order ${payload.order_uuid} converted successfully`,
    );
  }

  
}