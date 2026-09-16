import { registerAs } from '@nestjs/config';

export const currencyConfig =
  registerAs('currency', () => ({
    targetCurrency:
      process.env.ORDER_CONVERSION_TARGET_CURRENCY ??
      'BRL',

    apiTimeout: Number(
      process.env.CURRENCY_API_TIMEOUT ?? 3000,
    ),
  }));