import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '.build/**',
        'docs-archive/**',
        'feedback/**',
        'tests/**',
        '**/*.config.*',
        '**/vendor/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
    include: ['tests/**/*.test.{js,mjs,ts}'],
    exclude: ['node_modules', 'dist', '.build'],
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@cms': path.resolve(__dirname, './cms'),
      '@editor': path.resolve(__dirname, './editor'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
});
