import { useEffect, useState } from 'react';

/**
 * 检测当前是否在服务端渲染环境
 * 用于防止SSR期间的组件闪烁
 *
 * @example
 * ```tsx
 * const { isSSR, isMounted, shouldRender } = useSSR();
 *
 * if (!shouldRender) return null;
 *
 * return <div>只在客户端渲染的内容</div>;
 * ```
 */
export const useSSR = () => {
  const [isSSR, setIsSSR] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // 在客户端执行时，设置状态
    setIsSSR(false);
    setIsMounted(true);
  }, []);

  return {
    isSSR,
    isMounted,
    // 便捷方法：只在客户端且已挂载时返回true
    shouldRender: !isSSR && isMounted,
  };
};

/**
 * 专门用于Cookie横幅的SSR hook
 * 确保横幅只在客户端且用户未做出选择时才渲染
 *
 * @example
 * ```tsx
 * const { shouldRenderBanner } = useCookieBannerSSR();
 *
 * if (!shouldRenderBanner) return null;
 *
 * return <CookieBanner />;
 * ```
 */
export const useCookieBannerSSR = () => {
  const { isSSR, isMounted } = useSSR();

  return {
    isSSR,
    isMounted,
    // 横幅应该渲染的条件：客户端 + 已挂载 + 不是SSR
    shouldRenderBanner: !isSSR && isMounted,
  };
};

/**
 * 通用的SSR安全渲染hook
 * 可以用于任何需要在SSR期间隐藏的组件
 *
 * @param shouldRender - 额外的渲染条件
 *
 * @example
 * ```tsx
 * const { shouldRender } = useSSRSafeRender(!hasUserConsent);
 *
 * if (!shouldRender) return null;
 *
 * return <ConsentBanner />;
 * ```
 */
export const useSSRSafeRender = (shouldRender: boolean = true) => {
  const { isSSR, isMounted } = useSSR();

  return {
    isSSR,
    isMounted,
    // 只有在客户端、已挂载且shouldRender为true时才渲染
    shouldRender: !isSSR && isMounted && shouldRender,
  };
};
