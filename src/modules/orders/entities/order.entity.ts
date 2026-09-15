import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import { OrderStatus } from '../enums/order-status.enum';
import { OrderItemEntity } from './order-item.entity';

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  order_id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  idempotency_key!: string;

  @Column({ type: 'varchar', length: 255 })
  customer_email!: string;

  @Column({ type: 'varchar', length: 150 })
  customer_name!: string;

  @Column({ type: 'varchar', length: 3 })
  currency!: string;

  @Column({
    type: 'numeric',
    precision: 18,
    scale: 2,
  })
  total_amount!: string;

  @Column({
    type: 'numeric',
    precision: 18,
    scale: 2,
    nullable: true,
  })
  converted_amount!: string | null;

  @Column({
    type: 'varchar',
    length: 3,
    nullable: true,
  })
  converted_currency!: string | null;

  @Column({
    type: 'numeric',
    precision: 18,
    scale: 8,
    nullable: true,
  })
  exchange_rate!: string | null;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.RECEIVED,
  })
  status!: OrderStatus;

  @Column({
    type: 'text',
    nullable: true,
  })
  failure_reason!: string | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  processed_at!: Date | null;

  @CreateDateColumn({
    type: 'timestamp with time zone',
  })
  created_at!: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
  })
  updated_at!: Date;

  @OneToMany(
    () => OrderItemEntity,
    (item) => item.order,
    {
      cascade: true,
    },
  )
  items!: OrderItemEntity[];
}