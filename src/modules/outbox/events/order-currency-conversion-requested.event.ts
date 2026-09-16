export class OrderCurrencyConversionRequestedEvent {
  readonly event_type =
    'ORDER_CURRENCY_CONVERSION_REQUESTED';

  constructor(
    readonly event_id: string,
    readonly order_uuid: string,
  ) {}
}