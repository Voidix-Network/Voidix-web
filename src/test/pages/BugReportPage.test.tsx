/**
 * BugReportPage 组件测试套件
 * 测试Bug反馈页面的渲染、事件追踪、SEO集成和用户交互功能
 */

import { BugReportPage } from '@/pages/BugReportPage';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock 所有子组件
vi.mock('@/components', () => ({
  AnimatedSection: ({ children, className }: any) => (
    <div data-testid="animated-section" className={className}>
      {children}
    </div>
  ),
  GradientText: ({ children, variant }: any) => (
    <span data-testid="gradient-text" data-variant={variant}>
      {children}
    </span>
  ),
  BreadcrumbNavigation: ({ className }: any) => (
    <nav data-testid="breadcrumb-navigation" className={className}>
      Breadcrumb Navigation
    </nav>
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
}));

// Mock SEO配置
vi.mock('@/components/seo/feedbackChannels', () => ({
  FEEDBACK_CHANNELS_CONFIG: [
    {
      iconName: 'MessageSquare',
      name: 'QQ群',
      description: '186438621 (推荐，可截图和实时交流)',
      link: 'https://qm.qq.com/test-qq-link',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      iconName: 'Globe',
      name: 'Discord服务器',
      description: '加入我们的 Discord',
      link: 'https://discord.gg/test-discord',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      iconName: 'Mail',
      name: '邮件支持',
      description: 'support@voidix.net',
      link: 'mailto:support@voidix.net',
      color: 'from-green-500 to-emerald-500',
    },
    {
      iconName: 'Github',
      name: 'GitHub Issues',
      description: '本网站 GitHub Issues 页面',
      link: 'https://github.com/test/issues',
      color: 'from-gray-500 to-slate-500',
    },
  ],
}));

vi.mock('@/components/seo/feedbackRequirements', () => ({
  FEEDBACK_REQUIREMENTS_CONFIG: [
    {
      iconName: 'Bug',
      title: '您当时所在的服务器',
      description: '例如：小游戏服、生存服',
    },
    {
      iconName: 'Clock',
      title: 'Bug发生的具体时间和日期',
      description: '大致即可',
    },
    {
      iconName: 'CheckCircle',
      title: 'Bug的详细描述',
      description: '您做了什么操作？预期结果是什么？实际发生了什么？',
    },
    {
      iconName: 'CheckCircle',
      title: '复现步骤',
      description: '如果可能，请提供如何让Bug再次出现的步骤',
    },
    {
      iconName: 'Camera',
      title: '截图或录屏',
      description: '这对于我们理解问题非常有帮助',
    },
    {
      iconName: 'User',
      title: '您的游戏内ID',
      description: '帮助我们定位相关的游戏记录',
    },
  ],
}));

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
      initial,
      animate,
      transition,
      whileHover,
      whileTap,
      onClick,
      href,
      target,
      rel,
      ...props
    }: any) => (
      <div
        className={className}
        onClick={onClick}
        data-href={href}
        data-target={target}
        data-rel={rel}
        data-testid={props['data-testid'] || 'motion-div'}
        {...props}
      >
        {children}
      </div>
    ),
    h1: ({ children, className }: any) => (
      <h1 className={className} data-testid="motion-h1">
        {children}
      </h1>
    ),
    a: ({ children, className, href, target, rel, onClick }: any) => (
      <a
        className={className}
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}
        data-testid="motion-link"
      >
        {children}
      </a>
    ),
  },
}));

// Mock Lucide React图标
vi.mock('lucide-react', () => {
  const MockIcon = ({ className }: any) => <div className={className} data-testid="lucide-icon" />;
  return {
    MessageSquare: MockIcon,
    Globe: MockIcon,
    Mail: MockIcon,
    Github: MockIcon,
    ExternalLink: MockIcon,
    Bug: MockIcon,
    Clock: MockIcon,
    Camera: MockIcon,
    User: MockIcon,
    CheckCircle: MockIcon,
  };
});

describe('BugReportPage', () => {
  // Mock Analytics全局对象
  const mockAnalytics = {
    trackCustomEvent: vi.fn(),
    trackBugReport: vi.fn(),
  };

  beforeEach(() => {
    // 清理所有mock
    vi.clearAllMocks();

    // 设置全局Analytics mock
    Object.defineProperty(window, 'voidixUnifiedAnalytics', {
      value: mockAnalytics,
      writable: true,
    });

    // 重置mock函数
    mockAnalytics.trackCustomEvent.mockClear();
    mockAnalytics.trackBugReport.mockClear();
  });

  describe('基础渲染', () => {
    it('应该正确渲染页面', () => {
      render(<BugReportPage />);

      // 验证页面能够成功渲染
      expect(screen.getByTestId('page-seo')).toBeInTheDocument();
      expect(screen.getByTestId('breadcrumb-navigation')).toBeInTheDocument();
      expect(screen.getByTestId('animated-section')).toBeInTheDocument();
    });

    it('应该包含正确的页面标题', () => {
      render(<BugReportPage />);

      // 验证标题文字
      expect(screen.getByTestId('gradient-text')).toBeInTheDocument();
      expect(screen.getByTestId('gradient-text')).toHaveTextContent('Bug 反馈');
      expect(screen.getByTestId('gradient-text')).toHaveAttribute('data-variant', 'primary');
    });

    it('应该包含页面介绍文字', () => {
      render(<BugReportPage />);

      // 验证介绍文字存在
      expect(screen.getByText(/我们非常重视您在游戏过程中遇到的任何问题/)).toBeInTheDocument();
    });

    it('应该包含感谢语', () => {
      render(<BugReportPage />);

      // 验证感谢语存在
      expect(screen.getByText(/感谢您的帮助，让我们一起把Voidix建设得更好/)).toBeInTheDocument();
    });
  });

  describe('SEO组件配置', () => {
    it('应该正确配置PageSEO组件', () => {
      render(<BugReportPage />);

      const pageSEO = screen.getByTestId('page-seo');
      expect(pageSEO).toHaveAttribute('data-page-key', 'bugReport');
      expect(pageSEO).toHaveAttribute('data-type', 'website');
      expect(pageSEO).toHaveAttribute('data-canonical', 'https://www.voidix.net/bug-report');
    });

    it('应该设置正确的页面类型', () => {
      render(<BugReportPage />);

      const pageSEO = screen.getByTestId('page-seo');
      expect(pageSEO).toHaveAttribute('data-type', 'website');
    });

    it('应该设置正确的canonical URL', () => {
      render(<BugReportPage />);

      const pageSEO = screen.getByTestId('page-seo');
      expect(pageSEO).toHaveAttribute('data-canonical', 'https://www.voidix.net/bug-report');
    });
  });

  describe('反馈渠道渲染', () => {
    it('应该渲染所有反馈渠道', () => {
      render(<BugReportPage />);

      // 验证渠道标题
      expect(screen.getByText('反馈渠道')).toBeInTheDocument();

      // 验证4个反馈渠道都存在
      expect(screen.getByText('QQ群')).toBeInTheDocument();
      expect(screen.getByText('Discord服务器')).toBeInTheDocument();
      expect(screen.getByText('邮件支持')).toBeInTheDocument();
      expect(screen.getByText('GitHub Issues')).toBeInTheDocument();
    });

    it('应该显示正确的渠道描述', () => {
      render(<BugReportPage />);

      // 验证每个渠道的描述
      expect(screen.getByText('186438621 (推荐，可截图和实时交流)')).toBeInTheDocument();
      expect(screen.getByText('加入我们的 Discord')).toBeInTheDocument();
      expect(screen.getByText('support@voidix.net')).toBeInTheDocument();
      expect(screen.getByText('本网站 GitHub Issues 页面')).toBeInTheDocument();
    });

    it('应该设置正确的外部链接属性', () => {
      render(<BugReportPage />);

      // 获取所有motion链接
      const links = screen.getAllByTestId('motion-link');

      // 验证链接数量
      expect(links).toHaveLength(4);

      // 验证外部链接属性
      links.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    it('应该包含正确的链接地址', () => {
      render(<BugReportPage />);

      const links = screen.getAllByTestId('motion-link');

      // 验证各个链接地址
      expect(links[0]).toHaveAttribute('href', 'https://qm.qq.com/test-qq-link');
      expect(links[1]).toHaveAttribute('href', 'https://discord.gg/test-discord');
      expect(links[2]).toHaveAttribute('href', 'mailto:support@voidix.net');
      expect(links[3]).toHaveAttribute('href', 'https://github.com/test/issues');
    });
  });

  describe('反馈要求渲染', () => {
    it('应该渲染所有反馈要求', () => {
      render(<BugReportPage />);

      // 验证要求标题
      expect(screen.getByText('反馈时请尽量包含以下信息')).toBeInTheDocument();

      // 验证6个反馈要求都存在
      expect(screen.getByText('您当时所在的服务器')).toBeInTheDocument();
      expect(screen.getByText('Bug发生的具体时间和日期')).toBeInTheDocument();
      expect(screen.getByText('Bug的详细描述')).toBeInTheDocument();
      expect(screen.getByText('复现步骤')).toBeInTheDocument();
      expect(screen.getByText('截图或录屏')).toBeInTheDocument();
      expect(screen.getByText('您的游戏内ID')).toBeInTheDocument();
    });

    it('应该显示正确的要求描述', () => {
      render(<BugReportPage />);

      // 验证每个要求的描述
      expect(screen.getByText('例如：小游戏服、生存服')).toBeInTheDocument();
      expect(screen.getByText('大致即可')).toBeInTheDocument();
      expect(
        screen.getByText('您做了什么操作？预期结果是什么？实际发生了什么？')
      ).toBeInTheDocument();
      expect(screen.getByText('如果可能，请提供如何让Bug再次出现的步骤')).toBeInTheDocument();
      expect(screen.getByText('这对于我们理解问题非常有帮助')).toBeInTheDocument();
      expect(screen.getByText('帮助我们定位相关的游戏记录')).toBeInTheDocument();
    });

    it('应该包含正确数量的图标', () => {
      render(<BugReportPage />);

      // 验证图标数量 (反馈渠道4个 + 反馈要求6个 + 其他UI图标)
      const icons = screen.getAllByTestId('lucide-icon');
      expect(icons.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('事件追踪功能', () => {
    it('应该在页面加载时追踪页面访问', () => {
      render(<BugReportPage />);

      // 验证页面访问追踪被调用
      expect(mockAnalytics.trackCustomEvent).toHaveBeenCalledWith(
        'page_view',
        'bug_report',
        'bug_report_page_visit',
        1
      );
    });

    it('应该在渠道点击时追踪事件', () => {
      render(<BugReportPage />);

      // 获取第一个反馈渠道链接并点击
      const firstChannelLink = screen.getAllByTestId('motion-link')[0];
      fireEvent.click(firstChannelLink);

      // 验证渠道点击追踪被调用
      expect(mockAnalytics.trackBugReport).toHaveBeenCalledWith('QQ群', 'channel_click');
      expect(mockAnalytics.trackCustomEvent).toHaveBeenCalledWith(
        'user_action',
        'external_link_click',
        'QQ群',
        1
      );
    });

    it('应该为每个渠道正确追踪点击事件', () => {
      render(<BugReportPage />);

      const channelLinks = screen.getAllByTestId('motion-link');
      const channelNames = ['QQ群', 'Discord服务器', '邮件支持', 'GitHub Issues'];

      // 点击每个渠道链接
      channelLinks.forEach((link, index) => {
        fireEvent.click(link);

        // 验证对应的追踪调用
        expect(mockAnalytics.trackBugReport).toHaveBeenCalledWith(
          channelNames[index],
          'channel_click'
        );
        expect(mockAnalytics.trackCustomEvent).toHaveBeenCalledWith(
          'user_action',
          'external_link_click',
          channelNames[index],
          1
        );
      });
    });

    it('应该在Analytics不可用时不报错', () => {
      // 移除Analytics对象
      Object.defineProperty(window, 'voidixUnifiedAnalytics', {
        value: undefined,
        writable: true,
      });

      // 应该不抛出错误
      expect(() => render(<BugReportPage />)).not.toThrow();

      // 点击链接也不应该报错
      const link = screen.getAllByTestId('motion-link')[0];
      expect(() => fireEvent.click(link)).not.toThrow();
    });
  });

  describe('动画组件测试', () => {
    it('应该包含动画容器', () => {
      render(<BugReportPage />);

      // 验证AnimatedSection存在
      expect(screen.getByTestId('animated-section')).toBeInTheDocument();
    });

    it('应该包含动画标题', () => {
      render(<BugReportPage />);

      // 验证motion标题存在
      expect(screen.getByTestId('motion-h1')).toBeInTheDocument();
    });

    it('应该包含动画容器', () => {
      render(<BugReportPage />);

      // 验证motion容器存在
      const motionDivs = screen.getAllByTestId('motion-div');
      expect(motionDivs.length).toBeGreaterThan(0);
    });
  });

  describe('布局和样式', () => {
    it('应该应用正确的容器样式', () => {
      render(<BugReportPage />);

      // 验证主要布局类存在
      expect(screen.getByTestId('animated-section')).toHaveClass('pt-12', 'pb-16', 'px-4');
    });

    it('应该包含响应式类', () => {
      const { container } = render(<BugReportPage />);

      // 验证响应式类存在
      const responsiveElements = container.querySelectorAll(
        '.sm\\:px-6, .lg\\:px-8, .md\\:grid-cols-2'
      );
      expect(responsiveElements.length).toBeGreaterThan(0);
    });

    it('应该包含正确的背景样式', () => {
      const { container } = render(<BugReportPage />);

      // 验证背景样式
      const backgroundElements = container.querySelectorAll('.bg-gray-900, .bg-gray-800\\/50');
      expect(backgroundElements.length).toBeGreaterThan(0);
    });
  });

  describe('可访问性', () => {
    it('应该包含适当的语义化标签', () => {
      render(<BugReportPage />);

      // 验证语义化标签
      expect(screen.getByTestId('breadcrumb-navigation')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('应该为外部链接提供正确的属性', () => {
      render(<BugReportPage />);

      const externalLinks = screen.getAllByTestId('motion-link');
      externalLinks.forEach(link => {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        expect(link).toHaveAttribute('target', '_blank');
      });
    });
  });

  describe('错误边界处理', () => {
    it('应该能正常渲染即使没有props', () => {
      // BugReportPage不接受props，但测试组件的健壮性
      expect(() => render(<BugReportPage />)).not.toThrow();
    });

    it('应该在所有子组件都正常的情况下完整渲染', () => {
      render(<BugReportPage />);

      // 验证所有关键元素都已渲染
      expect(screen.getByTestId('page-seo')).toBeInTheDocument();
      expect(screen.getByTestId('animated-section')).toBeInTheDocument();
      expect(screen.getByTestId('breadcrumb-navigation')).toBeInTheDocument();
      expect(screen.getByTestId('gradient-text')).toBeInTheDocument();
    });
  });
});
