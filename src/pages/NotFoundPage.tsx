import { SEO } from '@/components/seo';
import { ArrowLeft, Home, Search } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

/**
 * 404错误页面组件
 * 提供友好的错误页面和导航选项
 */
export const NotFoundPage: React.FC = () => {
  // 设置404状态码（服务端渲染时有效）
  React.useEffect(() => {
    // 在客户端通过自定义事件通知服务器返回404状态码
    if (typeof window !== 'undefined') {
      document.title = '页面未找到 - Voidix';

      // 通过meta标签标记这是404页面，用于SSR时设置正确的状态码
      const metaStatus = document.createElement('meta');
      metaStatus.name = 'http-equiv';
      metaStatus.content = 'Status';
      metaStatus.setAttribute('content', '404 Not Found');
      document.head.appendChild(metaStatus);
    }
  }, []);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // 如果没有历史记录，回到首页
      window.location.href = '/';
    }
  };

  return (
    <>
      <SEO
        title="页面未找到 - Voidix"
        description="抱歉，您访问的页面不存在。返回首页继续探索Voidix Minecraft服务器的精彩内容。"
        keywords="404,页面未找到,Voidix"
        enableAnalytics={true}
        additionalMeta={[
          { name: 'robots', content: 'noindex,nofollow' },
          { property: 'og:type', content: 'website' },
        ]}
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
        <div className="text-center max-w-2xl mx-auto">
          {/* 404数字动画 */}
          <div className="mb-8">
            <div className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
              404
            </div>
            <div className="text-2xl md:text-3xl font-semibold text-gray-300 mt-4">页面走丢了</div>
          </div>
          {/* 描述文字 */}
          <div className="mb-8 space-y-4">
            <p className="text-lg text-gray-400">抱歉，您访问的页面不存在或已被移动。</p>
            <p className="text-gray-500">可能是链接错误，或者页面已经不存在了。</p>
          </div>
          {/* 建议操作 */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">您可以尝试：</h3>
            <ul className="text-left text-gray-300 space-y-2">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                检查URL地址是否正确
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
                返回首页重新导航
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                使用搜索功能查找内容
              </li>
            </ul>
          </div>{' '}
          {/* 导航按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 text-lg font-medium rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              <Home className="w-5 h-5 mr-2" />
              返回首页
            </Link>

            <button
              onClick={handleGoBack}
              className="inline-flex items-center px-6 py-3 text-lg font-medium rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              返回上页
            </button>

            <Link
              to="/faq"
              className="inline-flex items-center px-6 py-3 text-lg font-medium rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              <Search className="w-5 h-5 mr-2" />
              常见问题
            </Link>
          </div>
          {/* 底部提示 */}
          <div className="mt-12 text-gray-500 text-sm">
            <p>如果问题持续存在，请联系我们的技术支持团队</p>
          </div>
        </div>
      </div>
    </>
  );
};
