import { OptimizedAppRouter } from '@/components/routing/OptimizedAppRouter';
import {
  CookieConsent,
  SearchEngineScript,
  SEOProvider,
  VoidixSearchConsole,
} from '@/components/seo';
import { DelayedPrefetch } from '@/components/seo/DelayedPrefetch';

/**
 * 主应用组件
 * 使用优化的路由器，支持代码分割、懒加载和错误边界
 * 集成SEOProvider提供动态SEO管理功能
 * 简化的SEO架构，提升性能和维护性
 *
 * SEO优化改进：
 * - ✅ 简化SEO组件架构，减少冗余
 * - ✅ 整合分析功能，避免重复代码
 * - ✅ 优化性能，减少bundle大小
 * - ✅ 保持GDPR合规性
 * - ✅ 维护搜索引擎优化效果
 */
function App() {
  return (
    <SEOProvider>
      {/* 简化的Cookie同意管理 */}
      <CookieConsent enableCustomization={true} />

      {/* 搜索引擎抓取脚本 */}
      <SearchEngineScript />

      {/* 搜索引擎验证 */}
      <VoidixSearchConsole />

      {/* 延迟页面预获取 */}
      <DelayedPrefetch />

      {/* 主路由组件 */}
      <OptimizedAppRouter />
    </SEOProvider>
  );
}

export default App;
