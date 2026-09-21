import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '.artifacts/**',
      '.cache/**',
      '.logs/**',
      'manifest.schema.json',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['packages/**/*.ts'],
    languageOptions: {
      ...config.languageOptions,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
  })),
];
