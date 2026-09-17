import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { OutboxModule } from '../outbox/outbox.module';
import { CalculateOrderTotalService } from './services/calculate-order-total.service';
import { CreateOrderService } from './services/create-order.service';
import { TypeOrmOrderRepository } from './repositories/typeorm-order.repository';
import { IOrderRepository } from './interfaces/order.repository.interface';
import { OrdersController } from './controllers/orders.controller';
import { ListOrdersService } from './services/list-orders.service';
import { OrdersWebhookController } from './controllers/orders-webhook.controller';
import { GetOrderService } from './services/get-order.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      OrderItemEntity,
    ]),
    OutboxModule,
  ],
  controllers: [
    OrdersController,
    OrdersWebhookController
  ],
  providers: [
    CalculateOrderTotalService,
    CreateOrderService,
    ListOrdersService,
    GetOrderService,
    {
      provide: IOrderRepository,
      useClass: TypeOrmOrderRepository,
    },
  ],
  exports: [
    IOrderRepository,
  ]
})
export class OrdersModule {}