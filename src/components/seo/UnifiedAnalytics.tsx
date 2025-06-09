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
}

/**
 * Voidix统一分析组件
 * 集成Google Analytics 4，提供全面的网站分析功能
 *
 * 功能特性：
 * - Google Analytics 4: 用户分析和事件跟踪
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
}) => {
  const isDevelopment = import.meta.env.DEV;
  const shouldDisable = isDevelopment && disableInDev;

  if (shouldDisable && enableDebug) {
    console.log('[UnifiedAnalytics] 开发环境已禁用所有分析功能');
  }

  return (
    <>
      {/* 超级无Cookie Google Analytics 4（彻底解决第三方Cookie问题） */}
      {enableGoogleAnalytics && !shouldDisable && (
        <UltraCookielessGoogleAnalytics
          enableDebug={enableDebug}
          disableInDev={disableInDev}
          delayMs={delayMs}
        />
      )}

      {/* 统一分析API初始化 */}
      {!shouldDisable && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Voidix统一分析API
              window.voidixUnifiedAnalytics = {
                // 服务器状态跟踪
                trackServerStatus: function(serverName, playerCount, isOnline) {
                  // Google Analytics跟踪（新的超级无Cookie版本）
                  if (window.voidixUltraCookielessGA && window.voidixUltraCookielessGA.trackServerStatus) {
                    window.voidixUltraCookielessGA.trackServerStatus(serverName, playerCount, isOnline);
                  }
                  // 向后兼容API
                  if (window.voidixGoogleAnalytics && window.voidixGoogleAnalytics.trackServerStatus) {
                    window.voidixGoogleAnalytics.trackServerStatus(serverName, playerCount, isOnline);
                  }
                  
                  ${enableDebug ? `console.log('[统一分析] 服务器状态跟踪:', { serverName, playerCount, isOnline });` : ''}
                },
                
                // 用户加入服务器跟踪
                trackServerJoin: function(serverName, gameMode) {
                  // Google Analytics跟踪（新的超级无Cookie版本）
                  if (window.voidixUltraCookielessGA && window.voidixUltraCookielessGA.trackServerJoin) {
                    window.voidixUltraCookielessGA.trackServerJoin(serverName, gameMode);
                  }
                  // 向后兼容API
                  if (window.voidixGoogleAnalytics && window.voidixGoogleAnalytics.trackServerJoin) {
                    window.voidixGoogleAnalytics.trackServerJoin(serverName, gameMode);
                  }
                  
                  ${enableDebug ? `console.log('[统一分析] 服务器加入跟踪:', { serverName, gameMode });` : ''}
                },
                
                // Bug报告跟踪
                trackBugReport: function(reportType, severity) {
                  // Google Analytics跟踪（新的超级无Cookie版本）
                  if (window.voidixUltraCookielessGA && window.voidixUltraCookielessGA.trackBugReport) {
                    window.voidixUltraCookielessGA.trackBugReport(reportType, severity);
                  }
                  // 向后兼容API
                  if (window.voidixGoogleAnalytics && window.voidixGoogleAnalytics.trackBugReport) {
                    window.voidixGoogleAnalytics.trackBugReport(reportType, severity);
                  }
                  
                  ${enableDebug ? `console.log('[统一分析] Bug报告跟踪:', { reportType, severity });` : ''}
                },
                
                // FAQ查看跟踪
                trackFAQView: function(questionId, category) {
                  // Google Analytics跟踪（新的超级无Cookie版本）
                  if (window.voidixUltraCookielessGA && window.voidixUltraCookielessGA.trackFAQView) {
                    window.voidixUltraCookielessGA.trackFAQView(questionId, category);
                  }
                  // 向后兼容API
                  if (window.voidixGoogleAnalytics && window.voidixGoogleAnalytics.trackFaqInteraction) {
                    window.voidixGoogleAnalytics.trackFaqInteraction(questionId, 'view');
                  }
                  
                  ${enableDebug ? `console.log('[统一分析] FAQ查看跟踪:', { questionId, category });` : ''}
                },
                
                // 自定义事件跟踪
                trackCustomEvent: function(category, action, label, value) {
                  // Google Analytics跟踪（新的超级无Cookie版本）
                  if (window.voidixUltraCookielessGA && window.voidixUltraCookielessGA.trackCustomEvent) {
                    window.voidixUltraCookielessGA.trackCustomEvent(action, category, label, value);
                  }
                  // 向后兼容API
                  if (window.voidixGoogleAnalytics && window.voidixGoogleAnalytics.trackCustomEvent) {
                    window.voidixGoogleAnalytics.trackCustomEvent(action, category, label, value);
                  }
                  
                  ${enableDebug ? `console.log('[统一分析] 自定义事件跟踪:', { category, action, label, value });` : ''}
                },
                
                // 页面性能跟踪
                trackPagePerformance: function() {
                  // Google Analytics跟踪（新的超级无Cookie版本）
                  if (window.voidixUltraCookielessGA && window.voidixUltraCookielessGA.trackPagePerformance) {
                    window.voidixUltraCookielessGA.trackPagePerformance();
                  }
                  // 向后兼容API
                  if (window.voidixGoogleAnalytics && window.voidixGoogleAnalytics.trackPagePerformance) {
                    window.voidixGoogleAnalytics.trackPagePerformance();
                  }
                  
                  ${enableDebug ? `console.log('[统一分析] 页面性能跟踪已执行');` : ''}
                }
              };
              
              ${enableDebug ? `console.log('[UnifiedAnalytics] 统一分析API已初始化');` : ''}
            `,
          }}
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
  }
}

export default UnifiedAnalytics;
