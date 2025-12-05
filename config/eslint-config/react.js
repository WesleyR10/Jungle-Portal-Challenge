/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:prettier/recommended",
    "eslint-config-turbo"
  ],
  plugins: ["@typescript-eslint", "simple-import-sort"],
  globals: {
    React: true,
    JSX: true,
  },
  env: {
    browser: true,
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  ignorePatterns: [
    ".*.js",
    "node_modules/",
    "dist/",
  ],
  rules: {
    "react/react-in-jsx-scope": "off",
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "prettier/prettier": ["error", {}, { usePrettierrc: true }],
  },
};
