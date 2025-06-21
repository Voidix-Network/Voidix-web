import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage';
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
  Shield: () => <div data-testid="shield-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  Cookie: () => <div data-testid="cookie-icon" />,
  Database: () => <div data-testid="database-icon" />,
  Lock: () => <div data-testid="lock-icon" />,
  Mail: () => <div data-testid="mail-icon" />,
}));

// Mock components
vi.mock('@/components', () => ({
  AnimatedSection: ({ children }: any) => <div>{children}</div>,
  BreadcrumbNavigation: () => <div>面包屑导航</div>,
  GradientText: ({ children }: any) => <span>{children}</span>,
}));

vi.mock('@/components/seo', () => ({
  PageSEO: () => null,
}));

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <PrivacyPolicyPage />
    </BrowserRouter>
  );
};

describe('PrivacyPolicyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该正确渲染页面标题', () => {
    renderComponent();
    expect(screen.getByText('隐私政策')).toBeInTheDocument();
  });

  it('应该显示最后更新日期', () => {
    renderComponent();
    expect(screen.getByText('最后更新：2025年6月21日')).toBeInTheDocument();
  });

  it('应该能正常渲染', () => {
    expect(() => renderComponent()).not.toThrow();
  });
});
