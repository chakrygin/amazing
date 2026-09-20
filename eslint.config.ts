import eslint from '@eslint/js';
import tslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig({
  files: [
    '**/*.{js,ts}',
    '*.config.ts',
  ],
  ignores: [
    'dist/**',
  ],
  plugins: {
    '@stylistic': stylistic
  },
  extends: [
    eslint.configs.recommended,
    tslint.configs.recommendedTypeChecked,
    tslint.configs.strictTypeChecked,
    tslint.configs.stylisticTypeChecked
  ],
  languageOptions: {
    globals: globals.node,
    parserOptions: {
      projectService: {
        allowDefaultProject: [
          '*.config.ts',
        ],
      },
    }
  },
  rules: {
    // ESLint Stylistic
    '@stylistic/quotes': ['error', 'single'],
    '@stylistic/semi': ['error', 'always'],
  }
});
