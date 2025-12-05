/** @typedef {import('prettier').Config} PrettierConfig */

/** @type { PrettierConfig } */
const config = {
  plugins: ['prettier-plugin-tailwindcss'],
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: false, // Remove ponto e vírgula no final de linhas
  singleQuote: true, // Adiciona aspas simples em todo o código
  quoteProps: 'as-needed', // Adiciona aspas duplas apenas quando necessário
  jsxSingleQuote: false, // Adiciona aspas simples em JSX
  trailingComma: 'es5', // Adiciona vírgula no final de objetos e arrays
  bracketSpacing: true, // Adiciona espaços entre chaves e parâmetros de função
  arrowParens: 'always', // Adiciona parênteses em funções de uma linha
  endOfLine: 'auto', // Adiciona nova linha no final de arquivos
  bracketSameLine: false, // Coloca chaves de objetos em uma linha
}

export default config
