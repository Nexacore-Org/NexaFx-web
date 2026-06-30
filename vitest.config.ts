import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(dirname, './'),
      // next/navigation + next/link rely on App Router context that doesn't
      // exist under jsdom; point them at lightweight test stubs.
      'next/navigation': path.resolve(dirname, '__tests__/stubs/next-navigation.ts'),
      'next/link': path.resolve(dirname, '__tests__/stubs/next-link.tsx'),
    }
  },
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['lib/api-client.ts', 'hooks/use-auth-store.ts']
    },
    projects: [{
      extends: true,
      test: {
        environment: 'jsdom',
        setupFiles: ['./vitest.setup.ts', './__tests__/setup.ts'],
        globals: true,
        include: ['**/*.test.{ts,tsx}'],
        exclude: ['node_modules', 'e2e/**', '.next', 'dist']
      }
    }, {
      extends: true,
      plugins: [
        storybookTest({
          configDir: path.join(dirname, '.storybook')
        })
      ],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        }
      }
    }]
  }
});
