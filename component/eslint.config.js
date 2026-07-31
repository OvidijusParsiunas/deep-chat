import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {ignores: ['node_modules', 'dist', 'custom-elements.json', 'vite.config.ts']},
  js.configs.recommended,
  ...tsPlugin.configs['flat/recommended'],
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'no-prototype-builtins': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', {argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_'}],
      'max-len': ['error', {code: 123}],
      'eqeqeq': 'warn',
      'no-throw-literal': 'warn',
      'semi': 'warn',
      'prefer-template': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
    },
  },
];
