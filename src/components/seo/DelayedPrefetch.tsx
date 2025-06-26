import React, { useEffect } from 'react';

interface DelayedPrefetchProps {
  routes?: string[];
  delay?: number;
}

/**
 * 延迟页面预获取组件
 * 在页面完全加载后，延迟预获取其他页面，避免阻塞DOMContentLoaded
 */
export const DelayedPrefetch: React.FC<DelayedPrefetchProps> = ({
  routes = ['/status', '/faq', '/privacy', '/bug-report'],
  delay = 2000,
}) => {
  useEffect(() => {
    const prefetchPages = () => {
      // 在指定延迟后开始预获取页面
      setTimeout(() => {
        routes.forEach((route, index) => {
          // 进一步错开每个页面的预获取时间，避免网络拥塞
          setTimeout(() => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = route;
            link.setAttribute('data-delayed-prefetch', 'true');

            // 添加加载状态监听
            link.onload = () => {
              console.debug(`[DelayedPrefetch] 页面预获取完成: ${route}`);
            };

            link.onerror = () => {
              console.warn(`[DelayedPrefetch] 页面预获取失败: ${route}`);
            };

            document.head.appendChild(link);
          }, index * 500); // 每个页面错开500ms
        });
      }, delay);
    };

    // 确保在页面完全加载后运行
    if (document.readyState === 'complete') {
      prefetchPages();
    } else {
      window.addEventListener('load', prefetchPages);
    }

    // 清理函数
    return () => {
      // 移除所有延迟预获取的链接
      const delayedPrefetchLinks = document.querySelectorAll('[data-delayed-prefetch="true"]');
      delayedPrefetchLinks.forEach(link => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, [routes, delay]);

  return null; // 这个组件不渲染任何内容
};

export default DelayedPrefetch;
