import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
        project: "./tsconfig.json",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      // Naming convention for functions'
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "function",
          format: ["camelCase"],
        },
      ],

      // TypeScript rules
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "disable",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowNullish: true },
      ],

      // Use TypeScript's no-unused-expressions
      "@typescript-eslint/no-unused-expressions": [
        "error",
        { allowShortCircuit: true },
      ],

      // Disable the base rule
      "no-unused-expressions": "off",

      // JavaScript rules
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "arrow-body-style": ["error", "as-needed"],
      semi: ["error", "always"],
    },
  },
  {
    rules: pluginJs.configs.recommended.rules, // JavaScript recommended rules
  },
  {
    rules: tseslint.configs.recommended.rules, // TypeScript recommended rules
  },
];
