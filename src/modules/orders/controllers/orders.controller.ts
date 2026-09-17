import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';

import { CreateOrderService } from '../services/create-order.service';
import { ListOrdersDto } from '../dto/list-orders.dto';
import { ListOrdersService } from '../services/list-orders.service';
import { GetOrderService } from '../services/get-order.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly createOrderService: CreateOrderService,
    private readonly listOrdersService: ListOrdersService,
    private readonly getOrderService: GetOrderService,
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

  @Get(':id')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.getOrderService.execute(id);
  }
}