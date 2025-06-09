import { useCallback } from 'react';
import { OptimizedAppRouter } from '@/components/routing/OptimizedAppRouter';
import {
  SEOProvider,
  UnifiedAnalytics,
  VoidixSearchConsole,
  AdvancedStructuredData,
} from '@/components/seo';
import CookieConsentDark, { ConsentSettings } from '@/components/seo/CookieConsentDark';

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
  /**
   * Cookie同意状态变化处理
   * 保留用于未来可能的第三方服务集成
   */
  const handleConsentChange = useCallback((consent: ConsentSettings) => {
    console.log('[App] Cookie同意状态更新:', consent);

    // 清理可能的遗留cookies（预防性措施）
    if (!consent.analytics) {
      const cookiesToClear = ['_ga', '_ga_SPQQPKW4VN', '_gid', '_gat', 'ar_debug'];
      cookiesToClear.forEach(cookieName => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      console.log('[App] 已清理分析相关cookies');
    }
  }, []);

  return (
    <SEOProvider>
      {/* Cookie同意横幅（GDPR合规 - 暗黑主题） */}
      <CookieConsentDark
        theme="dark"
        showDetailedSettings={false}
        onConsentChange={handleConsentChange}
      />

      {/* 统一分析（仅Google Analytics） */}
      <UnifiedAnalytics
        enableGoogleAnalytics={true}
        enableDebug={import.meta.env.DEV}
        disableInDev={true}
        delayMs={2000}
      />

      <VoidixSearchConsole />
      <AdvancedStructuredData />
      <OptimizedAppRouter />
    </SEOProvider>
  );
}

export default App;
