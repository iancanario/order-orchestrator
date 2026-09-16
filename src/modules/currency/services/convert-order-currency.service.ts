import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import Decimal from 'decimal.js';

import { IOrderRepository } from 'src/modules/orders/interfaces/order.repository.interface';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import { GetExchangeRateService } from './get-exchange-rate.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConvertOrderCurrencyService {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly getExchangeRateService: GetExchangeRateService,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    orderId: string,
  ): Promise<void> {
    const order =
      await this.orderRepository.findById(
        orderId,
      );

    if (!order) {
      throw new NotFoundException(
        `Order ${orderId} not found`,
      );
    }

    if (order.status === OrderStatus.CONVERTED) {
      return;
    }

    const targetCurrency =
      this.configService.getOrThrow<string>(
        'currency.targetCurrency',
    );

    const exchangeRate =
      await this.getExchangeRateService.execute(
        order.currency,
        targetCurrency,
      );

    const convertedAmount =
      new Decimal(order.total_amount)
        .mul(exchangeRate.rate)
        .toFixed(2);

    order.converted_amount =
      convertedAmount;

    order.converted_currency =
      exchangeRate.to;

    order.exchange_rate =
      exchangeRate.rate;

    order.status =
      OrderStatus.CONVERTED;

    order.processed_at =
      new Date();

    await this.orderRepository.save(order);
  }
}