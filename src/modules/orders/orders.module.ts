import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { OutboxModule } from '../outbox/outbox.module';
import { CalculateOrderTotalService } from './services/calculate-order-total.service';
import { CreateOrderService } from './services/create-order.service';
import { TypeOrmOrderRepository } from './repositories/typeorm-order.repository';
import { IOrderRepository } from './interfaces/order.repository.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      OrderItemEntity,
    ]),
    OutboxModule,
  ],

  providers: [
    CalculateOrderTotalService,
    CreateOrderService,
    {
      provide: IOrderRepository,
      useClass: TypeOrmOrderRepository,
    },
  ],
})
export class OrdersModule {}