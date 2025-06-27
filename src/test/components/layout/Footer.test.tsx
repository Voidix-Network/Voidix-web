import { Footer } from '@/components/layout/Footer';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock child components
vi.mock('@/components', () => ({
  VoidixLogo: ({
    size,
    variant,
    className,
  }: {
    size: string;
    variant: string;
    className?: string;
  }) => (
    <div data-testid="voidix-logo" data-size={size} data-variant={variant} className={className}>
      Voidix Logo
    </div>
  ),
}));

vi.mock('@/components/layout/footer/QuickJoinSection', () => ({
  QuickJoinSection: () => <div data-testid="quick-join-section">Quick Join Section</div>,
}));

vi.mock('@/components/layout/footer/CommunityLinksSection', () => ({
  CommunityLinksSection: () => (
    <div data-testid="community-links-section">Community Links Section</div>
  ),
}));

vi.mock('@/components/layout/footer/ServerStatusBar', () => ({
  ServerStatusBar: () => <div data-testid="server-status-bar">Server Status Bar</div>,
}));

vi.mock('@/components/layout/footer/CopyrightSection', () => ({
  CopyrightSection: () => <div data-testid="copyright-section">Copyright Section</div>,
}));

describe('Footer', () => {
  it('应该渲染所有子组件', () => {
    render(<Footer />);

    // 验证所有子组件是否渲染
    expect(screen.getByTestId('quick-join-section')).toBeInTheDocument();
    expect(screen.getByTestId('community-links-section')).toBeInTheDocument();
    expect(screen.getByTestId('server-status-bar')).toBeInTheDocument();
    expect(screen.getByTestId('copyright-section')).toBeInTheDocument();
  });

  it('应该渲染 Logo 区域', () => {
    render(<Footer />);

    // 验证 Logo
    expect(screen.getByTestId('voidix-logo')).toBeInTheDocument();
    expect(screen.getByTestId('voidix-logo')).toHaveAttribute('data-size', 'lg');
    expect(screen.getByTestId('voidix-logo')).toHaveAttribute('data-variant', 'full');
    expect(screen.getByTestId('voidix-logo')).toHaveClass('mb-4');
  });

  it('应该应用正确的 CSS 类名结构', () => {
    const { container } = render(<Footer />);

    const footer = container.querySelector('footer');
    expect(footer).toHaveClass('bg-gray-800/70', 'border-t', 'border-gray-600');

    // 验证主容器
    const mainContainer = footer?.querySelector('.max-w-7xl');
    expect(mainContainer).toHaveClass(
      'max-w-7xl',
      'mx-auto',
      'px-4',
      'sm:px-6',
      'lg:px-8',
      'py-20'
    );

    // 验证网格布局
    const gridContainer = mainContainer?.querySelector('.grid');
    expect(gridContainer).toHaveClass(
      'grid',
      'grid-cols-1',
      'sm:grid-cols-2',
      'lg:grid-cols-3',
      'gap-16',
      'lg:gap-20'
    );
  });

  it('应该在底部渲染分隔线和底部内容', () => {
    const { container } = render(<Footer />);

    // 验证底部分割线
    const bottomSection = container.querySelector('.mt-20.pt-8.border-t.border-gray-700\\/50');
    expect(bottomSection).toBeInTheDocument();

    // 验证底部内容在分割线之后
    expect(screen.getByTestId('server-status-bar')).toBeInTheDocument();
    expect(screen.getByTestId('copyright-section')).toBeInTheDocument();
  });

  it('应该正确设置 Logo 区域的隐藏样式', () => {
    const { container } = render(<Footer />);

    // Logo区域应该在小屏幕上隐藏，在大屏幕上显示
    const logoSection = container.querySelector('.hidden.lg\\:flex');
    expect(logoSection).toBeInTheDocument();
    expect(logoSection).toHaveClass(
      'hidden',
      'lg:flex',
      'flex-col',
      'items-center',
      'justify-center'
    );
  });

  it('应该渲染 Logo 区域的描述文本', () => {
    const { container } = render(<Footer />);

    // 查找Logo区域的文本中心容器
    const logoTextCenter = container.querySelector('.text-center');
    expect(logoTextCenter).toBeInTheDocument();
    expect(logoTextCenter).toHaveClass('text-center');
  });

  it('应该为组件部分正确设置间距', () => {
    const { container } = render(<Footer />);

    // 验证主要部分和底部部分之间的间距
    const bottomSection = container.querySelector('.mt-20');
    expect(bottomSection).toBeInTheDocument();
    expect(bottomSection).toHaveClass('mt-20', 'pt-8');
  });
});
