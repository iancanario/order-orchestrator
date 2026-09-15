import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class CreateOrdersItems1789481038683 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
          new Table({
            name: 'order_items',
            columns: [
              {
                name: 'id',
                type: 'uuid',
                isPrimary: true,
                default: 'gen_random_uuid()',
              },
              {
                name: 'order_id',
                type: 'uuid',
                isNullable: false,
              },
              {
                name: 'sku',
                type: 'varchar',
                length: '100',
                isNullable: false,
              },
              {
                name: 'qty',
                type: 'integer',
                isNullable: false,
              },
              {
                name: 'unit_price',
                type: 'numeric',
                precision: 18,
                scale: 2,
                isNullable: false,
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
    
        await queryRunner.createForeignKey(
          'order_items',
          new TableForeignKey({
            name: 'fk_order_items_order_id',
            columnNames: ['order_id'],
            referencedTableName: 'orders',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        );
    
        await queryRunner.createIndex(
          'order_items',
          new TableIndex({
            name: 'idx_order_items_order_id',
            columnNames: ['order_id'],
          }),
        );
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('order_items');
      }

}
