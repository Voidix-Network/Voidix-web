/**
 * Voidix分析系统初始化器
 * 提供简化的初始化接口
 */

import { voidixAnalytics } from './VoidixAnalytics';
import { getAnalyticsConfig, validateAnalyticsConfig } from './config';

let isInitialized = false;
let initPromise: Promise<void> | null = null;

/**
 * 初始化Voidix分析系统
 */
export async function initVoidixAnalytics(): Promise<void> {
  // 防止重复初始化
  if (isInitialized) {
    return;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = performInitialization();
  return initPromise;
}

/**
 * 执行实际的初始化
 */
async function performInitialization(): Promise<void> {
  try {
    const config = getAnalyticsConfig();

    // 验证配置
    if (!validateAnalyticsConfig(config)) {
      throw new Error('分析系统配置验证失败');
    }

    // 初始化分析系统
    await voidixAnalytics.init(config);

    isInitialized = true;

    console.info('[VoidixAnalytics] 分析系统初始化成功');

    // 设置全局错误处理
    setupGlobalErrorHandling();
  } catch (error) {
    console.error('[VoidixAnalytics] 分析系统初始化失败:', error);
    throw error;
  }
}

/**
 * 设置全局错误处理
 */
function setupGlobalErrorHandling(): void {
  // 监听未捕获的错误
  window.addEventListener('error', event => {
    voidixAnalytics.track('javascript_error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
    });
  });

  // 监听Promise拒绝
  window.addEventListener('unhandledrejection', event => {
    voidixAnalytics.track('promise_rejection', {
      reason: event.reason?.toString(),
      stack: event.reason?.stack,
    });
  });
}

/**
 * 获取分析系统状态
 */
export function getAnalyticsStatus() {
  return {
    initialized: isInitialized,
    analytics: voidixAnalytics.getStatus(),
  };
}

/**
 * 手动设置用户同意（用于Cookie同意组件）
 */
export function setAnalyticsConsent(analytics: boolean, performance: boolean = true) {
  voidixAnalytics.setConsent({
    analytics,
    performance,
  });

  // 如果用户同意且系统未初始化，则立即初始化
  if (analytics && !isInitialized) {
    initVoidixAnalytics().catch(error => {
      console.error('[VoidixAnalytics] 延迟初始化失败:', error);
    });
  }
}

/**
 * 清理分析系统（用于测试或页面卸载）
 */
export function destroyAnalytics(): void {
  voidixAnalytics.destroy();
  isInitialized = false;
  initPromise = null;
}

// 导出核心实例以便直接使用
export { voidixAnalytics } from './VoidixAnalytics';
