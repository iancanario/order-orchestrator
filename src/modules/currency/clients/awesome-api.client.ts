import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import {
  ExchangeRate,
  ExchangeRateClient,
} from './exchange-rate.client';
import { AwesomeApiQuoteDto } from '../dto/awesome-api-quote.dto';

@Injectable()
export class AwesomeApiClient
  implements ExchangeRateClient
{
  private readonly logger = new Logger(
    AwesomeApiClient.name,
  );

  private readonly baseUrl =
    'https://economia.awesomeapi.com.br';

  constructor(
    private readonly httpService: HttpService,
  ) {}

  async getExchangeRate(
    from: string,
    to: string,
  ): Promise<ExchangeRate> {
    const pair =
      `${from.toUpperCase()}-${to.toUpperCase()}`;

    const url =
      `${this.baseUrl}/json/last/${pair}`;

    try {
      const response =
        await firstValueFrom(
          this.httpService.get<
            Record<string, AwesomeApiQuoteDto>
          >(url),
        );

      const quote =
        response.data[
          `${from.toUpperCase()}${to.toUpperCase()}`
        ];

      if (!quote) {
        throw new Error(
          `Exchange rate not found for ${pair}`,
        );
      }

      return {
        from: quote.code,
        to: quote.codein,
        rate: quote.bid,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch exchange rate ${pair}`,
        error instanceof Error
          ? error.stack
          : String(error),
      );

      throw error;
    }
  }
}