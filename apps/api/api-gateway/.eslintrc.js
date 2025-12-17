module.exports = {
  extends: ['@jungle/eslint-config/nest'],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
}
