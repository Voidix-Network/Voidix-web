/**
 * SEO模块导出
 *
 * 核心组件：
 * - SEO: 传统SEO组件，保持向后兼容
 * - OptimizedSEO: 新的优化SEO组件，使用统一分析系统
 * - FAQSchema: FAQ页面结构化数据
 * - SearchEngineScript: 搜索引擎抓取辅助脚本
 * - VoidixSearchConsole: 搜索引擎验证
 * - CookieConsent: Cookie同意管理
 * - PerformanceOptimizer: 性能优化组件
 */

// 核心SEO组件
export { SEO } from './SEO';
export type { SEOProps } from './SEO';
export { default as SEOProvider } from './SEOProvider';

// SEO配置和常量
export {
  generateKeywordsString,
  getPageSEOConfig,
  PAGE_KEYWORDS_CONFIG,
  SOCIAL_MEDIA_CONFIG,
} from './chineseKeywords';
export type { ChineseKeywords, PageKeywords } from './chineseKeywords';

// 特定功能组件
export { CookieConsent } from './CookieConsent';
export { FAQSchema } from './FAQSchema';
export { PerformanceOptimizer } from './PerformanceOptimizer';
export { default as SearchEngineScript } from './SearchEngineScript';
export { VoidixSearchConsole } from './VoidixSearchConsole';
