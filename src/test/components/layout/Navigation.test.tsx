import { Navigation } from '@/components/layout/Navigation';
import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock child components
vi.mock('@/components', () => ({
  VoidixLogo: ({ size, variant }: { size: string; variant: string }) => (
    <div data-testid="voidix-logo" data-size={size} data-variant={variant}>
      Voidix Logo
    </div>
  ),
}));

vi.mock('@/components/layout/navigation/MobileMenuButton', () => ({
  MobileMenuButton: ({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) => (
    <button data-testid="mobile-menu-button" onClick={onToggle}>
      {isOpen ? 'Close' : 'Open'} Menu
    </button>
  ),
}));

vi.mock('@/components/layout/navigation/MobileMenu', () => ({
  MobileMenu: ({
    isOpen,
    items,
    onItemClick,
  }: {
    isOpen: boolean;
    items: any[];
    onItemClick: (href: string) => void;
  }) => (
    <div data-testid="mobile-menu" style={{ display: isOpen ? 'block' : 'none' }}>
      {items.map(item => (
        <button key={item.href} onClick={() => onItemClick(item.href)}>
          {item.label}
        </button>
      ))}
    </div>
  ),
}));

const renderNavigation = () => {
  return render(
    <BrowserRouter>
      <Navigation />
    </BrowserRouter>
  );
};

describe('Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该渲染基本的导航结构', () => {
    renderNavigation();

    // 验证 Logo
    expect(screen.getByTestId('voidix-logo')).toBeInTheDocument();
    expect(screen.getByTestId('voidix-logo')).toHaveAttribute('data-size', 'lg');
    expect(screen.getByTestId('voidix-logo')).toHaveAttribute('data-variant', 'text');

    // 验证移动端菜单按钮
    expect(screen.getByTestId('mobile-menu-button')).toBeInTheDocument();

    // 验证移动端菜单
    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
  });

  it('应该渲染桌面端导航项目', () => {
    renderNavigation();

    // 验证导航项目 - 使用getAllByText处理重复元素
    const statusLinks = screen.getAllByText('状态页');
    expect(statusLinks.length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('常见问题').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Bug反馈').length).toBeGreaterThanOrEqual(1);
  });

  it('应该在点击 Logo 时导航到首页', () => {
    renderNavigation();

    const logoButton = screen.getByTestId('voidix-logo').closest('button');
    expect(logoButton).toBeInTheDocument();

    fireEvent.click(logoButton!);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('应该在点击导航项目时正确导航', () => {
    // Mock window.location.href
    const originalLocation = window.location;
    const mockLocationSetter = vi.fn();

    // 使用 Object.defineProperty 安全地mock location
    const mockLocation = {
      ...originalLocation,
      assign: vi.fn(),
      replace: vi.fn(),
      reload: vi.fn(),
    };

    Object.defineProperty(mockLocation, 'href', {
      set: mockLocationSetter,
      get: () => '',
      configurable: true,
    });

    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
      configurable: true,
    });

    renderNavigation();

    // 点击桌面端的状态页链接（第一个）- 现在是外部链接
    const statusLinks = screen.getAllByText('状态页');
    fireEvent.click(statusLinks[0]);
    expect(mockLocationSetter).toHaveBeenCalledWith('/status');

    // 点击常见问题
    const faqLinks = screen.getAllByText('常见问题');
    fireEvent.click(faqLinks[0]);
    expect(mockLocationSetter).toHaveBeenCalledWith('/faq');

    // 点击Bug反馈
    const bugLinks = screen.getAllByText('Bug反馈');
    fireEvent.click(bugLinks[0]);
    expect(mockLocationSetter).toHaveBeenCalledWith('/bug-report');

    // 恢复原始window.location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it('应该能够切换移动端菜单状态', () => {
    renderNavigation();

    const mobileMenuButton = screen.getByTestId('mobile-menu-button');
    const mobileMenu = screen.getByTestId('mobile-menu');

    // 初始状态应该是关闭的
    expect(mobileMenuButton).toHaveTextContent('Open Menu');
    expect(mobileMenu).toHaveStyle({ display: 'none' });

    // 点击打开菜单
    fireEvent.click(mobileMenuButton);
    expect(mobileMenuButton).toHaveTextContent('Close Menu');
    expect(mobileMenu).toHaveStyle({ display: 'block' });

    // 再次点击关闭菜单
    fireEvent.click(mobileMenuButton);
    expect(mobileMenuButton).toHaveTextContent('Open Menu');
    expect(mobileMenu).toHaveStyle({ display: 'none' });
  });

  it('应该正确设置导航栏的样式类', () => {
    const { container } = renderNavigation();

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass(
      'fixed',
      'w-full',
      'bg-[#151f38]/90',
      'backdrop-blur-md',
      'z-50',
      'border-b',
      'border-gray-700'
    );
  });

  it('应该为桌面端导航项目应用正确的样式', () => {
    renderNavigation();

    // 获取桌面端的状态页链接（有完整样式类的那个）
    const { container } = render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );

    const desktopNavLinks = container.querySelectorAll('.hidden.lg\\:flex button');
    expect(desktopNavLinks[0]).toHaveClass(
      'text-gray-300',
      'hover:text-white',
      'px-2',
      'py-2',
      'rounded-md',
      'text-sm',
      'font-medium',
      'transition-colors'
    );
  });
});
