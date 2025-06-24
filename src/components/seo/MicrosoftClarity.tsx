import React, { useEffect } from 'react';

interface MicrosoftClarityProps {
  projectId: string;
  enableDebug?: boolean;
  hasConsented?: boolean;
}

/**
 * 增强的Microsoft Clarity组件
 * 提供完整的用户行为分析和事件跟踪
 */
const MicrosoftClarity: React.FC<MicrosoftClarityProps> = ({
  projectId,
  enableDebug = false,
  hasConsented = false,
}) => {
  useEffect(() => {
    if (!projectId || !hasConsented) {
      if (enableDebug) {
        console.log('[MicrosoftClarity] 未初始化: 缺少projectId或未获得用户同意');
      }
      return;
    }

    if (enableDebug) {
      console.log(`[MicrosoftClarity] 初始化 Project ID: ${projectId}`);
    }

    const scriptId = 'microsoft-clarity-script';
    if (document.getElementById(scriptId)) {
      if (enableDebug) {
        console.log('[MicrosoftClarity] 脚本已存在，跳过重复初始化');
      }
      return;
    }

    // 加载Microsoft Clarity
    (function (c: any, l: any, a: any, r: any, i: any) {
      c[a] =
        c[a] ||
        function () {
          (c[a].q = c[a].q || []).push(arguments);
        };
      const t = l.createElement(r);
      t.async = 1;
      t.src = 'https://www.clarity.ms/tag/' + i;
      t.id = scriptId;
      const y = l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', projectId);

    // 初始化增强的Clarity API
    const initializeClarityAPI = () => {
      if (!window.clarity) {
        setTimeout(initializeClarityAPI, 100);
        return;
      }

      // 扩展的全局Clarity API
      window.voidixClarity = {
        // 基础事件跟踪
        trackEvent: (eventName: string, properties?: Record<string, any>) => {
          if (window.clarity) {
            window.clarity('event', eventName, properties);
            if (enableDebug) console.log('[Clarity] 事件跟踪:', eventName, properties);
          }
        },

        // 用户标识
        identify: (userId: string, traits?: Record<string, any>) => {
          if (window.clarity) {
            window.clarity('identify', userId, traits);
            if (enableDebug) console.log('[Clarity] 用户标识:', userId, traits);
          }
        },

        // 页面浏览跟踪
        trackPageView: (pageName: string, properties?: Record<string, any>) => {
          if (window.clarity) {
            window.clarity('event', 'page_view', { page: pageName, ...properties });
            if (enableDebug) console.log('[Clarity] 页面浏览:', pageName, properties);
          }
        },

        // Minecraft服务器特定事件
        trackServerAction: (action: string, serverName?: string, details?: Record<string, any>) => {
          if (window.clarity) {
            window.clarity('event', 'server_action', {
              action,
              server: serverName,
              ...details,
            });
            if (enableDebug) console.log('[Clarity] 服务器动作:', { action, serverName, details });
          }
        },

        // 错误跟踪
        trackError: (errorType: string, errorMessage: string, context?: Record<string, any>) => {
          if (window.clarity) {
            window.clarity('event', 'error', {
              type: errorType,
              message: errorMessage,
              ...context,
            });
            if (enableDebug)
              console.log('[Clarity] 错误跟踪:', { errorType, errorMessage, context });
          }
        },

        // 性能指标跟踪
        trackPerformance: (metricName: string, value: number, unit?: string) => {
          if (window.clarity) {
            window.clarity('event', 'performance', {
              metric: metricName,
              value,
              unit: unit || 'ms',
              timestamp: Date.now(),
            });
            if (enableDebug) console.log('[Clarity] 性能跟踪:', { metricName, value, unit });
          }
        },

        // 用户交互跟踪
        trackInteraction: (element: string, action: string, context?: Record<string, any>) => {
          if (window.clarity) {
            window.clarity('event', 'interaction', {
              element,
              action,
              ...context,
            });
            if (enableDebug) console.log('[Clarity] 交互跟踪:', { element, action, context });
          }
        },

        // 设置用户属性
        setUserProperty: (key: string, value: any) => {
          if (window.clarity) {
            window.clarity('set', key, value);
            if (enableDebug) console.log('[Clarity] 用户属性:', { key, value });
          }
        },
      };

      if (enableDebug) {
        console.log('[MicrosoftClarity] 增强API已初始化');
        window.clarity('event', 'debug_mode_enabled', { enabled: true });
      }
    };

    // 延迟初始化API
    setTimeout(initializeClarityAPI, 1000);

    return () => {
      const scriptElement = document.getElementById(scriptId);
      if (scriptElement) {
        scriptElement.remove();
      }
      // @ts-ignore
      window.voidixClarity = undefined;
    };
  }, [projectId, enableDebug, hasConsented]);

  return null;
};

// 类型声明
declare global {
  interface Window {
    clarity?: (type: string, ...args: any[]) => void;
    voidixClarity?: {
      trackEvent: (eventName: string, properties?: Record<string, any>) => void;
      identify: (userId: string, traits?: Record<string, any>) => void;
      trackPageView: (pageName: string, properties?: Record<string, any>) => void;
      trackServerAction: (
        action: string,
        serverName?: string,
        details?: Record<string, any>
      ) => void;
      trackError: (errorType: string, errorMessage: string, context?: Record<string, any>) => void;
      trackPerformance: (metricName: string, value: number, unit?: string) => void;
      trackInteraction: (element: string, action: string, context?: Record<string, any>) => void;
      setUserProperty: (key: string, value: any) => void;
    };
  }
}

export default MicrosoftClarity;
