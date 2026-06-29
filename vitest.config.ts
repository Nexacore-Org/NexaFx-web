import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "next/navigation": path.resolve(
        __dirname,
        "__tests__/stubs/next-navigation.ts"
      ),
      "next/link": path.resolve(__dirname, "__tests__/stubs/next-link.tsx"),
    },
  },
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['lib/api-client.ts', 'hooks/use-auth-store.ts']
    },
    projects: [
      {
        extends: true,
        test: {
          environment: 'jsdom',
          setupFiles: ['./vitest.setup.ts', './__tests__/setup.ts'],
          include: ["**/*.test.{ts,tsx}"],
          globals: true,
          exclude: ["**/node_modules/**", ".next", "dist", ".kilo", "e2e/**", "e2e"]
        }
      }, 
      {
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
      }
    ]
  }
});
