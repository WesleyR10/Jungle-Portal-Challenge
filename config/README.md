# Shared Configurations (`@jungle/config`)

Este diretório centraliza todas as configurações compartilhadas de *tooling* e *code style* do monorepo **Jungle Challenge**. O objetivo é garantir consistência, manutenibilidade e uma experiência de desenvolvimento (DX) padronizada entre todos os serviços e aplicações.

## Estrutura dos Pacotes

Cada subdiretório aqui é um *workspace* npm privado, versionado e consumível pelos apps e packages do projeto.

### 1. ESLint Config (`@jungle/eslint-config`)
Define as regras de linting para garantir qualidade e padronização do código.
- **Exports:**
  - `base.js`: Regras comuns (JS/TS) para qualquer pacote.
  - `react.js`: Extensão para aplicações Frontend (React + Hooks + Acessibilidade).
  - `nest.js`: Extensão otimizada para Backend (NestJS + Decorators).
- **Features:** Integração automática com Prettier, ordenação de imports (`simple-import-sort`) e suporte a TypeScript.

### 2. Prettier Config (`@jungle/prettier-config`)
Define a formatação de código opinionada do projeto.
- **Regras Principais:** Sem ponto e vírgula, aspas simples, largura de 80 caracteres.
- **Plugins:** Inclui `prettier-plugin-tailwindcss` para ordenação automática de classes CSS.

### 3. TSConfig (`@jungle/tsconfig`)
Bases de configuração do TypeScript para diferentes contextos de execução.
- **Exports:**
  - `base.json`: Configurações estritas (`strict: true`), sem emitir arquivos.
  - `react.json`: Configuração para apps React (JSX, DOM, ESNext).
  - `nest.json`: Configuração para serviços NestJS (Decorators, CommonJS/Node, SourceMaps).

### 4. Lint Staged (`@jungle/lint-staged-config`)
Configuração para o *pre-commit hook* via Husky.
- **Função:** Garante que apenas arquivos formatados e lintados sejam commitados.
- **Regras:** Roda `prettier --write` em arquivos `.ts`, `.tsx`, `.js`, `.json` e `.md` staged.

## Como Utilizar

Para consumir estas configurações em um novo aplicativo ou pacote:

1. **Adicione as dependências** no `package.json` do app:
   ```json
   "devDependencies": {
     "@jungle/eslint-config": "*",
     "@jungle/prettier-config": "*",
     "@jungle/tsconfig": "*"
   }
   ```

2. **Estenda as configurações** nos arquivos locais:

   - **.eslintrc.js**:
     ```javascript
     module.exports = {
       extends: ["@jungle/eslint-config/react"] // ou 'nest'
     };
     ```

   - **tsconfig.json**:
     ```json
     {
       "extends": "@jungle/tsconfig/react.json", // ou 'nest.json'
       "compilerOptions": {
         "outDir": "./dist"
       },
       "include": ["src"]
     }
     ```

   - **.prettierrc.js**:
     ```javascript
     export { default } from "@jungle/prettier-config";
     ```

## Padrões Adotados
- **Strict by Default:** TypeScript no modo estrito para evitar erros em tempo de execução.
- **Zero Config Overhead:** Apps consumidores não devem ter regras complexas locais, apenas estender as bases.
- **Automated Formatting:** Prettier cuida do estilo, ESLint cuida da lógica e boas práticas.
