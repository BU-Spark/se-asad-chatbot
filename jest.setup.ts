import '@testing-library/jest-dom';

// Mock window.matchMedia for all tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock Clerk server auth to avoid importing ESM in tests
jest.mock('@clerk/nextjs/server', () => ({
  auth: async () => ({ userId: undefined }),
}));

// Mock Next.js redirect to a no-op in tests
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));
