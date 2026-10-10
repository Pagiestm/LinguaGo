import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig(
  globalIgnores([
    '**/node_modules/',
    '**/dist/',
    '**/dev-dist/',
    '**/coverage/',
    'server/src/generated/',
    'client/playwright-report/',
    'client/test-results/',
    'client/blob-report/',
  ]),

  js.configs.recommended,
  tseslint.configs.recommended,

  {
    files: ['*.{js,mjs,cjs,ts}', '*/*.config.{js,mjs,cjs,ts}'],
    languageOptions: { globals: globals.node },
  },

  {
    files: ['client/**/*.{js,ts,vue}'],
    extends: [pluginVue.configs['flat/recommended']],
    languageOptions: {
      globals: { ...globals.browser, ...globals.serviceworker },
      parserOptions: { parser: tseslint.parser, tsconfigRootDir: join(rootDir, 'client') },
    },
    rules: {
      'no-undef': 'off',
      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowShortCircuit: true, allowTernary: true },
      ],
    },
  },

  {
    files: ['server/**/*.ts'],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: join(rootDir, 'server'),
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
    },
  },
  {
    files: ['server/**/*.spec.ts', 'server/test/**/*.ts'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/require-await': 'off',
    },
  },

  prettierRecommended,
);
