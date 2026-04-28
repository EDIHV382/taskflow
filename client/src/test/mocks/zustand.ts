import { vi } from 'vitest';

// Mock zustand persist middleware
vi.mock('zustand/middleware', () => ({
  persist: (fn: any) => fn,
}));
