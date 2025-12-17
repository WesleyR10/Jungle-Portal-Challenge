# Passo a Passo da Implementação - Auth Service

Este documento registra as etapas realizadas para configurar o `auth-service` e integrar ao monorepo.

## 1. Setup Inicial

- [x] Criada estrutura de pastas `apps/auth-service` seguindo padrão NestJS.
- [x] Configurado `package.json` com scripts de build, lint, test.
- [x] Configurado `tsconfig.json` extendendo `@jungle/tsconfig/nest.json` (herança de configuração).
- [x] Configurado `nest-cli.json` para facilitar geração de código.

## 2. Pacotes Compartilhados

- [x] Criado pacote `@jungle/types` em `packages/types` para interfaces compartilhadas (User, Auth).
- [x] Removida dependência explícita do ESLint no `packages/types` (herdada do workspace).

## 3. Dependências e Banco de Dados

- [x] Instaladas libs Core: `@nestjs/config`, `@nestjs/typeorm`, `typeorm`, `pg`.
- [x] Instaladas libs Auth: `passport`, `@nestjs/passport`, `passport-jwt`, `bcrypt`.
- [x] Instaladas libs Validação: `class-validator`, `class-transformer`.
- [x] Criada entidade `User` (TypeORM) com suporte a UUID.

## 4. Implementação da Lógica de Auth

- [x] Configurar conexão com Banco de Dados no `AppModule` (usando variáveis de ambiente).
- [x] Implementar `UsersService` (Create, FindByEmail).
- [x] Implementar `AuthService` (Validação de senha com bcrypt, Geração de JWT).
- [x] Implementar `AuthController` (Endpoints: POST /auth/login, POST /auth/register).
- [x] Configurar variáveis de ambiente (`.env` e `.env.example`).
- [x] Implementar estratégia JWT RS256 com chaves RSA.
- [x] Implementar `JwtAuthGuard` para proteção de rotas.

## 5. Próximos Passos

- [x] Validar funcionamento rodando o serviço.
- [x] Configurar API Gateway para expor estas rotas.
