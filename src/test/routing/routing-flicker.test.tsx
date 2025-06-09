/**
 * 路由闪烁问题测试套件
 * 测试访问不存在页面时的路由行为和地址栏显示
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import React from 'react';

// Mock all lazy components to avoid loading delays
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

// Mock useWebSocket hook
vi.mock('@/hooks/useWebSocket', () => ({
  useWebSocket: vi.fn(() => ({})),
}));

// 创建自定义路由测试组件
const RouterTest = ({ initialPath = '/nonexistent' }: { initialPath?: string }) => {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <div data-testid="layout">
        <React.Suspense fallback={<div data-testid="loading">Loading...</div>}>
          <Routes>
            <Route path="/" element={<div data-testid="home-page">Home Page</div>} />
            <Route path="/status" element={<div data-testid="status-page">Status Page</div>} />
            <Route path="/faq" element={<div data-testid="faq-page">FAQ Page</div>} />
            <Route
              path="/bug-report"
              element={<div data-testid="bug-report-page">Bug Report Page</div>}
            />
            <Route
              path="/not-found"
              element={<div data-testid="not-found-page">404 Not Found</div>}
            />
            <Route path="*" element={<div data-testid="not-found-page">404 Not Found</div>} />
          </Routes>
        </React.Suspense>
      </div>
    </MemoryRouter>
  );
};

describe('路由闪烁问题测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('路由状态追踪', () => {
    it('应该直接导航到404页面而不经过首页', async () => {
      render(<RouterTest initialPath="/nonexistent-page" />);

      // 等待路由解析完成
      await waitFor(() => {
        expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
      });

      // 验证没有显示其他页面
      expect(screen.queryByTestId('home-page')).not.toBeInTheDocument();
      expect(screen.queryByTestId('status-page')).not.toBeInTheDocument();
      expect(screen.queryByTestId('faq-page')).not.toBeInTheDocument();
    });

    it('应该在不同的无效路径下都显示404页面', async () => {
      const invalidPaths = ['/random-path', '/does-not-exist', '/invalid/nested/path', '/123456'];

      for (const path of invalidPaths) {
        const { unmount } = render(<RouterTest initialPath={path} />);

        await waitFor(() => {
          expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
        });

        expect(screen.queryByTestId('home-page')).not.toBeInTheDocument();

        unmount();
      }
    });

    it('应该为有效路径正确路由', async () => {
      const validPaths = [
        { path: '/', testId: 'home-page' },
        { path: '/status', testId: 'status-page' },
        { path: '/faq', testId: 'faq-page' },
        { path: '/bug-report', testId: 'bug-report-page' },
      ];

      for (const { path, testId } of validPaths) {
        const { unmount } = render(<RouterTest initialPath={path} />);

        await waitFor(() => {
          expect(screen.getByTestId(testId)).toBeInTheDocument();
        });

        expect(screen.queryByTestId('not-found-page')).not.toBeInTheDocument();

        unmount();
      }
    });
  });

  describe('Suspense和懒加载行为', () => {
    it('应该在组件加载期间显示loading状态', async () => {
      // 创建一个延迟的组件来模拟真实的懒加载
      const DelayedNotFound = () => {
        const [loaded, setLoaded] = React.useState(false);

        React.useEffect(() => {
          const timer = setTimeout(() => setLoaded(true), 50);
          return () => clearTimeout(timer);
        }, []);

        if (!loaded) {
          return <div data-testid="loading">Loading...</div>;
        }

        return <div data-testid="not-found-page">404 Not Found</div>;
      };

      const DelayedRouterTest = () => (
        <MemoryRouter initialEntries={['/nonexistent']}>
          <div data-testid="layout">
            <React.Suspense fallback={<div data-testid="loading">Loading...</div>}>
              <Routes>
                <Route path="/" element={<div data-testid="home-page">Home Page</div>} />
                <Route path="*" element={<DelayedNotFound />} />
              </Routes>
            </React.Suspense>
          </div>
        </MemoryRouter>
      );

      render(<DelayedRouterTest />);

      // 验证加载状态
      expect(screen.getByTestId('loading')).toBeInTheDocument();

      // 等待组件加载完成
      await waitFor(() => {
        expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    it('应该确保没有多次渲染首页', async () => {
      let homeRenderCount = 0;

      const TrackedHomePage = () => {
        homeRenderCount++;
        return <div data-testid="home-page">Home Page (render #{homeRenderCount})</div>;
      };

      const TrackedRouterTest = () => (
        <MemoryRouter initialEntries={['/nonexistent-page']}>
          <div data-testid="layout">
            <React.Suspense fallback={<div data-testid="loading">Loading...</div>}>
              <Routes>
                <Route path="/" element={<TrackedHomePage />} />
                <Route path="*" element={<div data-testid="not-found-page">404 Not Found</div>} />
              </Routes>
            </React.Suspense>
          </div>
        </MemoryRouter>
      );

      render(<TrackedRouterTest />);

      await waitFor(() => {
        expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
      });

      // 验证首页从未被渲染
      expect(homeRenderCount).toBe(0);
      expect(screen.queryByTestId('home-page')).not.toBeInTheDocument();
    });
  });

  describe('浏览器历史记录模拟', () => {
    it('应该正确处理浏览器地址栏状态', async () => {
      const mockPushState = vi.fn();
      const mockReplaceState = vi.fn();

      // Mock history API
      Object.defineProperty(window, 'history', {
        value: {
          pushState: mockPushState,
          replaceState: mockReplaceState,
          length: 1,
          state: null,
        },
        writable: true,
      });

      render(<RouterTest initialPath="/invalid-path" />);

      await waitFor(() => {
        expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
      });

      // 验证历史记录API没有被意外调用
      // 这有助于确保没有意外的重定向
      expect(mockPushState).not.toHaveBeenCalled();
      expect(mockReplaceState).not.toHaveBeenCalled();
    });
  });

  describe('React Router行为分析', () => {
    it('应该分析路由组件的渲染顺序', async () => {
      const renderOrder: string[] = [];

      const TrackedHome = () => {
        renderOrder.push('home-rendered');
        return <div data-testid="home-page">Home Page</div>;
      };

      const TrackedNotFound = () => {
        renderOrder.push('notfound-rendered');
        return <div data-testid="not-found-page">404 Not Found</div>;
      };

      const TrackedRouterTest = () => (
        <MemoryRouter initialEntries={['/nonexistent-test-path']}>
          <div data-testid="layout">
            <React.Suspense fallback={<div data-testid="loading">Loading...</div>}>
              <Routes>
                <Route path="/" element={<TrackedHome />} />
                <Route path="*" element={<TrackedNotFound />} />
              </Routes>
            </React.Suspense>
          </div>
        </MemoryRouter>
      );

      render(<TrackedRouterTest />);

      // 等待路由解析完成
      await waitFor(() => {
        expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
      });

      // 分析渲染顺序
      console.log('Render order:', renderOrder);

      // 验证首页没有被渲染
      expect(renderOrder).not.toContain('home-rendered');
      expect(renderOrder).toContain('notfound-rendered');
    });

    it('应该分析Suspense fallback的触发条件', async () => {
      let fallbackTriggered = false;

      const TrackedSuspense = ({ children }: { children: React.ReactNode }) => (
        <React.Suspense
          fallback={
            <div
              data-testid="suspense-fallback"
              ref={() => {
                fallbackTriggered = true;
              }}
            >
              Loading...
            </div>
          }
        >
          {children}
        </React.Suspense>
      );

      const SuspenseTest = () => (
        <MemoryRouter initialEntries={['/test-suspense']}>
          <TrackedSuspense>
            <Routes>
              <Route path="/" element={<div data-testid="home-page">Home</div>} />
              <Route path="*" element={<div data-testid="not-found-page">404</div>} />
            </Routes>
          </TrackedSuspense>
        </MemoryRouter>
      );

      render(<SuspenseTest />);

      await waitFor(() => {
        expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
      });

      console.log('Fallback triggered:', fallbackTriggered);
    });
  });

  describe('路由状态变化监控', () => {
    it('应该监控路由状态变化过程', async () => {
      const routeStates: string[] = [];

      const RouteStateMonitor = () => {
        const [currentRoute, setCurrentRoute] = React.useState('');

        React.useEffect(() => {
          const updateRoute = () => {
            const path = window.location.pathname;
            setCurrentRoute(path);
            routeStates.push(path);
          };

          updateRoute();
          window.addEventListener('popstate', updateRoute);

          return () => window.removeEventListener('popstate', updateRoute);
        }, []);

        return (
          <div>
            <div data-testid="current-route">{currentRoute}</div>
            <MemoryRouter initialEntries={['/test-route-monitoring']}>
              <Routes>
                <Route path="/" element={<div data-testid="home-page">Home</div>} />
                <Route path="*" element={<div data-testid="not-found-page">404</div>} />
              </Routes>
            </MemoryRouter>
          </div>
        );
      };

      render(<RouteStateMonitor />);

      await waitFor(() => {
        expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
      });

      // 验证路由状态变化历史
      console.log('Route states:', routeStates);
    });
  });
});
