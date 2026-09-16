import { Injectable } from '@nestjs/common';

import {
  ExchangeRate,
  ExchangeRateClient,
} from '../clients/exchange-rate.client';

@Injectable()
export class GetExchangeRateService {
  constructor(
    private readonly exchangeRateClient: ExchangeRateClient,
  ) {}

  async execute(
    from: string,
    to: string,
  ): Promise<ExchangeRate> {
    if (from.toUpperCase() === to.toUpperCase()) {
      return {
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        rate: '1',
      };
    }

    return this.exchangeRateClient.getExchangeRate(
      from,
      to,
    );
  }
}