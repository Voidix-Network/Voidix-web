import React, { useEffect, useState } from 'react';
// import { useConsent } from '@voidix/ui-react'; // Assuming this provides consent status

import MicrosoftClarity from './MicrosoftClarity';
import { UltraCookielessGoogleAnalytics } from './UltraCookielessGoogleAnalytics';

interface UnifiedAnalyticsProps {
  /**
   * 是否启用Google Analytics
   */
  enableGoogleAnalytics?: boolean;
  /**
   * 是否启用调试模式
   */
  enableDebug?: boolean;
  /**
   * 是否在开发环境中禁用
   */
  disableInDev?: boolean;
  /**
   * 延迟加载时间（毫秒）
   */
  delayMs?: number;
  /**
   * 是否启用Microsoft Clarity
   */
  enableClarity?: boolean;
  /**
   * Microsoft Clarity项目ID
   */
  clarityProjectId?: string;
}

/**
 * Voidix统一分析组件
 * 集成Google Analytics 4和Microsoft Clarity，提供全面的网站分析功能
 *
 * 功能特性：
 * - Google Analytics 4: 用户分析和事件跟踪
 * - Microsoft Clarity: 用户行为分析（热力图、会话回放）
 * - Cookie同意机制: GDPR/隐私法规合规
 * - 统一的事件跟踪API
 * - 开发环境智能禁用
 * - Minecraft服务器专用事件
 * - 延迟加载优化
 *
 * 使用说明：
 * 1. 在App.tsx根组件中引入，配合CookieConsent组件使用
 * 2. 配置.env.local文件的分析ID
 * 3. 使用window.voidixUnifiedAnalytics进行事件跟踪
 */
export const UnifiedAnalytics: React.FC<UnifiedAnalyticsProps> = ({
  enableGoogleAnalytics = true,
  enableDebug: propEnableDebug = false, // 重命名以区分内部变量
  disableInDev = true,
  delayMs = 3000,
  enableClarity = true,
  clarityProjectId = import.meta.env.VITE_CLARITY_PROJECT_ID || '',
}) => {
  console.log('[UnifiedAnalytics] 组件开始渲染');
  const isDevelopment = import.meta.env.DEV;
  const shouldDisable = isDevelopment && disableInDev;
  const [hasConsented, setHasConsented] = useState<boolean>(false);

  // 使用 propEnableDebug 作为最终的 enableDebug 状态
  const finalEnableDebug = propEnableDebug;

  useEffect(() => {
    if (shouldDisable) {
      setHasConsented(false);
      return;
    }
    const consent = localStorage.getItem('voidix-analytics-consent');
    setHasConsented(consent === 'true');

    if (finalEnableDebug) {
      console.log('[UnifiedAnalytics] 同意状态 (从LocalStorage): ', consent === 'true');
    }
  }, [shouldDisable, finalEnableDebug]);

  const finalHasConsented = hasConsented;

  if (shouldDisable && finalEnableDebug) {
    console.log('[UnifiedAnalytics] 开发环境已禁用所有分析功能');
  }

  // 初始化统一分析API
  useEffect(() => {
    // 如果被禁用或未获得同意，则不初始化API
    if (shouldDisable || !finalHasConsented) {
      // 如果禁用了，确保API不存在或为空
      if (window.voidixUnifiedAnalytics) {
        // @ts-ignore
        window.voidixUnifiedAnalytics = undefined;
      }
      if (finalEnableDebug) {
        console.log('[UnifiedAnalytics] API未初始化: shouldDisable 或 finalHasConsented 为 false');
      }
      return;
    }

    // Voidix统一分析API
    window.voidixUnifiedAnalytics = {
      trackBugReport: (reportType, severity) => {
        if (window.clarity) {
          window.clarity('event', 'bug_report', { reportType, severity });
        }
        if (finalEnableDebug) console.log('[统一分析] Bug报告跟踪:', { reportType, severity });
      },
      trackFAQView: (questionId, category) => {
        if (window.clarity) {
          window.clarity('event', 'faq_view', { questionId, category });
        }
        if (finalEnableDebug) console.log('[统一分析] FAQ查看跟踪:', { questionId, category });
      },
      trackCustomEvent: (category, action, label, value) => {
        if (window.clarity) {
          window.clarity('event', action, { category, label, value });
        }
        if (finalEnableDebug)
          console.log('[统一分析] 自定义事件跟踪:', { category, action, label, value });
      },
      trackPagePerformance: () => {
        if (window.clarity) {
          window.clarity('event', 'page_performance');
        }
        if (finalEnableDebug) console.log('[统一分析] 页面性能跟踪已执行');
      },
    };

    if (finalEnableDebug) {
      console.log('[UnifiedAnalytics] 统一分析API已初始化');
    }

    // 清理函数
    return () => {
      // @ts-ignore
      window.voidixUnifiedAnalytics = undefined;
    };
  }, [shouldDisable, finalEnableDebug, finalHasConsented]);

  if (finalEnableDebug) {
    console.log(
      '[UnifiedAnalytics] MicrosoftClarity render conditions: ',
      `shouldDisable: ${shouldDisable}`,
      `finalHasConsented: ${finalHasConsented}`,
      `enableClarity: ${enableClarity}`,
      `clarityProjectId: ${!!clarityProjectId}`,
      `Final condition for MicrosoftClarity: ${!shouldDisable && finalHasConsented && enableClarity && !!clarityProjectId}`
    );
  }

  return (
    <>
      {/* 超级无Cookie Google Analytics 4 */}
      {enableGoogleAnalytics && !shouldDisable && finalHasConsented && (
        <UltraCookielessGoogleAnalytics
          enableDebug={finalEnableDebug}
          disableInDev={disableInDev}
          delayMs={delayMs}
        />
      )}

      {/* Microsoft Clarity */}
      {enableClarity && !shouldDisable && finalHasConsented && clarityProjectId && (
        <MicrosoftClarity
          projectId={clarityProjectId}
          enableDebug={finalEnableDebug}
          hasConsented={finalHasConsented}
        />
      )}
    </>
  );
};

/**
 * 统一分析API类型声明
 */
declare global {
  interface Window {
    voidixUnifiedAnalytics: {
      trackBugReport: (reportType: string, severity: string) => void;
      trackFAQView: (questionId: string, category: string) => void;
      trackCustomEvent: (category: string, action: string, label: string, value?: number) => void;
      trackPagePerformance: () => void;
    };
    clarity?: (type: string, eventName: string, properties?: Record<string, any>) => void;
  }
}

export default UnifiedAnalytics;
