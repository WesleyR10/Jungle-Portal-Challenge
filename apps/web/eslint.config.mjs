import baseConfig from '../../config/eslint-config/base.js'

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...baseConfig,
  {
    ignores: ['dist/**'],
  },
]
