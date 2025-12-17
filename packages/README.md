## Visão geral de `packages/`

O diretório `packages/` concentra os pacotes compartilhados do monorepo. Eles existem para evitar duplicação de código entre os serviços Nest.js (auth, tasks, notifications, api-gateway) e o front-end React, garantindo contratos estáveis, validação consistente e uma experiência de desenvolvimento previsível.

Hoje o workspace é composto por:

- `@jungle/types`: modelos e DTOs compartilhados entre serviços e gateway
- `@jungle/auth-module`: módulo de autenticação reusável para Nest.js
- `@jungle/env`: camada única de validação de variáveis de ambiente

Todos os pacotes são publicados apenas dentro do monorepo (via workspaces) e são construídos em TypeScript com saída ESM/CJS quando necessário.

---

## `@jungle/types`

Pacote: `packages/types`

Responsabilidade:

- Centralizar tipos de domínio e DTOs utilizados pela API Gateway, microserviços Nest.js e, quando fizer sentido, pelo front-end.
- Padronizar contratos da API (auth, tasks, comments, notifications) para que alterações de schema sejam rastreáveis e revisadas em um único lugar.
- Expor tipos prontos para uso em Swagger e class-validator/class-transformer.

Pontos importantes:

- Build dual: ESM e CJS, com `exports` configurados para o Node moderno.
- Depende apenas de ferramentas de tipagem/validação (`class-validator`, `class-transformer`) e da configuração de TypeScript compartilhada (`@jungle/tsconfig`).
- Pensado para ser consumido tanto pelo `@jungle/auth-module` quanto pelos serviços de tasks e notifications.

Uso típico (exemplo em um serviço Nest.js):

```ts
import { AuthUserDto } from "@jungle/types";

export class GetProfileResponse {
  user: AuthUserDto;
}
```

---

## `@jungle/auth-module`

Pacote: `packages/auth-module`

Responsabilidade:

- Fornecer um módulo de autenticação Nest.js reutilizável para o ecossistema do monorepo.
- Encapsular a integração com JWT, Passport, estratégias, guards e uso dos tipos definidos em `@jungle/types`.
- Reduzir boilerplate de autenticação nos microserviços e no API Gateway.

Pontos importantes:

- Depende de `@nestjs/common`, `@nestjs/core`, `@nestjs/jwt`, `@nestjs/passport` e `@jungle/types`.
- Ideal para consolidar:
  - Estratégias JWT (access/refresh tokens)
  - Guards reutilizáveis (`JwtAuthGuard`, etc.)
  - Serviços de geração/validação de tokens
- É um bloco de construção: o API Gateway pode simplesmente importar e configurar o módulo sem reimplementar todo o fluxo de auth.

Uso típico (exemplo em um app Nest.js):

```ts
import { Module } from "@nestjs/common";
import { AuthModule } from "@jungle/auth-module";

@Module({
  imports: [AuthModule],
})
export class ApiGatewayAuthFeatureModule {}
```

---

## `@jungle/env`

Pacote: `packages/env`

Responsabilidade:

- Ser a fonte única de verdade para validação e tipagem das variáveis de ambiente do monorepo.
- Usar `@t3-oss/env-core` + `zod` para garantir que cada serviço suba apenas com configurações válidas.
- Padronizar nomes, tipos e comportamento de envs críticos:
  - Postgres (host, porta, usuário, senha, database)
  - RabbitMQ
  - JWT (chaves e expirações)
  - Portas dos serviços (gateway, auth, tasks, notifications)

Pontos importantes:

- Evita “drift” de configuração entre serviços: todos olham para o mesmo esquema.
- Facilita rodar `docker compose` e ambientes de desenvolvimento, já que os contratos de envs estão centralizados.

---

## Como os pacotes se encaixam na arquitetura

- **API Gateway**:
  - Usa `@jungle/types` para tipar DTOs e respostas HTTP.
  - Pode reutilizar `@jungle/auth-module` para toda a parte de autenticação.
  - Lê configurações de `@jungle/env` para montar conexões (DB, RabbitMQ, JWT).

- **Microserviços (auth, tasks, notifications)**:
  - Compartilham contratos de domínio e eventos através de `@jungle/types`.
  - Dependem de `@jungle/env` para garantir que sobem com as variáveis corretas.

- **Front-end React (apps/web)**:
  - Se necessário, consome tipos de `@jungle/types` para alinhar o cliente com os contratos do backend.

O resultado é um monorepo onde decisões de domínio (tipos, contratos, envs, auth) são centralizadas em `packages/`, reduzindo bugs de integração e acelerando a evolução da plataforma.

---

## Fluxo de desenvolvimento com `packages/`

- Para alterar ou criar novos contratos:
  - Comece em `@jungle/types`.
  - Atualize serviços e gateway para usar os novos tipos.

- Para evoluir autenticação:
  - Centralize estratégias e serviços novos em `@jungle/auth-module`.

- Para adicionar novas configurações de ambiente:
  - Adicione primeiro em `@jungle/env`.
  - Propague o uso para os serviços.

Build dos pacotes:

```bash
npm run build:packages
```

Esse comando garante que todos os pacotes em `packages/` estejam compilados antes de buildar ou subir os serviços.
