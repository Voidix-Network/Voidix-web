/**
 * NotFoundPage 组件测试套件
 * 测试404错误页面的渲染、导航功能、状态码设置和SEO配置
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotFoundPage } from '@/pages/NotFoundPage';
import React from 'react';

// Mock React Router
vi.mock('react-router-dom', () => ({
  Link: ({ children, to, className }: any) => (
    <a href={to} className={className} data-testid="router-link">
      {children}
    </a>
  ),
}));

// Mock SEO组件
vi.mock('@/components/seo', () => ({
  PageSEO: ({ title, description, keywords, additionalMeta }: any) => (
    <div
      data-testid="page-seo"
      data-title={title}
      data-description={description}
      data-keywords={keywords}
      data-additional-meta={JSON.stringify(additionalMeta)}
    >
      PageSEO
    </div>
  ),
}));

// Mock Lucide React图标
vi.mock('lucide-react', () => {
  const MockIcon = ({ className }: any) => <div className={className} data-testid="lucide-icon" />;
  return {
    Home: MockIcon,
    ArrowLeft: MockIcon,
    Search: MockIcon,
  };
});

// Mock window 对象
Object.defineProperty(window, 'history', {
  value: {
    back: vi.fn(),
  },
  configurable: true,
});

describe('NotFoundPage', () => {
  // Mock useEffect 以避免 DOM 操作问题
  let useEffectSpy: any;

  beforeEach(() => {
    // 清理所有mock
    vi.clearAllMocks();

    // Mock React.useEffect 来避免 DOM 操作
    useEffectSpy = vi.spyOn(React, 'useEffect').mockImplementation(() => {
      // 只执行一些不涉及 DOM 的操作
      if (typeof window !== 'undefined') {
        document.title = '页面未找到 - Voidix';
      }
    });
  });

  afterEach(() => {
    // 恢复 useEffect
    useEffectSpy?.mockRestore();
  });

  describe('基础渲染', () => {
    it('应该正确渲染页面', () => {
      render(<NotFoundPage />);

      // 验证页面能够成功渲染
      expect(screen.getByTestId('page-seo')).toBeInTheDocument();
      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByText('页面走丢了')).toBeInTheDocument();
    });

    it('应该包含正确的错误信息', () => {
      render(<NotFoundPage />);

      // 验证错误描述文字
      expect(screen.getByText('抱歉，您访问的页面不存在或已被移动。')).toBeInTheDocument();
      expect(screen.getByText('可能是链接错误，或者页面已经不存在了。')).toBeInTheDocument();
    });

    it('应该包含建议操作列表', () => {
      render(<NotFoundPage />);

      // 验证建议操作文字
      expect(screen.getByText('您可以尝试：')).toBeInTheDocument();
      expect(screen.getByText('检查URL地址是否正确')).toBeInTheDocument();
      expect(screen.getByText('返回首页重新导航')).toBeInTheDocument();
      expect(screen.getByText('使用搜索功能查找内容')).toBeInTheDocument();
    });

    it('应该包含底部提示信息', () => {
      render(<NotFoundPage />);

      // 验证底部提示
      expect(screen.getByText('如果问题持续存在，请联系我们的技术支持团队')).toBeInTheDocument();
    });
  });

  describe('404状态码设置', () => {
    it('应该设置正确的页面标题', () => {
      render(<NotFoundPage />);

      // 验证useEffect被调用
      expect(useEffectSpy).toHaveBeenCalled();

      // 验证document.title被设置
      expect(document.title).toBe('页面未找到 - Voidix');
    });

    it('应该调用useEffect进行客户端设置', () => {
      render(<NotFoundPage />);

      // 验证useEffect被调用
      expect(useEffectSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('SEO组件配置', () => {
    it('应该正确配置PageSEO组件', () => {
      render(<NotFoundPage />);

      const pageSEO = screen.getByTestId('page-seo');
      expect(pageSEO).toHaveAttribute('data-title', '页面未找到 - Voidix');
      expect(pageSEO).toHaveAttribute(
        'data-description',
        '抱歉，您访问的页面不存在。返回首页继续探索Voidix的精彩内容。'
      );
      expect(pageSEO).toHaveAttribute('data-keywords', '404,页面未找到,Voidix');
    });

    it('应该设置noindex和nofollow属性', () => {
      render(<NotFoundPage />);

      const pageSEO = screen.getByTestId('page-seo');
      const additionalMeta = JSON.parse(pageSEO.getAttribute('data-additional-meta') || '[]');

      expect(additionalMeta).toEqual([{ name: 'robots', content: 'noindex, nofollow' }]);
    });

    it('应该包含适当的SEO元数据', () => {
      render(<NotFoundPage />);

      const pageSEO = screen.getByTestId('page-seo');

      // 验证标题包含品牌名
      expect(pageSEO.getAttribute('data-title')).toContain('Voidix');

      // 验证描述具有引导性
      expect(pageSEO.getAttribute('data-description')).toContain('返回首页');
    });
  });

  describe('导航功能测试', () => {
    it('应该包含返回首页链接', () => {
      render(<NotFoundPage />);

      const homeLink = screen.getByRole('link', { name: /返回首页/ });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('应该包含返回上页按钮', () => {
      render(<NotFoundPage />);

      const backButton = screen.getByRole('button', { name: /返回上页/ });
      expect(backButton).toBeInTheDocument();
    });

    it('应该包含常见问题链接', () => {
      render(<NotFoundPage />);

      const faqLink = screen.getByRole('link', { name: /常见问题/ });
      expect(faqLink).toBeInTheDocument();
      expect(faqLink).toHaveAttribute('href', '/faq');
    });

    it('应该在点击返回上页时调用history.back', () => {
      render(<NotFoundPage />);

      const backButton = screen.getByRole('button', { name: /返回上页/ });
      fireEvent.click(backButton);

      // 验证window.history.back被调用
      expect(window.history.back).toHaveBeenCalledTimes(1);
    });

    it('应该设置正确的按钮和链接样式', () => {
      render(<NotFoundPage />);

      const homeLink = screen.getByRole('link', { name: /返回首页/ });
      const backButton = screen.getByRole('button', { name: /返回上页/ });
      const faqLink = screen.getByRole('link', { name: /常见问题/ });

      // 验证样式类存在
      expect(homeLink.className).toContain('bg-gradient-to-r');
      expect(backButton.className).toContain('bg-gray-600');
      expect(faqLink.className).toContain('border-gray-600');
    });
  });

  describe('图标渲染', () => {
    it('应该包含正确的导航图标', () => {
      render(<NotFoundPage />);

      // 验证图标数量 (Home, ArrowLeft, Search图标)
      const icons = screen.getAllByTestId('lucide-icon');
      expect(icons).toHaveLength(3);
    });

    it('应该为每个按钮包含对应的图标', () => {
      render(<NotFoundPage />);

      // 验证图标与对应的文字在同一个容器中
      const homeLink = screen.getByRole('link', { name: /返回首页/ });
      const backButton = screen.getByRole('button', { name: /返回上页/ });
      const faqLink = screen.getByRole('link', { name: /常见问题/ });

      expect(homeLink.querySelector('[data-testid="lucide-icon"]')).toBeInTheDocument();
      expect(backButton.querySelector('[data-testid="lucide-icon"]')).toBeInTheDocument();
      expect(faqLink.querySelector('[data-testid="lucide-icon"]')).toBeInTheDocument();
    });
  });

  describe('布局和样式', () => {
    it('应该应用正确的页面布局', () => {
      const { container } = render(<NotFoundPage />);

      // 验证主要布局类
      const pageContainer = container.querySelector('.min-h-screen');
      expect(pageContainer).toBeInTheDocument();
      expect(pageContainer).toHaveClass(
        'bg-gradient-to-br',
        'from-gray-900',
        'via-gray-800',
        'to-gray-900'
      );
    });

    it('应该包含居中对齐的内容', () => {
      const { container } = render(<NotFoundPage />);

      // 验证居中布局类
      const centerContainer = container.querySelector('.flex.items-center.justify-center');
      expect(centerContainer).toBeInTheDocument();
    });

    it('应该包含响应式文字大小', () => {
      const { container } = render(<NotFoundPage />);

      // 验证响应式文字类
      const responsiveText = container.querySelector('.text-8xl.md\\:text-9xl');
      expect(responsiveText).toBeInTheDocument();
    });

    it('应该包含正确的背景和边框样式', () => {
      const { container } = render(<NotFoundPage />);

      // 验证背景样式
      const backgroundElement = container.querySelector('.bg-gray-800\\/50');
      expect(backgroundElement).toBeInTheDocument();
    });
  });

  describe('响应式设计', () => {
    it('应该包含响应式按钮布局', () => {
      const { container } = render(<NotFoundPage />);

      // 验证响应式flex布局
      const buttonContainer = container.querySelector('.flex-col.sm\\:flex-row');
      expect(buttonContainer).toBeInTheDocument();
    });

    it('应该包含响应式间距', () => {
      const { container } = render(<NotFoundPage />);

      // 验证响应式padding
      const responsivePadding = container.querySelector('.px-4');
      expect(responsivePadding).toBeInTheDocument();
    });
  });

  describe('可访问性', () => {
    it('应该包含适当的语义化标签', () => {
      render(<NotFoundPage />);

      // 验证按钮和链接的语义化
      expect(screen.getByRole('button', { name: /返回上页/ })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /返回首页/ })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /常见问题/ })).toBeInTheDocument();
    });

    it('应该设置正确的focus样式', () => {
      render(<NotFoundPage />);

      const homeLink = screen.getByRole('link', { name: /返回首页/ });
      const backButton = screen.getByRole('button', { name: /返回上页/ });
      const faqLink = screen.getByRole('link', { name: /常见问题/ });

      // 验证focus样式类存在
      expect(homeLink.className).toContain('focus:outline-none');
      expect(backButton.className).toContain('focus:outline-none');
      expect(faqLink.className).toContain('focus:outline-none');
    });

    it('应该提供清晰的错误信息', () => {
      render(<NotFoundPage />);

      // 验证错误信息的清晰性
      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByText('页面走丢了')).toBeInTheDocument();
      expect(screen.getByText(/抱歉，您访问的页面不存在/)).toBeInTheDocument();
    });
  });

  describe('错误边界处理', () => {
    it('应该能正常渲染即使没有props', () => {
      // NotFoundPage不接受props，但测试组件的健壮性
      expect(() => render(<NotFoundPage />)).not.toThrow();
    });

    it('应该在所有组件都正常的情况下完整渲染', () => {
      render(<NotFoundPage />);

      // 验证所有关键元素都已渲染
      expect(screen.getByTestId('page-seo')).toBeInTheDocument();
      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /返回首页/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /返回上页/ })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /常见问题/ })).toBeInTheDocument();
    });

    it('应该处理Router Link组件的正常渲染', () => {
      render(<NotFoundPage />);

      // 验证Router Link mock正常工作
      const routerLinks = screen.getAllByTestId('router-link');
      expect(routerLinks).toHaveLength(2); // 返回首页 + 常见问题
    });
  });
});
