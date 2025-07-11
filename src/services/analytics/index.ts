/**
 * Voidix统一分析系统
 *
 * 使用示例：
 * ```typescript
 * import { initVoidixAnalytics, voidixAnalytics } from '@/services/analytics';
 *
 * // 初始化分析系统
 * await initVoidixAnalytics();
 *
 * // 追踪事件
 * voidixAnalytics.track('button_click', { button: 'header_login' });
 *
 * // 追踪页面浏览
 * voidixAnalytics.page('HomePage');
 *
 * // 设置用户同意
 * setAnalyticsConsent(true, true, false);
 * ```
 */

// 核心类和接口
export { default as VoidixAnalytics, voidixAnalytics } from './VoidixAnalytics';
export type { AnalyticsConfig, ConsentSettings, Logger, TrackingEvent } from './VoidixAnalytics';

// 配置相关
export {
  DEFAULT_ANALYTICS_CONFIG,
  DEV_ANALYTICS_CONFIG,
  getAnalyticsConfig,
  PROD_ANALYTICS_CONFIG,
  validateAnalyticsConfig,
} from './config';

// 初始化相关
export {
  destroyAnalytics,
  getAnalyticsStatus,
  initVoidixAnalytics,
  setAnalyticsConsent,
} from './init';

// 便捷的事件追踪方法
import { voidixAnalytics as analyticsInstance } from './init';

export const analytics = {
  /**
   * 追踪页面浏览
   */
  page: (name?: string, properties?: Record<string, any>) => {
    return analyticsInstance.page(name, properties);
  },

  /**
   * 追踪自定义事件
   */
  track: (event: string, properties?: Record<string, any>) => {
    return analyticsInstance.track(event, properties);
  },

  /**
   * 追踪Bug报告
   */
  trackBugReport: (reportType: string, severity: string) => {
    return analyticsInstance.trackBugReport(reportType, severity);
  },

  /**
   * 追踪FAQ查看
   */
  trackFAQView: (questionId: string, category: string) => {
    return analyticsInstance.trackFAQView(questionId, category);
  },

  /**
   * 追踪页面性能
   */
  trackPagePerformance: () => {
    return analyticsInstance.trackPagePerformance();
  },

  /**
   * 追踪用户标识
   */
  identify: (userId: string, traits?: Record<string, any>) => {
    return analyticsInstance.identify(userId, traits);
  },

  /**
   * 获取分析状态
   */
  getStatus: () => {
    return analyticsInstance.getStatus();
  },
};
