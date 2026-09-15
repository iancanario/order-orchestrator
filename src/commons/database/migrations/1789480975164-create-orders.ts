import { MigrationInterface, QueryRunner, TableIndex, TableUnique } from "typeorm";
import { Table } from "typeorm/browser";

export class CreateOrders1789480975164 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          CREATE TYPE "order_status_enum"
          AS ENUM (
            'RECEIVED',
            'PROCESSING',
            'CONVERTED',
            'FAILED_CONVERSION'
          )
        `);
    
        await queryRunner.createTable(
          new Table({
            name: 'orders',
            columns: [
              {
                name: 'id',
                type: 'uuid',
                isPrimary: true,
                default: 'gen_random_uuid()',
              },
              {
                name: 'order_id',
                type: 'varchar',
                length: '100',
                isNullable: false,
              },
              {
                name: 'idempotency_key',
                type: 'varchar',
                length: '255',
                isNullable: false,
              },
              {
                name: 'customer_email',
                type: 'varchar',
                length: '255',
                isNullable: false,
              },
              {
                name: 'customer_name',
                type: 'varchar',
                length: '150',
                isNullable: false,
              },
              {
                name: 'currency',
                type: 'varchar',
                length: '3',
                isNullable: false,
              },
              {
                name: 'total_amount',
                type: 'numeric',
                precision: 18,
                scale: 2,
                isNullable: false,
              },
              {
                name: 'converted_amount',
                type: 'numeric',
                precision: 18,
                scale: 2,
                isNullable: true,
              },
              {
                name: 'converted_currency',
                type: 'varchar',
                length: '3',
                isNullable: true,
              },
              {
                name: 'exchange_rate',
                type: 'numeric',
                precision: 18,
                scale: 8,
                isNullable: true,
              },
              {
                name: 'status',
                type: 'order_status_enum',
                default: "'RECEIVED'",
                isNullable: false,
              },
              {
                name: 'failure_reason',
                type: 'text',
                isNullable: true,
              },
              {
                name: 'processed_at',
                type: 'timestamptz',
                isNullable: true,
              },
              {
                name: 'created_at',
                type: 'timestamptz',
                default: 'CURRENT_TIMESTAMP',
                isNullable: false,
              },
              {
                name: 'updated_at',
                type: 'timestamptz',
                default: 'CURRENT_TIMESTAMP',
                isNullable: false,
              },
            ],
          }),
        );
    
        await queryRunner.createUniqueConstraint(
          'orders',
          new TableUnique({
            name: 'uq_orders_order_id',
            columnNames: ['order_id'],
          }),
        );
    
        await queryRunner.createUniqueConstraint(
          'orders',
          new TableUnique({
            name: 'uq_orders_idempotency_key',
            columnNames: ['idempotency_key'],
          }),
        );
    
        await queryRunner.createIndex(
          'orders',
          new TableIndex({
            name: 'idx_orders_status',
            columnNames: ['status'],
          }),
        );
    
        await queryRunner.createIndex(
          'orders',
          new TableIndex({
            name: 'idx_orders_created_at',
            columnNames: ['created_at'],
          }),
        );
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('orders');
    
        await queryRunner.query(`
          DROP TYPE IF EXISTS "order_status_enum"
        `);
      }

}
