import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { CreateOrderDto } from '../dto/create-order.dto';
import { CreateOrderService } from '../services/create-order.service';

@Controller('webhooks/orders')
export class OrdersController {
  constructor(
    private readonly createOrderService: CreateOrderService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async create(
    @Body() dto: CreateOrderDto,
  ) {
    const order =
      await this.createOrderService.execute(dto);

    return {
      id: order.id,
      order_id: order.order_id,
      status: order.status,
    };
  }
}