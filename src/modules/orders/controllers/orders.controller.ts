import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';

import { CreateOrderDto } from '../dto/create-order.dto';
import { CreateOrderService } from '../services/create-order.service';
import { ListOrdersDto } from '../dto/list-orders.dto';
import { ListOrdersService } from '../services/list-orders.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly createOrderService: CreateOrderService,
    private readonly listOrdersService: ListOrdersService,
  ) {}

@Get()
  async findAll(
    @Query() query: ListOrdersDto,
  ) {
    return this.listOrdersService.execute(
      query.status,
      query.page,
      query.limit,
    );
  }
}