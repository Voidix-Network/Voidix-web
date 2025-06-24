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

// 专业版SEO组件（高级功能）
export { default as AdvancedStructuredData } from './AdvancedStructuredData';
export { default as SearchEngineScript } from './SearchEngineScript';
export { default as WebVitalsMonitor } from './WebVitalsMonitor';

// 分析组件（可选）
export { default as MicrosoftClarity } from './MicrosoftClarity';
export { default as VoidixSearchConsole } from './VoidixSearchConsole';

// 企业级SEO组件（大型项目）
export {
  generateMultilingualSitemap,
  InternationalSEO,
  useLanguageSwitcher,
} from './InternationalSEO';
export { MinecraftServerReview, ReviewSchema } from './ReviewSchema';

// 使用指南：
//
// 🚀 快速开始（推荐）：
// import { SEO, CookieConsent, SEOProvider } from '@/components/seo';
//
// 🔧 高级功能：
// import { AdvancedStructuredData, WebVitalsMonitor, MicrosoftClarity } from '@/components/seo';
//
// 📊 企业级：
// import { InternationalSEO, ReviewSchema } from '@/components/seo';

/**
 * 迁移指南：
 *
 * ✅ 推荐做法（新架构）：
 * <SEO pageKey="home" enableAnalytics={true} enableClarity={true} />
 * <WebVitalsMonitor enableMicrosoftClarity={true} />
 * <MicrosoftClarity projectId="xxx" enableDebug={false} />
 *
 * ❌ 已删除的组件（功能已整合或简化）：
 * <UnifiedAnalytics /> // 已整合到SEO组件
 * <UltraCookielessGoogleAnalytics /> // 已整合到SEO组件
 * <PageSEO /> // 已被SEO组件替代
 * <MonitorStructuredData /> // 过于复杂，已删除
 */
