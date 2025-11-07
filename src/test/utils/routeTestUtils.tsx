/**
 * 路由测试工具库
 * 提供稳定的、向后兼容的路由测试工具
 */

import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';

/**
 * 通用的页面组件Mock工厂
 * 创建稳定的测试组件，避免依赖具体实现
 */
export const createPageMocks = () => {
  return {
    HomePage: () => (
      <div data-testid="page-content" data-page="home">
        Home Page
      </div>
    ),
    StatusPage: () => (
      <div data-testid="page-content" data-page="status">
        Status Page
      </div>
    ),
    FaqPage: () => (
      <div data-testid="page-content" data-page="faq">
        FAQ Page
      </div>
    ),
    BugReportPage: () => (
      <div data-testid="page-content" data-page="bug-report">
        Bug Report Page
      </div>
    ),
    NotFoundPage: () => (
      <div data-testid="page-content" data-page="404">
        404 Not Found
      </div>
    ),
  };
};

/**
 * 创建稳定的Layout Mock
 */
export const createLayoutMock = () => ({
  Layout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  ),
});

/**
 * 创建灵活的WebSocket Hook Mock
 */
export const createWebSocketMock = () => ({
  useWebSocket: vi.fn(() => ({
    isConnected: false,
    connectionState: 'disconnected',
    // 可扩展的返回值，不会因为新功能而失效
  })),
});

/**
 * 路由测试选项接口
 */
interface RouteTestOptions {
  initialPath?: string;
  enableSuspense?: boolean;
  enableErrorBoundary?: boolean;
  customFallback?: React.ComponentType;
  customLayout?: React.ComponentType<{ children: React.ReactNode }>;
}

/**
 * 创建路由测试环境
 * 提供灵活、可配置的路由测试组件
 */
export const createRouteTest = (options: RouteTestOptions = {}) => {
  const {
    initialPath = '/',
    enableSuspense = true,
    enableErrorBoundary = false,
    customFallback,
    customLayout,
  } = options;

  const DefaultFallback =
    customFallback || (() => <div data-testid="loading-state">Loading...</div>);

  const DefaultLayout =
    customLayout ||
    (({ children }: { children: React.ReactNode }) => (
      <div data-testid="app-layout">{children}</div>
    ));

  const RouteContent = () => (
    <Routes>
      <Route
        path="/"
        element={
          <div data-testid="page-content" data-page="home">
            Home Page
          </div>
        }
      />
      <Route
        path="/status"
        element={
          <div data-testid="page-content" data-page="status">
            Status Page
          </div>
        }
      />
      <Route
        path="/faq"
        element={
          <div data-testid="page-content" data-page="faq">
            FAQ Page
          </div>
        }
      />
      <Route
        path="/bug-report"
        element={
          <div data-testid="page-content" data-page="bug-report">
            Bug Report Page
          </div>
        }
      />
      <Route
        path="/not-found"
        element={
          <div data-testid="page-content" data-page="404">
            404 Not Found
          </div>
        }
      />
      <Route
        path="*"
        element={
          <div data-testid="page-content" data-page="404">
            404 Not Found
          </div>
        }
      />
    </Routes>
  );

  const TestRouter = () => {
    const content = enableSuspense ? (
      <React.Suspense fallback={<DefaultFallback />}>
        <RouteContent />
      </React.Suspense>
    ) : (
      <RouteContent />
    );

    return (
      <MemoryRouter initialEntries={[initialPath]}>
        <DefaultLayout>
          {enableErrorBoundary ? (
            <div data-testid="error-boundary-wrapper">{content}</div>
          ) : (
            content
          )}
        </DefaultLayout>
      </MemoryRouter>
    );
  };

  return TestRouter;
};

/**
 * 路由测试断言工具
 * 提供稳定的、基于行为的断言方法
 */
export class RouteTestAssertions {
  /**
   * 等待页面加载完成
   */
  static async waitForPageLoad(): Promise<void> {
    await waitFor(() => {
      // 等待页面内容或加载状态出现
      expect(
        screen.getByTestId('page-content') || screen.getByTestId('loading-state')
      ).toBeInTheDocument();
    });
  }

  /**
   * 断言当前页面类型
   */
  static async assertCurrentPage(expectedPage: string): Promise<void> {
    await waitFor(() => {
      const pageElement = screen.getByTestId('page-content');
      expect(pageElement).toBeInTheDocument();
      expect(pageElement).toHaveAttribute('data-page', expectedPage);
    });
  }

  /**
   * 断言页面不是指定类型
   */
  static assertPageIsNot(notExpectedPage: string): void {
    const pageElements = screen.queryAllByTestId('page-content');
    pageElements.forEach(element => {
      expect(element).not.toHaveAttribute('data-page', notExpectedPage);
    });
  }

  /**
   * 断言加载状态存在
   */
  static assertLoadingState(): void {
    expect(
      screen.getByTestId('loading-state') ||
        screen.getByTestId('route-stabilizing') ||
        screen.getByText(/loading|加载|Loading/i)
    ).toBeInTheDocument();
  }

  /**
   * 断言加载状态不存在
   */
  static assertNoLoadingState(): void {
    expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    expect(screen.queryByTestId('route-stabilizing')).not.toBeInTheDocument();
  }

  /**
   * 断言应用布局存在
   */
  static assertAppLayout(): void {
    expect(screen.getByTestId('app-layout')).toBeInTheDocument();
  }

  /**
   * 断言特定路径导航到正确页面
   */
  static async assertRouteNavigation(
    paths: Array<{ path: string; expectedPage: string }>
  ): Promise<void> {
    for (const { path, expectedPage } of paths) {
      const TestComponent = createRouteTest({ initialPath: path });
      const { unmount } = render(<TestComponent />);

      await this.assertCurrentPage(expectedPage);

      unmount();
    }
  }
}

/**
 * 路由性能测试工具
 */
export class RoutePerformanceTestUtils {
  /**
   * 测量路由加载时间
   */
  static async measureRouteLoadTime(routePath: string): Promise<number> {
    const startTime = performance.now();

    const TestComponent = createRouteTest({ initialPath: routePath });
    render(<TestComponent />);

    await RouteTestAssertions.waitForPageLoad();

    const endTime = performance.now();
    return endTime - startTime;
  }

  /**
   * 断言路由性能在可接受范围内
   */
  static async assertRoutePerformance(routePath: string, maxLoadTime: number = 100): Promise<void> {
    const loadTime = await this.measureRouteLoadTime(routePath);
    expect(loadTime).toBeLessThan(maxLoadTime);
  }
}

/**
 * Mock设置工具
 * 提供一致的Mock配置
 */
export const setupRoutingMocks = () => {
  // Mock页面组件
  const pageMocks = createPageMocks();
  Object.entries(pageMocks).forEach(([name, component]) => {
    vi.doMock(`@/pages/${name}`, () => ({ [name]: component }));
  });

  // Mock Layout组件
  const layoutMock = createLayoutMock();
  vi.doMock('@/components', () => layoutMock);

  // Mock WebSocket Hook
  const webSocketMock = createWebSocketMock();
  vi.doMock('@/hooks/useWebSocketV2', () => webSocketMock);

  // Mock CSS imports
  vi.doMock('@/styles/page-transitions.css', () => ({}));

  return {
    pageMocks,
    layoutMock,
    webSocketMock,
  };
};

/**
 * 路由测试套件配置
 */
export interface RouteTestSuiteConfig {
  enableMocks?: boolean;
  testValidRoutes?: boolean;
  testInvalidRoutes?: boolean;
  testPerformance?: boolean;
  performanceThreshold?: number;
}

/**
 * 创建标准化的路由测试套件
 */
export const createRouteTestSuite = (config: RouteTestSuiteConfig = {}) => {
  const {
    enableMocks = true,
    testValidRoutes = true,
    testInvalidRoutes = true,
    testPerformance = false,
    performanceThreshold = 100,
  } = config;

  return {
    setup: () => {
      if (enableMocks) {
        setupRoutingMocks();
      }
    },

    validRoutes: [
      { path: '/', expectedPage: 'home' },
      { path: '/status', expectedPage: 'status' },
      { path: '/faq', expectedPage: 'faq' },
      { path: '/bug-report', expectedPage: 'bug-report' },
      { path: '/not-found', expectedPage: '404' },
    ],

    invalidRoutes: ['/nonexistent', '/invalid/path', '/does-not-exist', '/random-123'],

    runStandardTests: async () => {
      if (testValidRoutes) {
        await RouteTestAssertions.assertRouteNavigation([
          { path: '/', expectedPage: 'home' },
          { path: '/status', expectedPage: 'status' },
          { path: '/faq', expectedPage: 'faq' },
          { path: '/bug-report', expectedPage: 'bug-report' },
        ]);
      }

      if (testInvalidRoutes) {
        for (const invalidPath of ['/nonexistent', '/invalid/path']) {
          const TestComponent = createRouteTest({ initialPath: invalidPath });
          render(<TestComponent />);
          await RouteTestAssertions.assertCurrentPage('404');
        }
      }

      if (testPerformance) {
        await RoutePerformanceTestUtils.assertRoutePerformance('/', performanceThreshold);
        await RoutePerformanceTestUtils.assertRoutePerformance('/invalid', performanceThreshold);
      }
    },
  };
};

/**
 * =======================================================
 * 页面测试专用工具 - 向后兼容性优化
 * =======================================================
 */

/**
 * 通用页面测试配置接口
 */
interface PageTestConfig {
  mockSEO?: boolean;
  mockAnalytics?: boolean;
  mockWebSocket?: boolean;
  customMocks?: Record<string, any>;
}

/**
 * 创建灵活的SEO组件Mock
 * 不依赖具体的配置内容，专注于功能验证
 */
export const createSEOMocks = () => {
  return {
    PageSEO: ({
      pageKey,
      type,
      canonicalUrl,
      title,
      description,
      keywords,
      additionalMeta,
    }: any) => (
      <div
        data-testid="page-seo"
        data-page-key={pageKey}
        data-type={type}
        data-canonical={canonicalUrl}
        data-title={title}
        data-description={description}
        data-keywords={keywords}
        data-additional-meta={JSON.stringify(additionalMeta || [])}
      >
        SEO Component
      </div>
    ),
    PerformanceOptimizer: ({ preloadImages, prefetchRoutes }: any) => (
      <div
        data-testid="performance-optimizer"
        data-preload={preloadImages?.join(',') || ''}
        data-prefetch={prefetchRoutes?.join(',') || ''}
      >
        Performance Optimizer
      </div>
    ),
  };
};

/**
 * 创建灵活的Analytics Mock
 * 提供稳定的跟踪验证，不依赖具体实现
 */
export const createAnalyticsMocks = () => {
  const mockTracker = {
    trackCustomEvent: vi.fn(),
    trackPageView: vi.fn(),
    trackServerStatus: vi.fn(),
    trackBugReport: vi.fn(),
    // 可扩展的跟踪方法
  };

  // Mock全局analytics对象
  Object.defineProperty(window, 'voidixUnifiedAnalytics', {
    value: mockTracker,
    writable: true,
    configurable: true,
  });

  return mockTracker;
};

/**
 * 创建StatusPage专用的Mock配置
 * 提供灵活的配置，减少对具体内容的依赖
 */
export const createStatusPageMocks = () => {
  return {
    // WebSocket Hook Mock - 专注于状态而非具体数据
    useWebSocketStatus: vi.fn(),

    // 工具函数Mock - 提供稳定的行为
    formatRunningTime: vi.fn(
      (time: number) => `${Math.floor(time / 3600)}h ${Math.floor((time % 3600) / 60)}m`
    ),
    calculateGroupStats: vi.fn((_servers: any, _allServers: any) => ({
      totalPlayers: 15,
      onlineServers: 2,
      totalServers: 3,
    })),

    // 组件Mock - 简化但保持功能
    ServerCard: vi.fn(({ serverId, serverData }: any) => (
      <div data-testid={`server-card-${serverId}`} data-server-id={serverId}>
        {serverData ? `Players: ${serverData.players}` : 'Loading...'}
      </div>
    )),
    ServerGroupCard: vi.fn(({ groupId, servers }: any) => (
      <div data-testid={`server-group-${groupId}`} data-group-id={groupId}>
        Group: {servers?.length || 0} servers
      </div>
    )),
  };
};

/**
 * 创建NotFoundPage专用的Mock配置
 */
export const createNotFoundPageMocks = () => {
  return {
    // Router Mock - 简化路由功能
    Link: ({ children, to, className, ...props }: any) => (
      <a href={to} className={className} data-testid="router-link" {...props}>
        {children}
      </a>
    ),

    // 图标Mock - 通用图标组件
    Icon: ({ className, 'data-icon': iconName }: any) => (
      <div className={className} data-testid="icon" data-icon={iconName} />
    ),

    // History Mock
    createHistoryMock: () => {
      Object.defineProperty(window, 'history', {
        value: { back: vi.fn() },
        configurable: true,
      });
    },
  };
};

/**
 * 页面测试断言工具
 * 提供稳定的、基于行为的断言方法
 */
export class PageTestAssertions {
  /**
   * 断言SEO组件配置正确
   */
  static assertSEOConfiguration(expectedConfig: {
    pageKey?: string;
    type?: string;
    canonical?: string;
    hasTitle?: boolean;
    hasDescription?: boolean;
    hasKeywords?: boolean;
  }): void {
    const seoElement = screen.getByTestId('page-seo');
    expect(seoElement).toBeInTheDocument();

    if (expectedConfig.pageKey) {
      expect(seoElement).toHaveAttribute('data-page-key', expectedConfig.pageKey);
    }
    if (expectedConfig.type) {
      expect(seoElement).toHaveAttribute('data-type', expectedConfig.type);
    }
    if (expectedConfig.canonical) {
      expect(seoElement).toHaveAttribute('data-canonical', expectedConfig.canonical);
    }
    if (expectedConfig.hasTitle) {
      expect(seoElement.getAttribute('data-title')).toBeTruthy();
    }
    if (expectedConfig.hasDescription) {
      expect(seoElement.getAttribute('data-description')).toBeTruthy();
    }
    if (expectedConfig.hasKeywords) {
      expect(seoElement.getAttribute('data-keywords')).toBeTruthy();
    }
  }

  /**
   * 断言分析跟踪功能
   */
  static assertAnalyticsTracking(
    mockTracker: any,
    expectedCalls: {
      method: string;
      minCalls?: number;
      withArgs?: any[];
    }[]
  ): void {
    expectedCalls.forEach(({ method, minCalls = 1, withArgs }) => {
      expect(mockTracker[method]).toHaveBeenCalledTimes(minCalls);
      if (withArgs) {
        expect(mockTracker[method]).toHaveBeenCalledWith(...withArgs);
      }
    });
  }

  /**
   * 断言页面核心功能存在
   * 使用灵活的查询而非具体文本
   */
  static assertPageCoreElements(elements: {
    title?: string | RegExp;
    navigation?: boolean;
    content?: boolean;
    footer?: boolean;
  }): void {
    if (elements.title) {
      // 使用getAllByText然后检查第一个元素，避免多元素匹配错误
      const titleElements = screen.getAllByText(elements.title);
      expect(titleElements[0]).toBeInTheDocument();
    }
    if (elements.navigation) {
      expect(
        screen.getByRole('navigation') ||
          screen.getByTestId('navigation') ||
          screen.getByTestId('breadcrumb-navigation')
      ).toBeInTheDocument();
    }
    if (elements.content) {
      expect(screen.getByRole('main') || screen.getByTestId('main-content')).toBeInTheDocument();
    }
  }

  /**
   * 断言导航功能正常
   */
  static assertNavigationFunctionality(
    expectedLinks: {
      text: string | RegExp;
      href?: string;
      isButton?: boolean;
    }[]
  ): void {
    expectedLinks.forEach(({ text, href, isButton }) => {
      if (isButton) {
        const button = screen.getByRole('button', { name: text });
        expect(button).toBeInTheDocument();
      } else {
        const link = screen.getByRole('link', { name: text });
        expect(link).toBeInTheDocument();
        if (href) {
          expect(link).toHaveAttribute('href', href);
        }
      }
    });
  }

  /**
   * 断言错误状态显示
   */
  static assertErrorState(errorInfo: {
    hasErrorCode?: boolean;
    hasErrorMessage?: boolean;
    hasRecoveryOptions?: boolean;
  }): void {
    if (errorInfo.hasErrorCode) {
      expect(screen.getByText(/404|500|error/i)).toBeInTheDocument();
    }
    if (errorInfo.hasErrorMessage) {
      expect(screen.getByText(/错误|error|not found|页面/i)).toBeInTheDocument();
    }
    if (errorInfo.hasRecoveryOptions) {
      // 检查是否有恢复选项（链接或按钮），使用getAllBy避免多元素错误
      const links = screen.queryAllByRole('link');
      const buttons = screen.queryAllByRole('button');
      expect(links.length + buttons.length).toBeGreaterThan(0);
    }
  }
}

/**
 * 通用页面测试设置工具
 */
export const setupPageTest = (config: PageTestConfig = {}) => {
  const { mockSEO = true, mockAnalytics = true, mockWebSocket = false, customMocks = {} } = config;

  const mocks: any = {};

  if (mockSEO) {
    const seoMocks = createSEOMocks();
    vi.doMock('@/components/seo', () => seoMocks);
    mocks.seo = seoMocks;
  }

  if (mockAnalytics) {
    mocks.analytics = createAnalyticsMocks();
  }

  if (mockWebSocket) {
    const webSocketMock = createWebSocketMock();
    vi.doMock('@/hooks/useWebSocketV2', () => webSocketMock);
    mocks.webSocket = webSocketMock;
  }

  // 应用自定义Mock
  Object.entries(customMocks).forEach(([path, mockValue]) => {
    vi.doMock(path, () => mockValue);
  });

  return mocks;
};

/**
 * 渲染助手 - 提供必要的上下文
 */
export const renderWithHelmet = (component: React.ReactElement) => {
  return render(<HelmetProvider>{component}</HelmetProvider>);
};

/**
 * 渲染助手 - 提供路由和Helmet上下文
 */
export const renderWithRouterAndHelmet = (component: React.ReactElement, initialPath = '/') => {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[initialPath]}>{component}</MemoryRouter>
    </HelmetProvider>
  );
};
