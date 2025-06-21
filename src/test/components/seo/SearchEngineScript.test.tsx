import { render } from '@testing-library/react';
import { SearchEngineScript } from '@/components/seo/SearchEngineScript';
import { vi } from 'vitest';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('SearchEngineScript', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('应该能正常渲染', () => {
    expect(() => render(<SearchEngineScript />)).not.toThrow();
  });

  it('当没有同意时不应该抛出错误', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    expect(() => render(<SearchEngineScript />)).not.toThrow();
  });
});
