export interface ExchangeRate {
  from: string;
  to: string;
  rate: string;
}

export abstract class ExchangeRateClient {
  abstract getExchangeRate(
    from: string,
    to: string,
  ): Promise<ExchangeRate>;
}