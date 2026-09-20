# Order Orchestrator

API desenvolvida em **NestJS** para recebimento e processamento assíncrono de pedidos.

O projeto implementa validação de pedidos, idempotência, persistência transacional, processamento assíncrono com RabbitMQ, conversão de moeda através da AwesomeAPI, mecanismo de retry com backoff e Dead Letter Queue (DLQ).

## Stack

* Node.js
* NestJS
* TypeScript
* PostgreSQL
* TypeORM
* RabbitMQ
* Docker / Docker Compose
* AwesomeAPI
* Jest
* class-validator
* Joi
* Decimal.js

## Arquitetura

A aplicação foi organizada em módulos seguindo responsabilidades bem definidas:

* **Orders**: recebimento, persistência e consulta dos pedidos.
* **Currency**: consulta de cotação e conversão dos valores.
* **Outbox**: persistência e publicação dos eventos de domínio.
* **Queue**: comunicação com RabbitMQ e métricas das filas.

O projeto utiliza o padrão **Transactional Outbox** para garantir que a criação do pedido e o registro do evento sejam realizados na mesma transação do banco de dados.

O processamento da conversão de moeda é assíncrono. O webhook retorna `202 Accepted` após o pedido e o evento serem persistidos, enquanto o processamento posterior é realizado por um worker através do RabbitMQ.

## Principais decisões técnicas

### Transactional Outbox

O pedido e o evento de processamento são persistidos na mesma transação do PostgreSQL.

A tabela `outbox_events` é posteriormente processada pelo publisher, que publica os eventos no RabbitMQ.

Essa abordagem reduz o risco de inconsistência entre a persistência do pedido e a publicação da mensagem.

### Idempotência

O endpoint de criação utiliza `idempotency_key` para evitar o processamento duplicado de uma mesma requisição.

Também existe uma constraint única para `order_id`, permitindo identificar conflitos entre pedidos com o mesmo identificador externo.

### Processamento assíncrono

A conversão de moeda não bloqueia a requisição HTTP.

O processamento é realizado através de RabbitMQ e um worker dedicado.

### Retry e DLQ

Falhas durante o processamento possuem mecanismo de retry com backoff utilizando filas específicas.

Após o limite configurado de tentativas, a mensagem é encaminhada para uma Dead Letter Queue e o pedido é marcado como `FAILED_CONVERSION`.

### Precisão monetária

Os valores financeiros são calculados utilizando `Decimal.js` para evitar problemas de precisão comuns em operações com `number`.

No PostgreSQL, valores monetários são armazenados utilizando `numeric`.

## Estrutura do projeto

```text
src/
├── config/
│   ├── app.config.ts
│   ├── currency.config.ts
│   ├── database.config.ts
│   └── queue.config.ts
│
├── database/
│   ├── data-source.ts
│   └── migrations/
│
├── modules/
│   ├── currency/
│   │   ├── clients/
│   │   ├── dto/
│   │   ├── services/
│   │   ├── workers/
│   │   └── currency.module.ts
│   │
│   ├── orders/
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── enums/
│   │   ├── mappers/
│   │   ├── repositories/
│   │   ├── services/
│   │   └── orders.module.ts
│   │
│   ├── outbox/
│   │   ├── entities/
│   │   ├── repositories/
│   │   ├── services/
│   │   └── outbox.module.ts
│   │
│   └── queue/
│       ├── clients/
│       ├── controllers/
│       ├── services/
│       └── queue.module.ts
│
├── app.module.ts
└── main.ts
```

## Requisitos

Para executar o projeto localmente:

* Node.js 20+
* npm 10+
* Docker
* Docker Compose

## Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3000
NODE_ENV=development

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=order_orchestrator
DATABASE_USER=dev
DATABASE_PASSWORD=dev@1234

RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=dev
RABBITMQ_PASSWORD=dev@1234
RABBITMQ_VHOST=/

RABBITMQ_ORDERS_QUEUE=orders.currency-conversion
RABBITMQ_ORDERS_DLQ=orders.currency-conversion.dlq
RABBITMQ_MAX_RETRIES=3
RABBITMQ_MANAGEMENT_PORT=15672

ORDER_CONVERSION_TARGET_CURRENCY=BRL

CURRENCY_API_BASE_URL=https://economia.awesomeapi.com.br
```

## Instalação

Instale as dependências:

```bash
npm install
```

## Infraestrutura

Suba PostgreSQL e RabbitMQ:

```bash
docker compose up -d
```

Verifique os serviços:

```bash
docker compose ps
```

RabbitMQ Management:

```text
http://localhost:15672
```

Credenciais padrão:

```text
username: rabbitmq
password: rabbitmq
```

## Banco de dados

Execute as migrations:

```bash
npm run migration:run
```

Para reverter a última migration:

```bash
npm run migration:revert
```

O projeto utiliza migrations do TypeORM e `synchronize` permanece desabilitado.

## Executando a aplicação

Ambiente de desenvolvimento:

```bash
npm run start:dev
```

A API estará disponível em:

```text
http://localhost:3000
```

## Endpoints

### Criar pedido

```http
POST /webhooks/orders
```

Exemplo:

```json
{
  "order_id": "ORDER-001",
  "customer": {
    "name": "João Silva",
    "email": "joao@example.com"
  },
  "items": [
    {
      "sku": "PRODUCT-001",
      "qty": 2,
      "unit_price": 59.90
    }
  ],
  "currency": "USD",
  "idempotency_key": "550e8400-e29b-41d4-a716-446655440000"
}
```

Resposta esperada:

```http
202 Accepted
```

### Listar pedidos

```http
GET /orders
```

Suporta filtro por status e paginação:

```http
GET /orders?status=CONVERTED
GET /orders?page=1&limit=20
```

### Buscar pedido

```http
GET /orders/:id
```

### Métricas das filas

```http
GET /queue/metrics
```

Retorna informações sobre mensagens disponíveis e não confirmadas nas filas utilizadas pelo processamento.

## Exemplo de processamento

Para um pedido de:

```text
currency: USD
total_amount: 100.00
```

com uma cotação de:

```text
USD → BRL
5.30
```

o pedido será atualizado com:

```text
converted_amount: 530.00
converted_currency: BRL
exchange_rate: 5.30
status: CONVERTED
```

A cotação é obtida através da AwesomeAPI.

## Status dos pedidos

Os pedidos podem assumir os seguintes estados:

| Status              | Descrição                                                               |
| ------------------- | ----------------------------------------------------------------------- |
| `RECEIVED`          | Pedido recebido e persistido                                            |
| `PROCESSING`        | Pedido em processamento                                                 |
| `CONVERTED`         | Conversão de moeda concluída                                            |
| `FAILED_CONVERSION` | Processamento de conversão não concluído após as tentativas disponíveis |

## Retry

O processamento utiliza filas de retry com backoff:

```text
orders.currency-conversion.retry.1
orders.currency-conversion.retry.2
orders.currency-conversion.retry.3
```

Após atingir o limite configurado, a mensagem é encaminhada para:

```text
orders.currency-conversion.dlq
```

## Testes

Executar os testes:

```bash
npm test
```

Executar em modo watch:

```bash
npm run test:watch
```

Executar cobertura:

```bash
npm run test:cov
```

## Scripts

Principais scripts disponíveis:

```bash
npm run start:dev
npm run build
npm run start:prod

npm test
npm run test:watch
npm run test:cov

npm run migration:run
npm run migration:revert

docker compose up -d
docker compose down
```

## Observações

* PostgreSQL e RabbitMQ são executados via Docker Compose.
* O banco utiliza migrations para controle de schema.
* O processamento dos pedidos é assíncrono.
* A publicação dos eventos utiliza o padrão Transactional Outbox.
* A aplicação utiliza idempotência para evitar processamento duplicado.
* O projeto não utiliza Prisma.
