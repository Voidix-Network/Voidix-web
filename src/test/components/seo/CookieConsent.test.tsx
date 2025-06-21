import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CookieConsent } from '@/components/seo/CookieConsent';
import { vi } from 'vitest';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Cookie: () => <div data-testid="cookie-icon" />,
  Shield: () => <div data-testid="shield-icon" />,
  X: () => <div data-testid="x-icon" />,
}));

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

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <CookieConsent />
    </BrowserRouter>
  );
};

describe('CookieConsent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('当已有同意记录时不应该显示横幅', () => {
    mockLocalStorage.getItem.mockReturnValue('true');

    renderComponent();

    expect(screen.queryByText('Cookie使用同意')).not.toBeInTheDocument();
  });

  it('组件应该能正常渲染', () => {
    expect(() => renderComponent()).not.toThrow();
  });
});
