/**
 * Voidix分析系统配置
 */

import type { AnalyticsConfig } from './VoidixAnalytics';

// 默认配置
export const DEFAULT_ANALYTICS_CONFIG: AnalyticsConfig = {
  googleAnalytics: {
    measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-SPQQPKW4VN',
    enabled: import.meta.env.VITE_ENABLE_ANALYTICS !== 'false',
    debugMode: import.meta.env.DEV || false,
  },
  microsoftClarity: {
    projectId: import.meta.env.VITE_CLARITY_PROJECT_ID || 's3xbh0qmun',
    enabled: import.meta.env.VITE_ENABLE_CLARITY !== 'false',
  },
  baiduAnalytics: {
    hmId: import.meta.env.VITE_BAIDU_HM_ID || '57ae7e11272151066255c405cc93d1d8',
    enabled: import.meta.env.VITE_ENABLE_BAIDU_ANALYTICS !== 'false',
  },
  privacy: {
    requireConsent: true,
    cookielessMode: false,
  },
  performance: {
    scriptDelay: 3000, // 3秒延迟
    enableRetry: true,
    maxRetries: 3,
  },
};

// 开发环境配置
export const DEV_ANALYTICS_CONFIG: AnalyticsConfig = {
  ...DEFAULT_ANALYTICS_CONFIG,
  googleAnalytics: {
    ...DEFAULT_ANALYTICS_CONFIG.googleAnalytics,
    enabled: false, // 开发环境默认禁用
    debugMode: true,
  },
  microsoftClarity: {
    ...DEFAULT_ANALYTICS_CONFIG.microsoftClarity,
    enabled: false, // 开发环境默认禁用
  },
  baiduAnalytics: {
    ...DEFAULT_ANALYTICS_CONFIG.baiduAnalytics,
    enabled: false, // 开发环境默认禁用
  },
  performance: {
    ...DEFAULT_ANALYTICS_CONFIG.performance,
    scriptDelay: 1000, // 开发环境减少延迟
  },
};

// 生产环境配置
export const PROD_ANALYTICS_CONFIG: AnalyticsConfig = {
  ...DEFAULT_ANALYTICS_CONFIG,
  googleAnalytics: {
    ...DEFAULT_ANALYTICS_CONFIG.googleAnalytics,
    debugMode: false,
  },
  performance: {
    ...DEFAULT_ANALYTICS_CONFIG.performance,
    scriptDelay: 3000,
  },
};

/**
 * 获取当前环境的分析配置
 */
export function getAnalyticsConfig(): AnalyticsConfig {
  if (import.meta.env.DEV) {
    return DEV_ANALYTICS_CONFIG;
  }
  return PROD_ANALYTICS_CONFIG;
}

/**
 * 验证配置是否有效
 */
export function validateAnalyticsConfig(config: AnalyticsConfig): boolean {
  // 检查必需的配置项
  if (config.googleAnalytics.enabled && !config.googleAnalytics.measurementId) {
    console.warn('[Analytics Config] Google Analytics 已启用但缺少 Measurement ID');
    return false;
  }

  if (config.microsoftClarity.enabled && !config.microsoftClarity.projectId) {
    console.warn('[Analytics Config] Microsoft Clarity 已启用但缺少 Project ID');
    return false;
  }

  if (config.baiduAnalytics.enabled && !config.baiduAnalytics.hmId) {
    console.warn('[Analytics Config] Baidu Analytics 已启用但缺少 hmId');
    return false;
  }

  if (config.performance.scriptDelay < 0) {
    console.warn('[Analytics Config] 脚本延迟时间不能为负数');
    return false;
  }

  return true;
}
