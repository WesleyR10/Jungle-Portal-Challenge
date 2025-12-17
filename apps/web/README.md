## Web App – Jungle Tasks Portal

Este app é o front-end do sistema de gestão de tarefas colaborativo da Jungle. Ele foi desenhado para demonstrar um fluxo completo de produtividade: autenticação, board de tarefas em tempo real, comentários e notificações com uma DX moderna.

---

## Stack principal

- `React 19` com `TypeScript`
- `Vite` como bundler (`rolldown-vite`)
- `TanStack Router` para roteamento baseado em file/routes
- `TanStack Query` para data fetching, cache e sincronização com a API
- `React Hook Form` + `Zod` para formulários tipados
- `Tailwind CSS` + `shadcn/ui` para UI consistente
- `Zustand` para estados globais específicos (auth, notificações, etc.)
- `socket.io-client` para notificações em tempo real
- `@jungle/env` para integração com o contrato de variáveis de ambiente do monorepo

---

## Arquitetura de pastas

`apps/web/src` é organizado por feature, privilegiando coesão de domínio em vez de tipo de arquivo.

- `assets/`
  - Recursos estáticos, ícones e imagens específicos do front.

- `components/`
  - Componentes compartilhados entre features.
  - Subpasta `components/ui/` concentra os building blocks inspirados em shadcn/ui (botões, cards, inputs, tooltips, etc.).

- `features/`
  - Pasta principal de domínio da aplicação.
  - Cada feature agrupa telas, hooks, validações e componentes específicos.

  - `features/auth/`
    - `components/`: blocos de UI reutilizáveis (ex.: formulários).
    - `hooks/`: lógica de formulário e integração com a API de auth.
    - `pages/`: páginas de Login e Registro.
    - `validation/`: schemas de validação com `zod`.

  - `features/tasks/`
    - `components/`: board, cards de tarefa, cabeçalhos e elementos de interação.
    - `hooks/`: integrações com a API de tarefas, query options, mutações, etc.
    - `layout/`: layouts específicos para o contexto de tarefas (shell de navegação, dock, etc.).
    - `pages/`: listagem, board, detalhe e criação de tarefas.
    - `validation/`: schemas para criação/edição de tasks.

- `lib/`
  - Funções de infraestrutura e utilitários de alto nível:
    - Configuração de notificações em tempo real (`socket.io-client` + `TanStack Query` + toasts).
    - Utilitários de UI (ex.: `cn` com `clsx` + `tailwind-merge`).
    - Tipos de tasks, mapeamentos de labels, helpers de queries, etc.

- `routes/`
  - Declaração das rotas com `TanStack Router`.
  - Define root route, rotas públicas (login/registro) e rotas protegidas (área de tarefas).
  - Concentra redirects e lógica de proteção de rota baseada no estado de auth.

- `store/`
  - Estados globais via `Zustand` (ex.: store de autenticação, preferências ou UI).
  - Evita dependência em libs mais pesadas e mantém o front previsível.

- Arquivos de entrada:
  - `main.tsx`: ponto de bootstrap do app.
  - `router.tsx`: criação e configuração do router (providers, devtools, etc.).
  - `App.tsx`: shell principal consumido pelas rotas.

---

## Integração com o monorepo

Este app não é um front isolado: ele foi construído para conversar com os serviços do monorepo e aproveitar os pacotes compartilhados.

- Usa `@jungle/env` para ler configurações de ambiente de forma tipada.
- Fala com o **API Gateway** para:
  - Autenticação (`/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`).
  - Operações de tasks (`/api/tasks` e derivados).
  - Comentários em tarefas (`/api/tasks/:id/comments`).
- Conecta-se ao serviço de **notificações** via WebSocket:
  - Eventos como `task:created`, `task:updated` e `comment:new` são refletidos na UI.
  - Integração com TanStack Query para invalidar/refrescar listas de tarefas automaticamente.

Essa integração garante que o front exerça bem o papel de “portal” sobre a arquitetura de microserviços da Jungle.

---

## Experiência de uso e de desenvolvimento

- **UX**:
  - Board de tarefas com drag-and-drop (`@hello-pangea/dnd`) para mudar status de forma natural.
  - Formulários com validação imediata (`React Hook Form` + `Zod`).
  - Feedback visual consistente via componentes `ui/` e toasts.

- **DX**:
  - `npm run dev`: desenvolvimento rápido com Vite.
  - `npm run lint` e `npm run lint:fix`: ESLint integrado com a config compartilhada `@jungle/eslint-config` e organização automática de imports.
  - Tipagem estrita via `@jungle/tsconfig` e integração com toda a toolchain do monorepo.

---

## Arquitetura de autenticação no front

- Armazena `accessToken` e `refreshToken` em `localStorage`, orquestrados por uma store `Zustand`.
- O estado de autenticação é inicializado na criação do `QueryClient`, permitindo:
  - Proteger rotas no `TanStack Router` com base em `isAuthenticated`.
  - Sincronizar a UI rapidamente com o estado real do usuário.
- O front está preparado para conversar com os endpoints:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/refresh`

Isso garante que o app web respeite o desenho de tokens de acesso (curta duração) e refresh tokens (longa duração) definido nos serviços de auth.

---

## Notificações em tempo real e UX reativa

- Conexão via `socket.io-client` com o serviço de notificações.
- Eventos suportados:
  - `task:created`
  - `task:updated`
  - `comment:new`
  - Eventos auxiliares como “alguém está digitando” em uma tarefa.
- Integração com:
  - `TanStack Query` para invalidar/atualizar listas e detalhes de tarefas.
  - Store dedicada (`Zustand`) para estados visuais como “última tarefa atualizada” e “usuário digitando”.

O foco não é apenas receber eventos, mas transformar essas informações em feedback visual imediato para o usuário (toasts, destaques em cards, listas atualizadas).

---

## Front preparado para produção

- **Tailwind + shadcn/ui**:
  - Tema configurado com CSS variables, suporte a dark mode baseado em classe (`darkMode: ['class', 'class']`).
  - Tokens de design (`colors`, `borderRadius`, animações customizadas) centralizados.

- **Build e entrega**:
  - Dockerfile multi-stage:
    - Usa `turbo prune` para reduzir contexto de build.
    - Build isolado do app `web` via `turbo build --filter=web...`.
    - Servido por `nginx` com config customizada de SPA e Gzip.
  - Pronto para rodar atrás de um reverse proxy ou gateway em produção.

---

## Quando olhar para este app em code review

Este projeto é um bom ponto de entrada para entender:

- Como um front moderno conversa com um ecossistema de microserviços (API Gateway + serviços de domínio + notificações).
- Como organizar features em React/TanStack Router com foco em domínio.
- Como alinhar validação de formulários, tipos de API e contratos compartilhados em um monorepo.

Ele foi pensado para ser tanto uma vitrine da stack escolhida quanto um ambiente confortável para evoluir novas features de produto.
