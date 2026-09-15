import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { OrderEntity } from './order.entity';

@Entity('order_items')
export class OrderItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  sku!: string;

  @Column({
    type: 'integer',
  })
  qty!: number;

  @Column({
    type: 'numeric',
    precision: 18,
    scale: 2,
  })
  unit_price!: string;

  @Column({
    type: 'uuid',
  })
  order_id!: string;

  @ManyToOne(
    () => OrderEntity,
    (order) => order.items,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'order_id',
  })
  order!: OrderEntity;

  @CreateDateColumn({
    type: 'timestamp with time zone',
  })
  created_at!: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
  })
  updated_at!: Date;
}