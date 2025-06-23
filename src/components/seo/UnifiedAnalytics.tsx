import Clarity from '@microsoft/clarity';
import React from 'react';
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
  /**
   * 用户是否已同意分析跟踪
   */
  hasConsented?: boolean;
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
  enableDebug = false,
  disableInDev = true,
  delayMs = 3000,
  enableClarity = true,
  clarityProjectId = import.meta.env.VITE_CLARITY_PROJECT_ID || '',
  hasConsented = false, // 默认值为 false
}) => {
  const isDevelopment = import.meta.env.DEV;
  const shouldDisable = isDevelopment && disableInDev;

  if (shouldDisable && enableDebug) {
    console.log('[UnifiedAnalytics] 开发环境已禁用所有分析功能');
  }

  // 初始化Microsoft Clarity
  React.useEffect(() => {
    // 只有在获得用户同意后才初始化
    if (enableClarity && clarityProjectId && !shouldDisable && hasConsented) {
      const timer = setTimeout(() => {
        Clarity.init(clarityProjectId);
        if (enableDebug) {
          console.log(`[UnifiedAnalytics] Microsoft Clarity已初始化，项目ID: ${clarityProjectId}`);
        }
      }, delayMs);
      return () => clearTimeout(timer);
    }
  }, [enableClarity, clarityProjectId, shouldDisable, delayMs, enableDebug, hasConsented]);

  // 初始化统一分析API
  React.useEffect(() => {
    // 如果被禁用或未获得同意，则不初始化API
    if (shouldDisable || !hasConsented) {
      // 如果禁用了，确保API不存在或为空
      if (window.voidixUnifiedAnalytics) {
        // @ts-ignore
        window.voidixUnifiedAnalytics = undefined;
      }
      return;
    }

    // Voidix统一分析API
    window.voidixUnifiedAnalytics = {
      trackServerStatus: (serverName, playerCount, isOnline) => {
        if (window.clarity) {
          window.clarity('event', 'server_status', { serverName, playerCount, isOnline });
        }
        if (enableDebug)
          console.log('[统一分析] 服务器状态跟踪:', { serverName, playerCount, isOnline });
      },
      trackServerJoin: (serverName, gameMode) => {
        if (window.clarity) {
          window.clarity('event', 'server_join', { serverName, gameMode });
        }
        if (enableDebug) console.log('[统一分析] 服务器加入跟踪:', { serverName, gameMode });
      },
      trackBugReport: (reportType, severity) => {
        if (window.clarity) {
          window.clarity('event', 'bug_report', { reportType, severity });
        }
        if (enableDebug) console.log('[统一分析] Bug报告跟踪:', { reportType, severity });
      },
      trackFAQView: (questionId, category) => {
        if (window.clarity) {
          window.clarity('event', 'faq_view', { questionId, category });
        }
        if (enableDebug) console.log('[统一分析] FAQ查看跟踪:', { questionId, category });
      },
      trackCustomEvent: (category, action, label, value) => {
        if (window.clarity) {
          window.clarity('event', action, { category, label, value });
        }
        if (enableDebug)
          console.log('[统一分析] 自定义事件跟踪:', { category, action, label, value });
      },
      trackPagePerformance: () => {
        if (window.clarity) {
          window.clarity('event', 'page_performance');
        }
        if (enableDebug) console.log('[统一分析] 页面性能跟踪已执行');
      },
    };

    if (enableDebug) {
      console.log('[UnifiedAnalytics] 统一分析API已初始化');
    }

    // 清理函数
    return () => {
      // @ts-ignore
      window.voidixUnifiedAnalytics = undefined;
    };
  }, [shouldDisable, enableDebug, hasConsented]);

  return (
    <>
      {/* 超级无Cookie Google Analytics 4 */}
      {enableGoogleAnalytics && !shouldDisable && hasConsented && (
        <UltraCookielessGoogleAnalytics
          enableDebug={enableDebug}
          disableInDev={disableInDev}
          delayMs={delayMs}
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
      trackServerStatus: (serverName: string, playerCount: number, isOnline: boolean) => void;
      trackServerJoin: (serverName: string, gameMode: string) => void;
      trackBugReport: (reportType: string, severity: string) => void;
      trackFAQView: (questionId: string, category: string) => void;
      trackCustomEvent: (category: string, action: string, label: string, value?: number) => void;
      trackPagePerformance: () => void;
    };
    clarity?: (type: string, eventName: string, properties?: Record<string, any>) => void;
  }
}

export default UnifiedAnalytics;
