import { Helmet } from 'react-helmet-async';

interface PerformanceOptimizerProps {
  preloadFonts?: string[];
  preloadImages?: string[];
  prefetchRoutes?: string[];
}

/**
 * 性能优化组件 - 专门用于Core Web Vitals优化
 * 提供关键资源预加载、字体优化、图像预加载等功能
 */
export const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({
  preloadFonts = [],
  preloadImages = [],
  prefetchRoutes = [],
}) => {
  return (
    <Helmet>
      {/* 关键字体预加载 */}
      {preloadFonts.map((font, index) => (
        <link
          key={index}
          rel="preload"
          href={font}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      ))}

      {/* 关键图像预加载 */}
      {preloadImages.map((image, index) => (
        <link key={index} rel="preload" href={image} as="image" />
      ))}

      {/* 路由预获取 */}
      {prefetchRoutes.map((route, index) => (
        <link key={index} rel="prefetch" href={route} />
      ))}

      {/* Critical CSS内联优化标记 */}
      <style>{`
        /* Critical CSS for LCP optimization */
        body {
          font-display: swap;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* 防止CLS的基础样式 */
        img {
          max-width: 100%;
          height: auto;
        }

        /* 骨架屏样式减少CLS */
        .loading-skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }

        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </Helmet>
  );
};

export default PerformanceOptimizer;
