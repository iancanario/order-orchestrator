import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { ExchangeRateClient } from './clients/exchange-rate.client';
import { AwesomeApiClient } from './clients/awesome-api.client';
import { GetExchangeRateService } from './services/get-exchange-rate.service';

@Module({
  imports: [
    ConfigModule,
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
  ],
  exports: [
    GetExchangeRateService,
  ],
})
export class CurrencyModule {}