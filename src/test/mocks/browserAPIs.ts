import { vi } from 'vitest';

/**
 * 浏览器API的Mock集合
 * 为jsdom环境提供常用浏览器API的模拟实现
 */

/**
 * Mock ResizeObserver API
 * 用于观察元素尺寸变化
 */
export const mockResizeObserver = () => {
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  }
};

/**
 * Mock IntersectionObserver API
 * 用于观察元素与视口的交叉状态
 */
export const mockIntersectionObserver = () => {
  if (!globalThis.IntersectionObserver) {
    globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  }
};

/**
 * Mock matchMedia API
 * 用于媒体查询功能
 */
export const mockMatchMedia = () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

/**
 * Mock scrollTo API
 * 用于页面滚动功能
 */
export const mockScrollTo = () => {
  Object.defineProperty(window, 'scrollTo', {
    value: vi.fn(),
    writable: true,
  });
};

/**
 * 初始化所有浏览器API Mock
 * 一次性设置所有常用的浏览器API模拟
 */
export const initializeBrowserMocks = () => {
  mockResizeObserver();
  mockIntersectionObserver();
  mockMatchMedia();
  mockScrollTo();
  console.log('✅ 浏览器API Mock初始化完成');
};
