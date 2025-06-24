/**
 * FaqPage 组件测试套件
 * 测试FAQ页面的渲染、FAQ数据展示、事件追踪和SEO集成功能
 */

import { FaqPage } from '@/pages/FaqPage';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock 所有子组件
vi.mock('@/components', () => ({
  AnimatedSection: ({ children, className, variant, delay }: any) => (
    <div
      data-testid="animated-section"
      className={className}
      data-variant={variant}
      data-delay={delay}
    >
      {children}
    </div>
  ),
  BreadcrumbNavigation: ({ className }: any) => (
    <nav data-testid="breadcrumb-navigation" className={className}>
      Breadcrumb Navigation
    </nav>
  ),
  GradientText: ({ children, variant, className }: any) => (
    <span data-testid="gradient-text" className={className} data-variant={variant}>
      {children}
    </span>
  ),
}));

// Mock SEO组件
vi.mock('@/components/seo', () => ({
  SEO: ({ pageKey, type, canonicalUrl }: any) => (
    <div
      data-testid="page-seo"
      data-page-key={pageKey}
      data-type={type}
      data-canonical={canonicalUrl}
    >
      PageSEO
    </div>
  ),
  FAQSchema: ({ faqItems }: any) => (
    <script data-testid="faq-schema" data-faq-count={faqItems?.length} type="application/ld+json">
      FAQ Schema
    </script>
  ),
}));

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, initial, animate, transition, onClick, ...props }: any) => (
      <div
        className={className}
        onClick={onClick}
        data-testid={props['data-testid'] || 'motion-div'}
        {...props}
      >
        {children}
      </div>
    ),
  },
}));

describe('FaqPage', () => {
  // Mock Analytics全局对象
  const mockAnalytics = {
    trackCustomEvent: vi.fn(),
    trackFAQView: vi.fn(),
  };

  beforeEach(() => {
    // 清理所有mock
    vi.clearAllMocks();

    // 设置全局Analytics mock
    Object.defineProperty(window, 'voidixUnifiedAnalytics', {
      value: mockAnalytics,
      writable: true,
    });

    // Mock navigation API to prevent JSDOM navigation errors
    Object.defineProperty(window, 'location', {
      value: {
        href: 'https://www.voidix.net/faq',
        origin: 'https://www.voidix.net',
        assign: vi.fn(),
        replace: vi.fn(),
        reload: vi.fn(),
      },
      writable: true,
    });

    // Mock window.open to prevent navigation errors
    Object.defineProperty(window, 'open', {
      value: vi.fn(),
      writable: true,
    });

    // 重置mock函数
    mockAnalytics.trackCustomEvent.mockClear();
    mockAnalytics.trackFAQView.mockClear();
  });

  describe('基础渲染', () => {
    it('应该正确渲染页面', () => {
      render(<FaqPage />);

      // 验证页面能够成功渲染
      expect(screen.getByTestId('page-seo')).toBeInTheDocument();
      expect(screen.getByTestId('faq-schema')).toBeInTheDocument();
      expect(screen.getByTestId('breadcrumb-navigation')).toBeInTheDocument();
    });

    it('应该包含正确的页面标题', () => {
      render(<FaqPage />);

      // 验证标题文字
      expect(screen.getByText('常见问题')).toBeInTheDocument();
      expect(screen.getByText('快速解答关于Voidix服务器的常见疑问')).toBeInTheDocument();
    });

    it('应该包含联系方式说明', () => {
      render(<FaqPage />);

      // 验证联系说明文字
      expect(screen.getByText('还有其他问题？')).toBeInTheDocument();
      expect(screen.getByText(/如果您的问题没有在上面找到答案/)).toBeInTheDocument();
    });

    it('应该包含社交媒体链接', () => {
      render(<FaqPage />);

      // 验证社交媒体按钮
      expect(screen.getByText('加入QQ群')).toBeInTheDocument();
      expect(screen.getByText('加入Discord')).toBeInTheDocument();
    });
  });

  describe('SEO组件配置', () => {
    it('应该正确配置PageSEO组件', () => {
      render(<FaqPage />);

      const pageSEO = screen.getByTestId('page-seo');
      expect(pageSEO).toHaveAttribute('data-page-key', 'faq');
      expect(pageSEO).toHaveAttribute('data-type', 'article');
      expect(pageSEO).toHaveAttribute('data-canonical', 'https://www.voidix.net/faq');
    });

    it('应该设置正确的页面类型为article', () => {
      render(<FaqPage />);

      const pageSEO = screen.getByTestId('page-seo');
      expect(pageSEO).toHaveAttribute('data-type', 'article');
    });

    it('应该包含FAQSchema组件', () => {
      render(<FaqPage />);

      const faqSchema = screen.getByTestId('faq-schema');
      expect(faqSchema).toBeInTheDocument();
      expect(faqSchema).toHaveAttribute('data-faq-count', '5');
    });

    it('应该设置正确的canonical URL', () => {
      render(<FaqPage />);

      const pageSEO = screen.getByTestId('page-seo');
      expect(pageSEO).toHaveAttribute('data-canonical', 'https://www.voidix.net/faq');
    });
  });

  describe('FAQ数据渲染', () => {
    it('应该渲染所有FAQ项目', () => {
      render(<FaqPage />);

      // 验证5个FAQ问题都存在
      expect(screen.getByText('如何加入Voidix服务器？')).toBeInTheDocument();
      expect(screen.getByText('服务器是免费的吗？有付费项目吗？')).toBeInTheDocument();
      expect(screen.getByText('服务器支持哪些Minecraft版本？')).toBeInTheDocument();
      expect(screen.getByText('如果我遇到了Bug或者有建议，应该怎么办？')).toBeInTheDocument();
      expect(screen.getByText('我可以申请成为管理团队的一员吗？')).toBeInTheDocument();
    });

    it('应该显示正确的FAQ答案', () => {
      render(<FaqPage />);

      // 验证部分FAQ答案内容
      expect(screen.getByText(/是的，Voidix是一个纯公益服务器，完全免费/)).toBeInTheDocument();
      expect(screen.getByText(/我们的小游戏服务器支持1.7.2至最新的Java版/)).toBeInTheDocument();
      expect(screen.getByText(/我们欢迎热心玩家的加入/)).toBeInTheDocument();
    });

    it('应该包含FAQ内部链接', () => {
      render(<FaqPage />);

      // 验证FAQ内容中的链接
      const internalLinks = screen.getAllByRole('link');
      const faqInternalLinks = internalLinks.filter(
        link =>
          link.getAttribute('href') === '/#versions' || link.getAttribute('href') === '/bug-report'
      );
      expect(faqInternalLinks.length).toBeGreaterThan(0);
    });

    it('应该正确显示FAQ编号', () => {
      render(<FaqPage />);

      // 验证FAQ编号1-5都存在
      for (let i = 1; i <= 5; i++) {
        expect(screen.getByText(i.toString())).toBeInTheDocument();
      }
    });

    it('应该应用正确的FAQ项目样式', () => {
      const { container } = render(<FaqPage />);

      // 验证FAQ项目容器样式
      const faqItems = container.querySelectorAll('.border-gray-700\\/50');
      expect(faqItems.length).toBeGreaterThan(0);
    });
  });

  describe('FAQ交互功能', () => {
    it('应该在FAQ项目点击时追踪事件', () => {
      render(<FaqPage />);

      // 获取第一个FAQ项目并点击
      const faqItems = screen.getAllByTestId('motion-div');
      const firstFaqItem = faqItems.find(item =>
        item.textContent?.includes('如何加入Voidix服务器？')
      );

      if (firstFaqItem) {
        fireEvent.click(firstFaqItem);

        // 验证FAQ点击追踪被调用
        expect(mockAnalytics.trackFAQView).toHaveBeenCalledWith('1', 'general_faq');
      }
    });

    it('应该为每个FAQ项目正确追踪点击事件', () => {
      render(<FaqPage />);

      const faqQuestions = [
        '如何加入Voidix服务器？',
        '服务器是免费的吗？有付费项目吗？',
        '服务器支持哪些Minecraft版本？',
        '如果我遇到了Bug或者有建议，应该怎么办？',
        '我可以申请成为管理团队的一员吗？',
      ];

      const motionDivs = screen.getAllByTestId('motion-div');

      faqQuestions.forEach((question, index) => {
        const faqItem = motionDivs.find(div => div.textContent?.includes(question));
        if (faqItem) {
          fireEvent.click(faqItem);

          // 验证对应的追踪调用
          expect(mockAnalytics.trackFAQView).toHaveBeenCalledWith(
            (index + 1).toString(),
            'general_faq'
          );
        }
      });
    });

    it('应该在Analytics不可用时不报错', () => {
      // 移除Analytics对象
      Object.defineProperty(window, 'voidixUnifiedAnalytics', {
        value: undefined,
        writable: true,
      });

      // 应该不抛出错误
      expect(() => render(<FaqPage />)).not.toThrow();

      // 点击FAQ项目也不应该报错
      const faqItems = screen.getAllByTestId('motion-div');
      const firstFaqItem = faqItems.find(item =>
        item.textContent?.includes('如何加入Voidix服务器？')
      );

      if (firstFaqItem) {
        expect(() => fireEvent.click(firstFaqItem)).not.toThrow();
      }
    });
  });

  describe('社交链接测试', () => {
    it('应该包含正确的社交媒体链接', () => {
      render(<FaqPage />);

      const socialLinks = screen.getAllByRole('link');

      // 查找QQ群和Discord链接
      const qqLink = socialLinks.find(link => link.getAttribute('href')?.includes('qm.qq.com'));
      const discordLink = socialLinks.find(link =>
        link.getAttribute('href')?.includes('discord.gg')
      );

      expect(qqLink).toBeInTheDocument();
      expect(discordLink).toBeInTheDocument();
    });

    it('应该设置正确的外部链接属性', () => {
      render(<FaqPage />);

      const socialLinks = screen.getAllByRole('link');
      const externalLinks = socialLinks.filter(
        link =>
          link.getAttribute('href')?.includes('qm.qq.com') ||
          link.getAttribute('href')?.includes('discord.gg')
      );

      externalLinks.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    it('应该在社交链接点击时追踪事件', () => {
      render(<FaqPage />);

      const socialLinks = screen.getAllByRole('link');
      const qqLink = socialLinks.find(link => link.textContent === '加入QQ群');
      const discordLink = socialLinks.find(link => link.textContent === '加入Discord');

      if (qqLink) {
        fireEvent.click(qqLink);
        expect(mockAnalytics.trackCustomEvent).toHaveBeenCalledWith(
          'user_action',
          'social_link_click',
          'qq',
          1
        );
      }

      if (discordLink) {
        fireEvent.click(discordLink);
        expect(mockAnalytics.trackCustomEvent).toHaveBeenCalledWith(
          'user_action',
          'social_link_click',
          'discord',
          1
        );
      }
    });
  });

  describe('页面访问追踪', () => {
    it('应该在页面加载时追踪页面访问', () => {
      render(<FaqPage />);

      // 验证页面访问追踪被调用，传入FAQ数量
      expect(mockAnalytics.trackCustomEvent).toHaveBeenCalledWith(
        'page_view',
        'faq',
        'faq_page_visit',
        5 // FAQ数据长度
      );
    });

    it('应该只在组件挂载时追踪一次', () => {
      const { rerender } = render(<FaqPage />);

      // 重新渲染
      rerender(<FaqPage />);

      // 页面访问追踪应该只被调用一次
      expect(mockAnalytics.trackCustomEvent).toHaveBeenCalledTimes(1);
    });
  });

  describe('AnimatedSection配置', () => {
    it('应该包含正确配置的AnimatedSection组件', () => {
      render(<FaqPage />);

      const animatedSections = screen.getAllByTestId('animated-section');
      expect(animatedSections.length).toBeGreaterThan(0);
    });

    it('应该设置正确的动画变体', () => {
      render(<FaqPage />);

      const animatedSections = screen.getAllByTestId('animated-section');

      // 验证至少有一个AnimatedSection设置了fadeInUp变体
      const fadeInUpSections = animatedSections.filter(
        section => section.getAttribute('data-variant') === 'fadeInUp'
      );
      expect(fadeInUpSections.length).toBeGreaterThan(0);
    });

    it('应该设置正确的延迟配置', () => {
      render(<FaqPage />);

      const animatedSections = screen.getAllByTestId('animated-section');

      // 验证至少有一个AnimatedSection设置了延迟
      const delayedSections = animatedSections.filter(
        section => section.getAttribute('data-delay') !== null
      );
      expect(delayedSections.length).toBeGreaterThan(0);
    });
  });

  describe('布局和样式', () => {
    it('应该应用正确的页面布局', () => {
      const { container } = render(<FaqPage />);

      // 验证主要布局类
      const pageContainer = container.querySelector('.min-h-screen.bg-gray-900');
      expect(pageContainer).toBeInTheDocument();
    });

    it('应该包含响应式容器', () => {
      const { container } = render(<FaqPage />);

      // 验证响应式容器类
      const responsiveContainer = container.querySelector('.max-w-4xl.mx-auto');
      expect(responsiveContainer).toBeInTheDocument();
    });

    it('应该应用正确的FAQ项目样式', () => {
      const { container } = render(<FaqPage />);

      // 验证FAQ项目样式类
      const faqStyles = container.querySelectorAll('.border-gray-700\\/50, .bg-gray-800\\/30');
      expect(faqStyles.length).toBeGreaterThan(0);
    });

    it('应该包含正确的梯度背景', () => {
      const { container } = render(<FaqPage />);

      // 验证梯度背景类
      const gradientElements = container.querySelectorAll('.bg-gradient-to-r');
      expect(gradientElements.length).toBeGreaterThan(0);
    });
  });

  describe('可访问性', () => {
    it('应该包含适当的语义化标签', () => {
      render(<FaqPage />);

      // 验证标题层级
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('应该为外部链接提供正确的属性', () => {
      render(<FaqPage />);

      const externalLinks = screen
        .getAllByRole('link')
        .filter(link => link.getAttribute('target') === '_blank');

      externalLinks.forEach(link => {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    it('应该包含导航元素', () => {
      render(<FaqPage />);

      expect(screen.getByTestId('breadcrumb-navigation')).toBeInTheDocument();
    });
  });

  describe('错误边界处理', () => {
    it('应该能正常渲染即使没有props', () => {
      // FaqPage不接受props，但测试组件的健壮性
      expect(() => render(<FaqPage />)).not.toThrow();
    });

    it('应该在所有子组件都正常的情况下完整渲染', () => {
      render(<FaqPage />);

      // 验证所有关键元素都已渲染
      expect(screen.getByTestId('page-seo')).toBeInTheDocument();
      expect(screen.getByTestId('faq-schema')).toBeInTheDocument();
      expect(screen.getByTestId('breadcrumb-navigation')).toBeInTheDocument();
      expect(screen.getByText('常见问题')).toBeInTheDocument();
    });

    it('应该正确处理内部链接', () => {
      render(<FaqPage />);

      // 验证内部链接不会导致错误
      const internalLinks = screen
        .getAllByRole('link')
        .filter(link => link.getAttribute('href')?.startsWith('/'));

      expect(internalLinks.length).toBeGreaterThan(0);

      // 点击内部链接不应该报错
      internalLinks.forEach(link => {
        expect(() => fireEvent.click(link)).not.toThrow();
      });
    });
  });
});
