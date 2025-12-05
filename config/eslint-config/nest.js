/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "eslint-config-turbo"
  ],
  plugins: ["@typescript-eslint", "simple-import-sort"],
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [
    ".*.js",
    "node_modules/",
    "dist/",
  ],
  rules: {
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "prettier/prettier": ["error", {}, { usePrettierrc: true }],
  },
};
