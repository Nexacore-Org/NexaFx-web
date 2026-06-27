import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react'; // Include if your project layout runs standard Vite-React plugins

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8', // or 'istanbul' depending on your preference
      reporter: ['text', 'json', 'html'],
    }
  },
});