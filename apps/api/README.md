## Backend – Jungle Microservices API

O diretório `apps/api/` concentra todos os serviços backend do desafio Jungle. Aqui vivem o API Gateway HTTP, os microserviços de domínio (auth, tasks, notifications) e o módulo de configuração compartilhado.

O objetivo desta pasta é ser o “backbone” da plataforma: receber requisições HTTP, orquestrar chamadas entre serviços via RabbitMQ, persistir dados em PostgreSQL e emitir notificações em tempo real para o front.

---

## Visão geral dos serviços

`apps/api/` está organizado da seguinte forma:

- `api-gateway/` – Porta de entrada HTTP e documentação Swagger
- `auth-service/` – Autenticação, tokens e identidade do usuário
- `tasks-service/` – Gestão de tarefas, comentários e fluxo colaborativo
- `notifications-service/` – Notificações em tempo real via WebSocket
- `config-module/` – Módulo de configuração compartilhada baseado em `@jungle/env`

Cada serviço é um app Nest.js independente, mas todos seguem padrões comuns: TypeORM com PostgreSQL, mensageria com RabbitMQ, validação com `class-validator`/`class-transformer`, logging com `nestjs-pino` e configuração centralizada.

---

## API Gateway (`api-gateway/`)

Responsabilidade:

- Expor a API HTTP pública utilizada pelo front (`apps/web`).
- Agregar e orquestrar chamadas entre os microserviços de auth, tasks e notifications.
- Fornecer documentação via Swagger em `/api/docs`.

Pontos importantes:

- Stack:
  - Nest.js
  - `@nestjs/microservices` para integração com RabbitMQ
  - `@nestjs/swagger` para documentação
  - `nestjs-pino` para logs estruturados
  - `helmet` e CORS habilitados por padrão (`apps/api/api-gateway/src/main.ts`)
- Endpoints alvo:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/refresh`
  - `GET /api/tasks?page=&size=`
  - `POST /api/tasks`
  - `GET /api/tasks/:id`
  - `PUT /api/tasks/:id`
  - `DELETE /api/tasks/:id`
  - `POST /api/tasks/:id/comments`
  - `GET /api/tasks/:id/comments?page=&size=`

Ele não implementa as regras de negócio diretamente: delega para os microserviços via RabbitMQ, mantendo o Gateway fino, focado em autenticação, roteamento, validação de entrada e apresentação dos contratos HTTP.

---

## Auth Service (`auth-service/`)

Responsabilidade:

- Gerenciar autenticação e identidade dos usuários.
- Emitir e validar tokens JWT (access e refresh tokens).
- Centralizar regras de segurança ligadas a login, registro e renovação de sessão.

Pontos importantes:

- Stack:
  - Nest.js + TypeORM + PostgreSQL
  - `@jungle/auth-module` para encapsular lógica de JWT/guards/strategies
  - `@jungle/types` para DTOs e contratos compartilhados
  - `@jungle/config-module` / `@jungle/env` para configuração tipada
- Integração:
  - Recebe requisições indiretamente via Gateway.
  - Publica/consome mensagens em RabbitMQ quando necessário para outros serviços (ex.: eventos de usuário criado).

Este serviço é o responsável por garantir que o acesso aos demais domínios (tasks, notifications) seja sempre autenticado e alinhado com o modelo de tokens da plataforma.

---

## Tasks Service (`tasks-service/`)

Responsabilidade:

- Manter o ciclo de vida das tarefas:
  - criação, atualização, atribuição, mudança de status, exclusão.
- Persistir tasks, comentários e possíveis relações de usuários atribuídos.
- Emitir eventos para outros serviços quando o estado de uma tarefa muda.

Pontos importantes:

- Stack:
  - Nest.js + TypeORM + PostgreSQL
  - `@jungle/types` para contratos de tarefas e comentários
  - `@jungle/config-module` / `@jungle/env` para configuração
- Integração:
  - Atendido pelo Gateway para todas as rotas `/api/tasks`.
  - Publica eventos em RabbitMQ, como:
    - `task.created`
    - `task.updated`
    - `task.comment.created`
  - Esses eventos são consumidos pelo `notifications-service` para notificar usuários conectados.

Este serviço é o coração do domínio de tarefas colaborativas, garantindo consistência de dados e integrando o fluxo de criação/comentário com o pipeline de notificações.

---

## Notifications Service (`notifications-service/`)

Responsabilidade:

- Consumir eventos de tasks e comentários enviados para RabbitMQ.
- Persistir/registrar notificações relevantes.
- Expor um gateway WebSocket (Socket.IO) para o front.

Pontos importantes:

- Stack:
  - Nest.js + `@nestjs/websockets` + `@nestjs/platform-socket.io`
  - `@nestjs/microservices` com transporte RabbitMQ
  - TypeORM + PostgreSQL para guardar histórico de notificações (quando necessário)
  - `@jungle/types` e `@jungle/config-module` para contratos e configuração
- Integração:
  - Recebe mensagens de:
    - `task.created`
    - `task.updated`
    - `task.comment.created`
  - Emite para os clientes WebSocket os eventos consumidos pelo front:
    - `task:created`
    - `task:updated`
    - `comment:new`

É este serviço que transforma eventos de domínio em feedback em tempo real na UI, fechando o ciclo entre backend e front.

---

## Config Module (`config-module/`)

Responsabilidade:

- Fornecer um módulo Nest.js reutilizável de configuração para os serviços.
- Aplicar o schema de variáveis de ambiente definido em `@jungle/env`.
- Expor objetos/configs tipados para uso interno de cada microserviço.

Pontos importantes:

- Stack:
  - `@nestjs/config`
  - `@jungle/env`
  - `zod`, `class-validator`, `class-transformer` para validação
- Benefícios:
  - Um único lugar para evoluir as regras de configuração.
  - Todos os serviços sobem com os mesmos contratos de env, evitando divergência em ambientes.
