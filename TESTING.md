# NexaFx Testing Guide

This document describes how to run and debug tests in the NexaFx project.

## Test Stack

- **Test Runner**: Jest 30.x
- **TypeScript**: ts-jest 29.x preset
- **Environment**: jsdom (React Testing Library)
- **Module Aliases**: `@/*` mapped to project root via `moduleNameMapper`

## Running Tests

### Full Test Suite
```bash
npm test
```
Runs all tests in watch mode by default. Press `a` to run all, `q` to quit.

### Run Once (CI Mode)
```bash
npm test -- --watchAll=false
```
Or use the CI script (if configured):
```bash
npm run test:ci
```

### Single Test File
```bash
npm test -- path/to/test-file.test.ts
# Example:
npm test -- lib/__tests__/api-client.test.ts
```

### Watch Mode (Default)
```bash
npm test
```
Automatically re-runs tests when files change. Press `p` to filter by filename, `t` to filter by test name.

### Debug a Single Test
```bash
npm test -- --testNamePattern="should auto-advance focus" --watchAll=false
```

### Coverage Report
```bash
npm test -- --coverage
```
Generates coverage report in `coverage/` directory.

## Jest Configuration

Key settings in `jest.config.js`:

```javascript
{
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterSetup: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: false }],
  },
}
```

### Module Alias Resolution

The `@/*` alias maps to the project root. This means:
- `@/hooks/use-auth-store` → `hooks/use-auth-store.ts`
- `@/lib/api/notifications` → `lib/api/notifications.ts`
- `@/components/ui/button` → `components/ui/button.tsx`

## Writing Tests

### Component Tests (React Testing Library)

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Hook Tests

```ts
import { act } from 'react';
import { useAuthStore } from '@/hooks/use-auth-store';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('sets auth correctly', () => {
    act(() => {
      useAuthStore.getState().setAuth(mockUser, 'access', 'refresh');
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });
});
```

### API Client Tests

Mock fetch globally or use MSW:
```ts
global.fetch = jest.fn();

beforeEach(() => {
  (global.fetch as jest.Mock).mockReset();
});

it('fetches notifications', async () => {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: () => Promise.resolve([mockNotification]),
  });
  const result = await getNotifications();
  expect(result).toEqual([mockNotification]);
});
```

## Test File Locations

| Type | Location |
|------|----------|
| Component tests | `components/**/__tests__/*.test.tsx` |
| Hook tests | `hooks/__tests__/*.test.ts` |
| API tests | `lib/__tests__/*.test.ts` |
| Utility tests | `lib/__tests__/*.test.ts` |
| Integration tests | `tests/*.test.ts` |

## Common Patterns

### Mocking Next.js Router
```ts
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  usePathname: () => '/dashboard',
}));
```

### Mocking Zustand Stores
```ts
import { useAuthStore } from '@/hooks/use-auth-store';

jest.mock('@/hooks/use-auth-store', () => ({
  useAuthStore: {
    getState: () => ({
      user: mockUser,
      isAuthenticated: true,
      logout: jest.fn(),
    }),
  },
}));
```

### Async Testing
```ts
it('handles async operation', async () => {
  render(<Component />);
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});
```

## Debugging Tips

1. **Verbose output**: `npm test -- --verbose`
2. **Single test with logging**: `npm test -- --testNamePattern="test name" --verbose`
3. **Inspect DOM**: Add `screen.debug()` in test to print current DOM
4. **VS Code Debug**: Create launch config:
   ```json
   {
     "type": "node",
     "request": "launch",
     "name": "Jest Debug",
     "program": "${workspaceFolder}/node_modules/.bin/jest",
     "args": ["--runInBand", "--testNamePattern", "your test name"],
     "console": "integratedTerminal"
   }
   ```

## CI Integration

Tests run in GitHub Actions workflow (`.github/workflows/ci.yml`):
- `npm ci` installs dependencies
- `npm test -- --watchAll=false --ci` runs tests once
- Coverage thresholds enforced (see #894)

## Related Documentation

- [Contributing Guidelines](Contribution.md)
- [Development Scripts](README.md#-development-scripts)
- [Zustand Store Conventions](docs/store-conventions.md)