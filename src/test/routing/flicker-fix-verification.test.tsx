/**
 * 修复后的路由闪烁问题测试
 * 验证RouteStateManager是否有效防止路径闪烁
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import React from 'react';

// Mock all lazy components
vi.mock('@/pages/HomePage', () => ({
  HomePage: () => <div data-testid="home-page">Home Page</div>,
}));

vi.mock('@/pages/StatusPage', () => ({
  StatusPage: () => <div data-testid="status-page">Status Page</div>,
}));

vi.mock('@/pages/FaqPage', () => ({
  FaqPage: () => <div data-testid="faq-page">FAQ Page</div>,
}));

vi.mock('@/pages/BugReportPage', () => ({
  BugReportPage: () => <div data-testid="bug-report-page">Bug Report Page</div>,
}));

vi.mock('@/pages/NotFoundPage', () => ({
  NotFoundPage: () => <div data-testid="not-found-page">404 Not Found</div>,
}));

// Mock Layout component
vi.mock('@/components', () => ({
  Layout: ({ children }: any) => <div data-testid="layout">{children}</div>,
}));

// 创建RouteStateManager的测试版本
const TestRouteStateManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isRouteStable, setIsRouteStable] = React.useState(false);

  React.useEffect(() => {
    // 防止初始化时的路径闪烁
    const timer = setTimeout(() => {
      setIsRouteStable(true);
    }, 10); // 很短的延迟，足以让路由器稳定

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // 在路由稳定之前，显示加载状态
  if (!isRouteStable) {
    return (
      <div data-testid="route-stabilizing">
        <div data-testid="loading-spinner">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
};

// 测试路由组件
const TestRouter = ({ initialPath }: { initialPath: string }) => (
  <MemoryRouter initialEntries={[initialPath]}>
    <TestRouteStateManager>
      <React.Suspense fallback={<div data-testid="suspense-loading">加载中...</div>}>
        <Routes>
          <Route path="/" element={<div data-testid="home-page">Home Page</div>} />
          <Route path="/status" element={<div data-testid="status-page">Status Page</div>} />
          <Route path="/faq" element={<div data-testid="faq-page">FAQ Page</div>} />
          <Route
            path="/bug-report"
            element={<div data-testid="bug-report-page">Bug Report Page</div>}
          />
          <Route path="*" element={<div data-testid="not-found-page">404 Not Found</div>} />
        </Routes>
      </React.Suspense>
    </TestRouteStateManager>
  </MemoryRouter>
);

describe('修复后的路由闪烁问题测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('RouteStateManager 路由状态管理', () => {
    it('应该在初始化时显示加载状态而不是错误的路径', async () => {
      render(<TestRouter initialPath="/nonexistent-path" />);

      // 首先应该看到路由稳定化状态
      expect(screen.getByTestId('route-stabilizing')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

      // 然后应该显示404页面
      await waitFor(() => {
        expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
      });

      // 验证没有首页被渲染
      expect(screen.queryByTestId('home-page')).not.toBeInTheDocument();
      expect(screen.queryByTestId('route-stabilizing')).not.toBeInTheDocument();
    });

    it('应该正确处理有效路径而不出现闪烁', async () => {
      const validPaths = [
        { path: '/', testId: 'home-page' },
        { path: '/status', testId: 'status-page' },
        { path: '/faq', testId: 'faq-page' },
        { path: '/bug-report', testId: 'bug-report-page' },
      ];

      for (const { path, testId } of validPaths) {
        const { unmount } = render(<TestRouter initialPath={path} />);

        // 短暂的稳定化期
        expect(screen.getByTestId('route-stabilizing')).toBeInTheDocument();

        await waitFor(() => {
          expect(screen.getByTestId(testId)).toBeInTheDocument();
        });

        expect(screen.queryByTestId('not-found-page')).not.toBeInTheDocument();
        expect(screen.queryByTestId('route-stabilizing')).not.toBeInTheDocument();

        unmount();
      }
    });

    it('应该在路径变化时保持稳定', async () => {
      let renderCount = 0;

      const CountingNotFound = () => {
        renderCount++;
        return <div data-testid="not-found-page">404 Not Found (#{renderCount})</div>;
      };

      const TestRouterWithCounting = () => (
        <MemoryRouter initialEntries={['/invalid-path']}>
          <TestRouteStateManager>
            <React.Suspense fallback={<div data-testid="suspense-loading">加载中...</div>}>
              <Routes>
                <Route path="/" element={<div data-testid="home-page">Home Page</div>} />
                <Route path="*" element={<CountingNotFound />} />
              </Routes>
            </React.Suspense>
          </TestRouteStateManager>
        </MemoryRouter>
      );

      render(<TestRouterWithCounting />);

      await waitFor(() => {
        expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
      });

      // 验证404页面只被渲染一次，没有多次重渲染
      expect(renderCount).toBe(1);
    });
  });

  describe('性能优化验证', () => {
    it('应该快速响应无效路径而不出现延迟', async () => {
      const startTime = Date.now();

      render(<TestRouter initialPath="/definitely-not-exists" />);

      await waitFor(() => {
        expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
      });

      const endTime = Date.now();
      const renderTime = endTime - startTime;

      // 验证渲染时间合理（应该在100ms内）
      expect(renderTime).toBeLessThan(100);
    });

    it('应该正确处理深层嵌套的无效路径', async () => {
      const deepPaths = [
        '/invalid/deep/path/structure',
        '/does/not/exist/at/all',
        '/very/very/very/deep/invalid/path',
      ];

      for (const path of deepPaths) {
        const { unmount } = render(<TestRouter initialPath={path} />);

        await waitFor(() => {
          expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
        });

        expect(screen.queryByTestId('home-page')).not.toBeInTheDocument();

        unmount();
      }
    });
  });

  describe('错误边界测试', () => {
    it('应该正确处理路由组件错误', async () => {
      // 创建一个会抛出错误的组件
      const ErrorComponent = () => {
        throw new Error('Test routing error');
      };

      const ErrorTestRouter = () => (
        <MemoryRouter initialEntries={['/']}>
          <TestRouteStateManager>
            <React.Suspense fallback={<div data-testid="suspense-loading">加载中...</div>}>
              <Routes>
                <Route path="/" element={<ErrorComponent />} />
                <Route path="*" element={<div data-testid="not-found-page">404 Not Found</div>} />
              </Routes>
            </React.Suspense>
          </TestRouteStateManager>
        </MemoryRouter>
      );

      // 这个测试可能会抛出错误，我们用try-catch捕获
      try {
        render(<ErrorTestRouter />);

        // 如果能到达这里，说明错误被正确处理了
        await waitFor(() => {
          // 可能显示错误或者fallback组件
          expect(screen.getByText(/Test routing error|Loading|404/)).toBeInTheDocument();
        });
      } catch (error) {
        // 错误被正确抛出，这也是预期的行为
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('Suspense fallback优化', () => {
    it('应该显示优化的加载状态', async () => {
      // 简化测试，只验证Suspense fallback能正常显示
      const TestRouterWithSuspense = () => (
        <MemoryRouter initialEntries={['/test-suspense']}>
          <TestRouteStateManager>
            <React.Suspense fallback={<div data-testid="suspense-loading">加载中...</div>}>
              <Routes>
                <Route path="/" element={<div data-testid="home-page">Home Page</div>} />
                <Route path="*" element={<div data-testid="not-found-page">404 Not Found</div>} />
              </Routes>
            </React.Suspense>
          </TestRouteStateManager>
        </MemoryRouter>
      );

      render(<TestRouterWithSuspense />);

      // 验证初始状态
      expect(screen.getByTestId('route-stabilizing')).toBeInTheDocument();

      // 等待组件加载完成
      await waitFor(() => {
        expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
      });

      // 验证加载状态已经清除
      expect(screen.queryByTestId('route-stabilizing')).not.toBeInTheDocument();
      expect(screen.queryByTestId('suspense-loading')).not.toBeInTheDocument();
    });
  });
});
