import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { databaseConfig } from '../config/database.config';
import { OrderEntity } from '../../modules/orders/entities/order.entity';
import { OrderItemEntity } from '../../modules/orders/entities/order-item.entity';
import { OutboxEventEntity } from '../../modules/outbox/entities/outbox-event.entity';

const config = databaseConfig();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.host,
  port: config.port,
  username: config.username,
  password: config.password,
  database: config.name,

  entities: [
    OrderEntity,
    OrderItemEntity,
    OutboxEventEntity
  ],

  migrations: [
    'src/commons/database/migrations/*.ts',
  ],

  synchronize: false,
});