import { useState, useEffect, useRef, RefObject } from 'react';

/**
 * 自定义useInView Hook配置选项
 */
interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  mobileImmediate?: boolean;
}

/**
 * 自定义useInView Hook返回值
 */
interface UseInViewReturn<T extends HTMLElement = HTMLElement> {
  ref: RefObject<T>;
  isInView: boolean;
  hasBeenSeen: boolean;
}

/**
 * 检测元素是否进入视口的自定义Hook
 * 针对移动端优化，解决framer-motion viewport触发问题
 *
 * @param options 配置选项
 * @returns {UseInViewReturn<T>} 包含ref、isInView状态和hasBeenSeen状态
 */
export const useInView = <T extends HTMLElement = HTMLElement>(
  options: UseInViewOptions = {}
): UseInViewReturn<T> => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true,
    mobileImmediate = true,
  } = options;

  const [isInView, setIsInView] = useState(false);
  const [hasBeenSeen, setHasBeenSeen] = useState(false);
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // 检测移动端设备（增强版）
    const isMobile = isMobileDevice();
    const reducedMotion = prefersReducedMotion();

    // 移动端或偏好减少动画时，立即显示 - 完全跳过viewport检测
    if (isMobile || reducedMotion || mobileImmediate) {
      console.log('📱 [useInView] Mobile/reduced motion detected, immediate display', {
        isMobile,
        reducedMotion,
        mobileImmediate,
      });
      setIsInView(true);
      setHasBeenSeen(true);
      return;
    }

    // 检查是否支持Intersection Observer
    if (!window.IntersectionObserver) {
      console.warn(
        '⚠️ [useInView] IntersectionObserver not supported, fallback to immediate display'
      );
      setIsInView(true);
      setHasBeenSeen(true);
      return;
    }

    // 桌面端使用Intersection Observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;

        if (isVisible && (!hasBeenSeen || !triggerOnce)) {
          console.log('👁️ [useInView] Element entered viewport', {
            target: entry.target,
            intersectionRatio: entry.intersectionRatio,
            boundingClientRect: entry.boundingClientRect,
          });

          setIsInView(true);
          setHasBeenSeen(true);
        } else if (!isVisible && !triggerOnce) {
          setIsInView(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);
    console.log('🔍 [useInView] Observer attached to element', {
      threshold,
      rootMargin,
    });

    return () => {
      observer.disconnect();
      console.log('🔌 [useInView] Observer disconnected');
    };
  }, [threshold, rootMargin, triggerOnce, mobileImmediate, hasBeenSeen]);

  // 调试信息
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🎬 [useInView] State update', {
        isInView,
        hasBeenSeen,
        element: elementRef.current?.tagName,
      });
    }
  }, [isInView, hasBeenSeen]);

  return {
    ref: elementRef,
    isInView,
    hasBeenSeen,
  };
};

/**
 * 移动端设备检测工具函数
 * 增强检测逻辑，包含屏幕尺寸判断
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth <= 768
  );
};

/**
 * 检查用户是否偏好减少动画
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};
