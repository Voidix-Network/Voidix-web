/**
 * 测试环境设置
 * 配置测试运行时需要的全局设置和Mock
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { initializeBrowserMocks, initializeWebSocketMocks } from './mocks';

// 为 framer-motion 添加 PointerEvent mock，修复测试环境兼容性
global.PointerEvent = class PointerEvent extends Event {
  pointerId: number;
  pressure: number;
  pointerType: string;

  constructor(type: string, init?: PointerEventInit) {
    super(type, init);
    this.pointerId = init?.pointerId ?? 0;
    this.pressure = init?.pressure ?? 0;
    this.pointerType = init?.pointerType ?? 'mouse';
  }
} as any;

// Mock JSDOM navigation API to prevent stderr warnings
Object.defineProperty(window, 'navigation', {
  value: {
    navigate: vi.fn(),
    canGoBack: false,
    canGoForward: false,
    currentEntry: null,
    entries: [],
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    reload: vi.fn(),
    traverseTo: vi.fn(),
    updateCurrentEntry: vi.fn(),
  },
  writable: true,
  configurable: true,
});

// Suppress JSDOM navigation errors completely
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  // Filter out JSDOM navigation errors
  const message = args[0];
  if (typeof message === 'string' && message.includes('Not implemented: navigation')) {
    return; // Silently ignore JSDOM navigation errors
  }
  return originalConsoleError.apply(console, args);
};

// Mock window.location to use production URL in tests
Object.defineProperty(window, 'location', {
  value: {
    href: 'https://www.voidix.net/',
    origin: 'https://www.voidix.net',
    protocol: 'https:',
    host: 'www.voidix.net',
    hostname: 'www.voidix.net',
    port: '',
    pathname: '/',
    search: '',
    hash: '',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  },
  writable: true,
  configurable: true,
});

// 初始化所有必要的Mock对象
initializeBrowserMocks();
initializeWebSocketMocks();

console.log('✅ 测试环境初始化完成 - window.location已设置为生产URL');
