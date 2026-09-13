import { defineConfig } from 'jest';

export default defineConfig({
  preset: 'ts-jest',
  testEnvironment: '<rootDir>/tests/environment.ts',
  testTimeout: 50000,
  openHandlesTimeout: 0,
  setupFiles: [
    '<rootDir>/tests/setup.ts',
  ],
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/core/$1',
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@actions/core$': '<rootDir>/tests/mocks/@actions/core.ts',
    '^@actions/github$': '<rootDir>/tests/mocks/@actions/github.ts',
  },
});
