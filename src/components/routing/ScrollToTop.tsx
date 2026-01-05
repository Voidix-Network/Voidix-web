import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop组件
 *
 * 监听路由变化，在页面切换时自动平滑滚动到顶部
 *
 * 功能特性：
 * - 路由变化时自动滚动到顶部
 * - 使用smooth scroll实现平滑动画
 * - 使用requestAnimationFrame确保DOM渲染完成
 * - 处理特殊情况（锚点链接等）
 * - 性能优化，避免不必要的滚动
 */
export const ScrollToTop: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // 检查URL中是否包含锚点（hash）
    // 如果包含锚点，不执行自动滚动，让浏览器处理锚点导航
    if (location.hash) {
      return;
    }

    // 检查当前是否已经在顶部，避免不必要的滚动
    if (window.scrollY <= 100) {
      return;
    }

    // 使用requestAnimationFrame确保：
    // 1. DOM已经完成渲染
    // 2. 在下一个绘制帧执行，性能更好
    // 3. 避免与React渲染冲突
    const scrollToTop = () => {
      requestAnimationFrame(() => {
        // 检查页面是否支持smooth scroll
        // 降级到instant scroll以确保兼容性
        try {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth',
          });
        } catch (error) {
          // 降级方案：某些旧浏览器不支持smooth scroll
          window.scrollTo(0, 0);
        }
      });
    };

    // 立即执行滚动，避免不必要的延迟
    scrollToTop();

    // 无需清理函数，因为没有timeout
  }, [location.pathname]); // 仅监听pathname变化，忽略search和hash

  // 这是一个功能性组件，不渲染任何UI
  return null;
};

export default ScrollToTop;
