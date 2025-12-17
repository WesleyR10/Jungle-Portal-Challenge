## Jungle Tasks Portal – Monorepo Full‑stack

Este repositório implementa um **Sistema de Gestão de Tarefas Colaborativo** inspirado no desafio Full‑stack Júnior da Jungle Gaming. A proposta é construir um sistema completo de tarefas com autenticação, microserviços, mensageria e UI moderna, organizado em um monorepo com Turborepo.

O projeto demonstra:

- Organização de monorepo com Turborepo.
- Microserviços Nest.js com comunicação via RabbitMQ.
- API Gateway HTTP com Swagger.
- Front‑end React com TanStack Router, shadcn/ui e Tailwind.
- Notificações em tempo real via WebSocket.
- Infraestrutura dockerizada pronta para desenvolvimento local.

---

## Como rodar o projeto

Passo a passo resumido para subir o ambiente localmente.

1. Instalar dependências na raiz:

```bash
npm install
```

2. Configurar variáveis de ambiente:

```bash
cp .env.example .env
```

Edite `.env` se necessário (portas, credenciais de banco, RabbitMQ, chaves JWT, etc.).

3. Subir infraestrutura e serviços com Docker:

```bash
npm run dev:docker:up
```

Isso sobe:

- PostgreSQL
- RabbitMQ (com painel de management)
- Auth Service
- Tasks Service
- Notifications Service
- API Gateway

4. Rodar o front‑end localmente:

Em outro terminal:

```bash
cd apps/web
npm install
npm run dev
```

Por padrão, o Vite expõe a aplicação em `http://localhost:5173` (ou porta equivalente mostrada no terminal).

5. Acessos rápidos:

- Front‑end: portal de tarefas – interface principal.
- API Gateway:
  - Swagger em `http://localhost:<API_GATEWAY_PORT>/api/docs`.
  - Endpoints HTTP sob `/api/...`.
- RabbitMQ management:
  - `http://localhost:15672` (usuário/senha conforme `.env`).

---

## Visão geral da arquitetura

A arquitetura foi pensada para refletir um cenário real de produto, com front‑end moderno, API Gateway, microserviços desacoplados e comunicação assíncrona via broker de mensagens.

- **Front‑end (`apps/web`)**
  - React + TypeScript
  - TanStack Router, TanStack Query
  - shadcn/ui + Tailwind CSS
  - WebSocket para notificações (Socket.IO client)

- **Backend (`apps/api`)**
  - API Gateway Nest.js (HTTP + Swagger)
  - Microserviço de autenticação (`auth-service`)
  - Microserviço de tarefas (`tasks-service`)
  - Microserviço de notificações (`notifications-service`, WebSocket)
  - RabbitMQ como broker de eventos
  - PostgreSQL (TypeORM) como banco de dados

- **Pacotes compartilhados (`packages/`)**
  - `@jungle/types` – tipos/DTOs compartilhados
  - `@jungle/auth-module` – módulo de autenticação Nest reusável
  - `@jungle/env` – validação e tipagem de variáveis de ambiente

---

## Stack e requisitos principais

- **Front‑end**
  - React.js + TanStack Router
  - shadcn/ui + Tailwind CSS
  - react-hook-form + zod
  - Zustand ou Context API para auth
  - WebSocket para notificações

- **Back‑end**
  - Nest.js + TypeORM (PostgreSQL)
  - JWT (access 15 min, refresh 7 dias) com Passport
  - Microserviços Nest.js com RabbitMQ
  - WebSocket Gateway
  - DTOs com class-validator/class-transformer
  - Rate limiting no API Gateway

60→- **Infra & DevX**
61→ - Monorepo com Turborepo
62→ - Docker & docker-compose para subir tudo (app, DB, broker, etc.)
63→---

## Escopo funcional

O sistema foi pensado para cobrir um fluxo completo de trabalho colaborativo em torno de tarefas:

- **Autenticação & sessão**
  - Cadastro e login com e‑mail, username e senha.
  - Hash de senha com bcrypt ou argon2.
  - Tokens:
    - `accessToken` com expiração curta (15 minutos).
    - `refreshToken` com expiração longa (7 dias).
  - Endpoint de refresh para renovar sessão sem exigir login manual.
  - Proteção de rotas no API Gateway usando JWT + Guards.

- **Tarefas, comentários e histórico**
  - CRUD completo de tarefas com campos:
    - título, descrição, prazo (due date),
    - prioridade (`LOW`, `MEDIUM`, `HIGH`, `URGENT`),
    - status (`TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`).
  - Atribuição de tarefas a múltiplos usuários.
  - Comentários por tarefa, com listagem paginada.
  - Histórico de alterações (audit log simplificado) para entender evolução da tarefa.

- **Notificações & tempo real**
  - Publicação de eventos em RabbitMQ sempre que:
    - uma tarefa é criada,
    - uma tarefa é atualizada,
    - um comentário é criado.
  - Serviço de notificações consome os eventos, persiste o que for relevante e envia para o front via WebSocket.
  - Notificações em tempo real quando:
    - uma tarefa é atribuída ao usuário,
    - o status de uma tarefa muda,
    - há novo comentário em uma tarefa em que o usuário participa.

---

## Estrutura do monorepo

Visão geral (detalhes adicionais em cada README específico):

- `apps/web/`
  - Front React do portal de tarefas.
  - Documentado em: [`apps/web/README.md`](apps/web/README.md)

- `apps/api/`
  - Todos os serviços backend (Gateway, auth, tasks, notifications, config-module).
  - Documentado em: [`apps/api/README.md`](apps/api/README.md)

- `packages/`
  - Pacotes compartilhados: tipos, auth-module, env.
  - Documentado em: [`packages/README.md`](packages/README.md)

- `config/`
  - Tooling compartilhado (ESLint, Prettier, TSConfig, lint-staged).
  - Documentado em: [`config/README.md`](config/README.md)

Arquivos principais na raiz:

- `docker-compose.yml` / `docker-compose.prod.yml` – orquestração de serviços.
- `turbo.json` – configuração do Turborepo (tasks, cache, envs globais).
- `package.json` – scripts de orquestração (build, migrations, docker, etc.).

---

## Fluxo de desenvolvimento com Turborepo

O monorepo é orquestrado com Turborepo. Os comandos principais na raiz:

- Desenvolvimento:

```bash
npm run dev           # roda turbo run dev para os apps relevantes
```

- Lint e tipos:

```bash
npm run lint          # turbo run lint
npm run check-types   # turbo run check-types
```

- Build:

```bash
npm run build:packages   # build dos pacotes em packages/
npm run build:services   # build dos serviços em apps/api/
npm run build:all        # build de tudo
```

- Migrations TypeORM:

```bash
npm run migrate:all:run
npm run migrate:all:revert
```

Os detalhes de config compartilhada (ESLint, Prettier, TSConfig, lint-staged) estão em [`config/README.md`](config/README.md).

---

## Docker & docker-compose

Todo o ambiente pode ser levantado via Docker Compose, incluindo:

- API Gateway
- Auth Service
- Tasks Service
- Notifications Service
- Frontend Web
- PostgreSQL 17
- RabbitMQ 3.13 com painel de management

Comandos principais (na raiz):

```bash
npm run dev:docker      # sobe serviços principais em modo attached
npm run dev:docker:up   # sobe em background
npm run dev:docker:down # derruba tudo

npm run docker:build    # build das imagens
npm run docker:rebuild  # rebuild completo e sobe em background
```

O arquivo `docker-compose.yml` foi desenhado para subir todos os serviços necessários (apps, banco e broker) com networking, volumes de dados e variáveis de ambiente adequadas para desenvolvimento local.

---

## Documentação por área

Para aprofundar em cada parte do projeto:

- Front‑end (UI, rotas, notificações):
  - [`apps/web/README.md`](apps/web/README.md)

- Backend e microsserviços:
  - [`apps/api/README.md`](apps/api/README.md)

- Pacotes compartilhados (`@jungle/types`, `@jungle/auth-module`, `@jungle/env`):
  - [`packages/README.md`](packages/README.md)

- Tooling de monorepo (ESLint, Prettier, TSConfig, lint-staged):
  - [`config/README.md`](config/README.md)

---

## Endpoints HTTP e eventos WebSocket

Principais contratos expostos pelo API Gateway e serviço de notificações:

- **HTTP – Auth**
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/refresh`

- **HTTP – Tarefas**
  - `GET    /api/tasks?page=&size=` – lista de tarefas com paginação.
  - `POST   /api/tasks` – cria tarefa e publica evento de criação.
  - `GET    /api/tasks/:id` – detalhes da tarefa.
  - `PUT    /api/tasks/:id` – atualiza tarefa e publica evento de atualização.
  - `DELETE /api/tasks/:id` – remove tarefa.

- **HTTP – Comentários**
  - `POST /api/tasks/:id/comments` – cria comentário e publica evento de comentário criado.
  - `GET  /api/tasks/:id/comments?page=&size` – lista comentários com paginação.

- **WebSocket – Notificações**
  - `task:created` – tarefa foi criada.
  - `task:updated` – tarefa foi atualizada.
  - `comment:new` – novo comentário em uma tarefa.

---

Para revisão de código ou apresentação, este README serve como índice principal, com links diretos para a documentação detalhada de cada parte do sistema.
