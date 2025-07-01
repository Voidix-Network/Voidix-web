// 推荐使用的核心SEO组件
export { default as CookieConsent } from './CookieConsent';
export { default as SEO } from './SEO';
export type { SEOProps } from './SEO';
export { default as SEOProvider } from './SEOProvider';

// SEO配置和常量
export * from './chineseKeywords';
export * from './feedbackChannels';
export * from './feedbackRequirements';

// 保留的原有组件（兼容性）
export { default as FAQSchema } from './FAQSchema';
export { default as PerformanceOptimizer } from './PerformanceOptimizer';

// 搜索引擎相关组件
export { default as SearchEngineScript } from './SearchEngineScript';
export { default as VoidixSearchConsole } from './VoidixSearchConsole';

// 使用指南：
//
// 🚀 快速开始（推荐）：
// import { SEO, CookieConsent, SEOProvider } from '@/components/seo';
//
// 🔧 搜索引擎优化：
// import { SearchEngineScript, VoidixSearchConsole } from '@/components/seo';
//
// 📄 页面结构化数据：
// import { FAQSchema } from '@/components/seo';

/**
 * 简化后的SEO模块指南：
 *
 * ✅ 核心使用方式：
 * <SEO pageKey="home" enableAnalytics={true} />
 * <CookieConsent enableCustomization={true} />
 * <SearchEngineScript />
 * <VoidixSearchConsole />
 *
 * ❌ 已删除的高级组件（减少维护负担）：
 * AdvancedStructuredData - 功能过于复杂，已删除
 * WebVitalsMonitor - 功能已整合到SEO组件
 * DelayedPrefetch - 性能收益不明显，已删除
 * MicrosoftClarity - 分析功能已整合到SEO组件
 * InternationalSEO - 当前项目不需要多语言支持
 * ReviewSchema - 暂不需要评价功能
 */
