import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { CreateOrderDto } from '../dto/create-order.dto';
import { CreateOrderService } from '../services/create-order.service';

@Controller('webhooks')
export class OrdersWebhookController {
  constructor(
    private readonly createOrderService: CreateOrderService,
  ) {}

  @Post('orders')
  @HttpCode(HttpStatus.ACCEPTED)
  async create(@Body() dto: CreateOrderDto) {
    return this.createOrderService.execute(dto);
  }
}