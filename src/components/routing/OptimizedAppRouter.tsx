import { Layout } from '@/components';
import '@/styles/page-transitions.css';
import React, { Suspense, useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import { ScrollToTop } from './ScrollToTop';

// 懒加载页面组件 - 禁用预加载，减少DOMContentLoaded期间的网络请求
const HomePage = React.lazy(() =>
  import(/* webpackPreload: false */ '@/pages/HomePage').then(module => ({
    default: module.HomePage,
  }))
);
const StatusPage = React.lazy(() =>
  import(/* webpackPreload: false */ '@/pages/StatusPage').then(module => ({
    default: module.StatusPage,
  }))
);
const FaqPage = React.lazy(() =>
  import(/* webpackPreload: false */ '@/pages/FaqPage').then(module => ({
    default: module.FaqPage,
  }))
);
const BugReportPage = React.lazy(() =>
  import(/* webpackPreload: false */ '@/pages/BugReportPage').then(module => ({
    default: module.BugReportPage,
  }))
);
const PrivacyPolicyPage = React.lazy(() =>
  import(/* webpackPreload: false */ '@/pages/PrivacyPolicyPage').then(module => ({
    default: module.PrivacyPolicyPage,
  }))
);

const BanHistoryPage = React.lazy(() =>
  import(/* webpackPreload: false */ '@/pages/BanHistoryPage').then(module => ({
    default: module.default,
  }))
);

const NotFoundPage = React.lazy(() =>
  import(/* webpackPreload: false */ '@/pages/NotFoundPage').then(module => ({
    default: module.NotFoundPage,
  }))
);

// 新增页面
const LoginPage = React.lazy(() =>
  import(/* webpackPreload: false */ '@/pages/LoginPage').then(module => ({
    default: module.LoginPage,
  }))
);

const IssuePage = React.lazy(() =>
  import(/* webpackPreload: false */ '@/pages/IssuePage').then(module => ({
    default: module.IssuePage,
  }))
);

const IssueDetailPage = React.lazy(() =>
  import(/* webpackPreload: false */ '@/pages/IssueDetailPage').then(module => ({
    default: module.IssueDetailPage,
  }))
);

const IssueFormPage = React.lazy(() =>
  import(/* webpackPreload: false */ '@/pages/IssueFormPage').then(module => ({
    default: module.IssueFormPage,
  }))
);

const TagManagePage = React.lazy(() =>
  import(/* webpackPreload: false */ '@/pages/TagManagePage').then(module => ({
    default: module.TagManagePage,
  }))
);

/**
 * 路由感知的加载组件
 * 根据当前路径显示相应的加载内容，避免内容混淆
 */
const RouteAwareFallback: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // 判断是否为404路由
  const is404Route = ![
    '/',
    '/status',
    '/faq',
    '/bug-report',
    '/privacy',
    '/ban-history',
    '/login',
    '/issue',
    '/issue/create',
    '/issue/edit/:id',
    '/issue/:id',
    '/tag-manage',
    '/not-found',
  ].includes(currentPath);

  if (is404Route) {
    // 404页面专用加载状态
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 loading-fade-in">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-6">
            <div className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
              404
            </div>
            <div className="text-lg font-semibold text-gray-300 mt-2">页面加载中...</div>
          </div>
          <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // 普通页面加载状态
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center loading-fade-in">
      <div className="flex flex-col items-center space-y-4">
        {/* Minecraft风格的加载动画 */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-lg animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-cyan-400 rounded-lg animate-spin animation-delay-150"></div>
        </div>
        <div className="text-center">
          <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            加载中...
          </h3>
          <p className="text-gray-400 text-sm mt-1">正在为您准备精彩内容</p>
        </div>
      </div>
    </div>
  );
};

/**
 * 路由状态管理器
 * 防止路径闪烁和内容混淆，优化版本减少延迟
 */
const RouteStateManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isRouteStable, setIsRouteStable] = useState(false);
  const currentPath = location.pathname;

  useEffect(() => {
    // 重置稳定状态
    setIsRouteStable(false);

    // 使用requestAnimationFrame实现流畅切换，无额外延迟
    const frameId = requestAnimationFrame(() => {
      setIsRouteStable(true);
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [location.pathname]);

  // 在路由稳定之前，显示路由感知的稳定化内容
  if (!isRouteStable) {
    // 判断是否为404路由
    const is404Route = ![
      '/',
      '/status',
      '/faq',
      '/bug-report',
      '/privacy',
      '/ban-history',
      '/login',
      '/issue',
      '/issue/create',
      '/issue/edit/:id',
      '/issue/:id',
      '/tag-manage',
      '/not-found',
    ].includes(currentPath);

    if (is404Route) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 route-stabilizing">
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              404
            </div>
            <div className="text-sm text-gray-400 mt-1">路由准备中...</div>
          </div>
        </div>
      );
    }

    // 普通页面的稳定化状态
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center route-stabilizing">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <div className="text-gray-400 text-sm">准备中...</div>
        </div>
      </div>
    );
  }

  return <div className="page-transition-container layout-stable">{children}</div>;
};

/**
 * 路由内容组件
 * 分离路由逻辑以提供更好的控制
 */
const RouteContent: React.FC = () => {
  return (
    <>
      {/* ScrollToTop组件监听路由变化，自动滚动到顶部 */}
      <ScrollToTop />
      <RouteStateManager>
        <Suspense fallback={<RouteAwareFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/bug-report" element={<BugReportPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/ban-history" element={<BanHistoryPage />} />
            {/* 新增路由 */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/issue" element={<IssuePage />} />
            <Route path="/issue/create" element={<IssueFormPage />} />
            <Route path="/issue/edit/:id" element={<IssueFormPage />} />
            <Route path="/issue/:id" element={<IssueDetailPage />} />
            <Route path="/tag-manage" element={<TagManagePage />} />
            {/* 静态文件404重定向路径 */}
            <Route path="/not-found" element={<NotFoundPage />} />
            {/* 404页面 - 必须放在最后 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </RouteStateManager>
    </>
  );
};

/**
 * 错误边界组件
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class PageErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('页面加载错误:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 获取错误信息，提供更好的调试体验
      const errorMessage = this.state.error?.message || '未知错误';
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">页面加载失败</h2>
            <p className="text-gray-400 mb-4">抱歉，页面遇到了一些问题。请刷新页面重试。</p>

            {/* 开发模式下显示详细错误信息 */}
            {isDevelopment && this.state.error && (
              <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-left">
                <h3 className="text-red-400 font-semibold mb-2">错误详情（开发模式）:</h3>
                <p className="text-red-300 text-sm font-mono break-words">{errorMessage}</p>
                {this.state.error.stack && (
                  <details className="mt-2">
                    <summary className="text-red-400 cursor-pointer">堆栈跟踪</summary>
                    <pre className="text-red-300 text-xs mt-2 overflow-auto max-h-32">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 优化的App路由组件
 * 支持代码分割、懒加载、错误边界、路由状态管理
 *
 * 注意：WebSocket连接由 App.tsx 中的 WebSocketProvider 管理，
 * 此处无需再次初始化连接
 */
export const OptimizedAppRouter: React.FC = () => {
  return (
    <Router>
      <Layout>
        <PageErrorBoundary>
          <RouteContent />
        </PageErrorBoundary>
      </Layout>
    </Router>
  );
};

export default OptimizedAppRouter;
