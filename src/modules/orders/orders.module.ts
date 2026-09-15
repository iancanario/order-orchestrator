import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      OrderItemEntity,
    ]),
  ],
})
export class OrdersModule {}