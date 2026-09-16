import { GetExchangeRateService } from './get-exchange-rate.service';
import { ExchangeRateClient } from '../clients/exchange-rate.client';

describe('GetExchangeRateService', () => {
  it('should return exchange rate', async () => {
    const client: ExchangeRateClient = {
      getExchangeRate: jest
        .fn()
        .mockResolvedValue({
          from: 'USD',
          to: 'BRL',
          rate: '5.30',
        }),
    };

    const service =
      new GetExchangeRateService(client);

    const result =
      await service.execute('USD', 'BRL');

    expect(result).toEqual({
      from: 'USD',
      to: 'BRL',
      rate: '5.30',
    });
  });

  it('should not call external API when currencies are equal', async () => {
    const client: ExchangeRateClient = {
      getExchangeRate: jest.fn(),
    };

    const service =
      new GetExchangeRateService(client);

    const result =
      await service.execute('BRL', 'BRL');

    expect(result).toEqual({
      from: 'BRL',
      to: 'BRL',
      rate: '1',
    });

    expect(
      client.getExchangeRate,
    ).not.toHaveBeenCalled();
  });
});