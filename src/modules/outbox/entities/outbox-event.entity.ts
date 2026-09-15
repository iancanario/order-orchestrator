import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('outbox_events')
export class OutboxEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  event_type!: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  aggregate_type!: string;

  @Column({
    type: 'uuid',
  })
  aggregate_id!: string;

  @Column({
    type: 'jsonb',
  })
  payload!: Record<string, unknown>;

  @Column({
    type: 'boolean',
    default: false,
  })
  published!: boolean;

  @Column({
    type: 'integer',
    default: 0,
  })
  attempts!: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  last_error!: string | null;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  published_at!: Date | null;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  created_at!: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
  })
  updated_at!: Date;
}