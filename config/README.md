# Shared Configurations (`config/*`)

Este diretório centraliza todos os _workspaces_ de configuração compartilhada do monorepo **Jungle Challenge**.  
O objetivo é:

- garantir consistência de código entre Web, API Gateway e microserviços;
- reduzir duplicação de configuração por projeto;
- facilitar a evolução coordenada de tooling (ESLint, Prettier, TypeScript, Husky, lint-staged).

Cada subdiretório é um pacote npm privado, versionado e referenciado via `workspaces` no `package.json` raiz.

---

## Visão Geral dos Pacotes

Atualmente existem quatro pacotes principais sob `config/`:

1. `config/eslint-config` → `@jungle/eslint-config`
2. `config/prettier-config` → `@jungle/prettier-config`
3. `config/tsconfig` → `@jungle/tsconfig`
4. `config/lint-staged` → `@jungle/lint-staged-config`

Eles são utilizados por:

- apps web (`apps/web`);
- API Gateway (`apps/api/api-gateway`);
- microserviços (`apps/api/auth-service`, `apps/api/tasks-service`, `apps/api/notifications-service`);
- pacotes compartilhados (`packages/*`, `apps/api/config-module`, `packages/env`).

---

## 1. ESLint Config (`@jungle/eslint-config`)

**Pacote:** `config/eslint-config`  
Fornece configurações de ESLint para todo o monorepo, com foco em:

- suporte completo a TypeScript;
- integração com Prettier;
- regras específicas para React e NestJS;
- regras de monorepo (`eslint-plugin-turbo`).

### Arquivos exportados

- `base.js`
  - Configuração base compartilhada (`@eslint/js`, `typescript-eslint`, `eslint-config-prettier`).
  - Ativa a regra `turbo/no-undeclared-env-vars` como `warn`.
  - Ignora `dist/**`.

- `react.js`
  - Extende `@typescript-eslint` + `eslint:recommended` + `react` + `react-hooks` + `prettier`.
  - Marca `React` e `JSX` como globais.
  - Ativa `simple-import-sort/imports` e `simple-import-sort/exports`.
  - Ignora `node_modules/` e `dist/`.

- `nest.js`
  - Extende `@typescript-eslint` + `eslint:recommended` + `prettier` + `eslint-config-turbo`.
  - Ignora `node_modules/` e `dist/`.
  - Relaxa algumas regras mais agressivas (por exemplo `no-explicit-any`) para DX mais pragmática em serviços.

---

## 2. Prettier Config (`@jungle/prettier-config`)

**Pacote:** `config/prettier-config`  
Define a formatação de código padrão do monorepo, incluindo suporte a Tailwind CSS.

### Características principais

- `plugins: ['prettier-plugin-tailwindcss']`
- `printWidth: 80`
- `tabWidth: 2`
- `semi: false`
- `singleQuote: true`
- `trailingComma: 'es5'`
- `arrowParens: 'always'`

---

## 3. TSConfig (`@jungle/tsconfig`)

**Pacote:** `config/tsconfig`  
Centraliza _presets_ de TypeScript para cenários diferentes: base, React e NestJS.

### Arquivos exportados

- `base.json`
  - Configuração padrão com `strict: true`, `declaration` e `declarationMap` habilitados.
  - `moduleResolution: 'node'`, `isolatedModules: true`, `skipLibCheck: true`.

- `react.json`
  - Extende `./base.json`.
  - Ativa suporte a JSX (`jsx: 'react-jsx'`).
  - Usa libs `["dom", "dom.iterable", "esnext"]`.

- `nest.json`
  - Extende `./base.json`.
  - Ajusta `module: 'commonjs'`, `emitDecoratorMetadata`, `experimentalDecorators`.
  - Gera `dist/` com `sourceMap`.

---

## 4. Lint Staged (`@jungle/lint-staged-config`)

**Pacote:** `config/lint-staged`  
Controla o comportamento do `lint-staged` usado pelo hook de _pre-commit_ (configurado no `package.json` raiz).

### Configuração

`config/lint-staged/index.js`:

```js
module.exports = {
  "**/*.{js,ts,tsx,json,md}": ["prettier --write"],
};
```

No `package.json` raiz:

```json
"lint-staged": {
  "*": "lint-staged --config ./config/lint-staged/index.js"
}
```

Ou seja:

- para qualquer arquivo staged com extensão suportada, `prettier --write` é executado antes do commit;
- isso garante que todo código que entra no repositório respeita a configuração compartilhada de formatação.

---

## Como adicionar um novo app ou serviço

Para criar um novo app/serviço usando as configurações compartilhadas:

1. **Adicionar dependências de configuração**

   ```json
   "devDependencies": {
     "@jungle/eslint-config": "*",
     "@jungle/prettier-config": "*",
     "@jungle/tsconfig": "*"
   }
   ```

2. **Criar arquivos de configuração mínimos**
   - `.eslintrc.js` (React ou Nest):

     ```js
     module.exports = {
       extends: ["@jungle/eslint-config/react"], // ou 'nest'
     };
     ```

   - `tsconfig.json`:

     ```json
     {
       "extends": "@jungle/tsconfig/react.json",
       "compilerOptions": {
         "outDir": "./dist"
       },
       "include": ["src"]
     }
     ```

   - `.prettierrc.js`:

     ```js
     export { default } from "@jungle/prettier-config";
     ```

3. **Confiar no hook de pre-commit**

- Husky + lint-staged, já configurados na raiz, vão aplicar `prettier` automaticamente nos arquivos staged.
- Não é necessário criar configs duplicadas de lint/format em cada projeto.

---

## Princípios de Design

- **Single Source of Truth**  
  Configurações de lint, format e TypeScript vivem em `config/*` e são estendidas pelos apps.

- **DX acima de tudo**  
  As presets priorizam boas práticas, mas sem atrapalhar o fluxo de desenvolvimento (por exemplo, algumas regras mais agressivas são apenas `warn`).

- **Evolução incremental**  
  Ajustes em `config/*` se propagam para todos os projetos, permitindo endurecer regras de forma gradual.

- **Monorepo-friendly**  
  Integração com `turbo` via `eslint-plugin-turbo` para evitar uso incorreto de variáveis de ambiente em pipelines de build.
