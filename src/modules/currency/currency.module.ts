import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { ExchangeRateClient } from './clients/exchange-rate.client';
import { AwesomeApiClient } from './clients/awesome-api.client';
import { GetExchangeRateService } from './services/get-exchange-rate.service';
import { ConvertOrderCurrencyService } from './services/convert-order-currency.service';
import { CurrencyConversionWorker } from './workers/currency-conversion.worker';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    ConfigModule,
    OrdersModule,
    HttpModule.register({
      timeout: 3000,
      maxRedirects: 3,
    }),
  ],
  providers: [
    AwesomeApiClient,
    {
      provide: ExchangeRateClient,
      useExisting: AwesomeApiClient,
    },
    GetExchangeRateService,
    ConvertOrderCurrencyService,
    CurrencyConversionWorker
  ],
  exports: [
    GetExchangeRateService,
    ConvertOrderCurrencyService,
  ],
})
export class CurrencyModule {}