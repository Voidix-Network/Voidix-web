import { OptimizedAppRouter } from '@/components/routing/OptimizedAppRouter';
import {
  AdvancedStructuredData,
  CookieConsent,
  SearchEngineScript,
  SEOProvider,
  UnifiedAnalytics,
  VoidixSearchConsole,
} from '@/components/seo';

/**
 * 主应用组件
 * 使用优化的路由器，支持代码分割、懒加载和错误边界
 * 集成SEOProvider提供动态SEO管理功能
 * 集成UnifiedAnalytics提供现代化Google Analytics和百度统计
 * 集成VoidixSearchConsole提供搜索引擎验证
 * 集成AdvancedStructuredData提供高级Schema.org标记
 * 集成CookieConsent提供GDPR合规的Cookie同意管理
 *
 * 第三方Cookie问题修复：
 * - ✅ 使用超级无Cookie版本Google Analytics，零第三方依赖
 * - ✅ 完全不加载第三方GA脚本，使用Measurement Protocol
 * - ✅ 开发环境默认禁用，避免测试污染
 * - ✅ 彻底解决Chrome DevTools第三方Cookie警告
 */
function App() {
  return (
    <SEOProvider>
      {/* 新的Cookie同意组件 */}
      <CookieConsent />

      {/* 搜索引擎抓取脚本 */}
      <SearchEngineScript />

      {/* 统一分析（仅Google Analytics） */}
      <UnifiedAnalytics enableGoogleAnalytics={true} disableInDev={true} delayMs={2000} />

      <VoidixSearchConsole />
      <AdvancedStructuredData />
      <OptimizedAppRouter />
    </SEOProvider>
  );
}

export default App;
