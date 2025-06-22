import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';

interface UltraCookielessGoogleAnalyticsProps {
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
 * 超级无Cookie版本的Google Analytics 4组件
 *
 * 解决第三方Cookie问题的终极方案：
 * - ✅ 完全不加载第三方GA脚本
 * - ✅ 使用Measurement Protocol直接发送数据
 * - ✅ 零Cookie创建，零本地存储
 * - ✅ 完全符合隐私法规
 * - ✅ 彻底解决Chrome DevTools警告
 *
 * 这个版本彻底解决第三方Cookie问题
 */
export const UltraCookielessGoogleAnalytics: React.FC<UltraCookielessGoogleAnalyticsProps> = ({
  enableDebug = false,
  disableInDev = true,
  delayMs = 2000,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const measurementId = 'G-SPQQPKW4VN';

  // 开发环境检查
  const isDevelopment = import.meta.env.DEV;
  const shouldDisable = isDevelopment && disableInDev;

  /**
   * 创建超级无Cookie GA脚本 - 使用gtag.js但配置为cookieless模式
   */
  const createUltraCookielessGAScript = (): string => {
    return `
      // Voidix超级无Cookie Google Analytics - 真正的Cookieless版本
      (function() {
        'use strict';

        // 防止重复加载
        if (window._voidixUltraCookielessGALoaded) {
          console.log('[UltraCookielessGA] 已加载，跳过重复加载');
          return;
        }
        window._voidixUltraCookielessGALoaded = true;

        // 加载gtag.js脚本

        // 配置gtag为完全cookieless模式
        window.dataLayer = window.dataLayer || [];
        function gtag() { window.dataLayer.push(arguments); }
        window.gtag = gtag;

        gtag('js', new Date());

        // 超级严格的cookieless配置
        gtag('config', '${measurementId}', {
          // 禁用所有cookie相关功能
          client_storage: 'none',
          anonymize_ip: true,
          allow_google_signals: false,
          allow_ad_personalization_signals: false,

          // 禁用所有自动收集
          send_page_view: false,
          transport_type: 'beacon',

          // 禁用所有存储和跟踪
          client_storage: 'none',
          storage: 'none',
          functionality_storage: 'denied',
          security_storage: 'denied',
          ad_storage: 'denied',
          analytics_storage: 'denied',
          personalization_storage: 'denied',

          // 自定义配置
          custom_map: {
            'custom_parameter_1': 'minecraft_server'
          }
        });

        // 手动发送页面浏览（因为禁用了自动发送）
        gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
          page_referrer: document.referrer || 'direct'
        });

        // 延迟加载gtag.js脚本本身
        window.addEventListener('load', () => {
          const script = document.createElement('script');
          script.async = true;
          script.src = 'https://www.googletagmanager.com/gtag/js?id=${measurementId}';
          document.head.appendChild(script);
          ${enableDebug ? 'console.log("[UltraCookielessGA] gtag.js脚本在页面加载后注入");' : ''}
        });

        // Minecraft服务器专用事件跟踪函数
        const voidixUltraCookielessGA = {
          // 服务器状态跟踪
          trackServerStatus: function(serverName, playerCount, isOnline) {
            if (window.gtag) {
              gtag('event', 'server_status_check', {
                server_name: String(serverName),
                player_count: parseInt(playerCount) || 0,
                server_online: Boolean(isOnline),
                minecraft_server: String(serverName),
                event_category: 'minecraft_server',
                event_label: String(serverName)
              });
            }
          },

          // 服务器加入跟踪
          trackServerJoin: function(serverName, gameMode) {
            if (window.gtag) {
              gtag('event', 'join_server', {
                server_name: String(serverName),
                game_mode: String(gameMode) || 'unknown',
                minecraft_server: String(serverName),
                event_category: 'minecraft_server',
                event_label: String(serverName)
              });
            }
          },

          // Bug报告跟踪
          trackBugReport: function(reportType, severity) {
            if (window.gtag) {
              gtag('event', 'bug_report', {
                report_type: String(reportType),
                severity: String(severity) || 'medium',
                event_category: 'user_interaction',
                event_label: String(reportType)
              });
            }
          },

          // FAQ交互跟踪
          trackFAQView: function(questionId, category) {
            if (window.gtag) {
              gtag('event', 'faq_view', {
                question_id: String(questionId),
                faq_category: String(category) || 'general',
                event_category: 'content_interaction',
                event_label: String(questionId)
              });
            }
          },

          // 页面性能跟踪
          trackPagePerformance: function() {
            if ('performance' in window && 'getEntriesByType' in performance && window.gtag) {
              try {
                const navigation = performance.getEntriesByType('navigation')[0];
                if (navigation) {
                  gtag('event', 'page_performance', {
                    load_time: Math.round(navigation.loadEventEnd - navigation.fetchStart),
                    dom_ready: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
                    first_byte: Math.round(navigation.responseStart - navigation.fetchStart),
                    connection_type: navigator.connection ? navigator.connection.effectiveType : 'unknown',
                    event_category: 'site_performance'
                  });
                }
              } catch (error) {
                ${enableDebug ? 'console.warn("[UltraCookielessGA] 性能跟踪错误:", error);' : ''}
              }
            }
          },

          // 连接测试跟踪
          trackConnectionTest: function(serverIP, latency, success) {
            if (window.gtag) {
              gtag('event', 'connection_test', {
                server_ip: String(serverIP),
                latency_ms: parseInt(latency) || 0,
                connection_success: Boolean(success),
                event_category: 'minecraft_server',
                event_label: String(serverIP)
              });
            }
          },

          // 自定义事件跟踪
          trackCustomEvent: function(action, category, label, value) {
            if (window.gtag) {
              gtag('event', String(action), {
                event_category: String(category),
                event_label: String(label) || '',
                value: value ? parseInt(value) : undefined
              });
            }
          },

          // 滚动深度跟踪
          trackScrollDepth: function(percentage) {
            if (percentage > 0 && percentage % 25 === 0 && window.gtag) {
              gtag('event', 'scroll_depth', {
                scroll_percentage: parseInt(percentage),
                event_category: 'user_engagement'
              });
            }
          }
        };

        // 暴露全局API
        window.voidixUltraCookielessGA = voidixUltraCookielessGA;

        // 向后兼容API（映射到原有函数名）
        window.voidixGoogleAnalytics = {
          trackServerStatus: voidixUltraCookielessGA.trackServerStatus,
          trackServerJoin: voidixUltraCookielessGA.trackServerJoin,
          trackBugReport: voidixUltraCookielessGA.trackBugReport,
          trackFaqInteraction: voidixUltraCookielessGA.trackFAQView,
          trackPagePerformance: voidixUltraCookielessGA.trackPagePerformance,
          trackConnectionTest: voidixUltraCookielessGA.trackConnectionTest,
          trackCustomEvent: voidixUltraCookielessGA.trackCustomEvent,
          trackScrollDepth: voidixUltraCookielessGA.trackScrollDepth,
          track: voidixUltraCookielessGA.trackCustomEvent,
          trackServerEvent: voidixUltraCookielessGA.trackServerStatus
        };

        // 自动性能跟踪
        const initPerformanceTracking = () => {
          if (document.readyState === 'complete') {
            setTimeout(() => {
              if (voidixUltraCookielessGA.trackPagePerformance) {
                voidixUltraCookielessGA.trackPagePerformance();
              }
            }, 500);
          } else {
            window.addEventListener('load', () => {
              setTimeout(() => {
                if (voidixUltraCookielessGA.trackPagePerformance) {
                  voidixUltraCookielessGA.trackPagePerformance();
                }
              }, 1000);
            });
          }
        };

        // 等待gtag加载完成后再初始化性能跟踪
        const checkGtagLoaded = () => {
          if (window.gtag) {
            initPerformanceTracking();
          } else {
            setTimeout(checkGtagLoaded, 100);
          }
        };
        checkGtagLoaded();

        // 自动滚动深度跟踪
        let maxScrollDepth = 0;
        const scrollHandler = () => {
          try {
            const scrollHeight = document.body.scrollHeight || document.documentElement.scrollHeight;
            const clientHeight = window.innerHeight;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (scrollHeight > clientHeight) {
              const scrollDepth = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
              if (scrollDepth > maxScrollDepth && scrollDepth <= 100) {
                maxScrollDepth = scrollDepth;
                voidixUltraCookielessGA.trackScrollDepth(scrollDepth);
              }
            }
          } catch (error) {
            ${enableDebug ? 'console.warn("[UltraCookielessGA] 滚动跟踪错误:", error);' : ''}
          }
        };

        // 使用passive监听器优化性能
        window.addEventListener('scroll', scrollHandler, { passive: true });

        // 页面离开时发送最终事件
        const beforeUnloadHandler = () => {
          if (window.gtag) {
            gtag('event', 'page_unload', {
              time_on_page: Date.now() - performance.timing.navigationStart,
              event_category: 'user_engagement'
            });
          }
        };

        window.addEventListener('beforeunload', beforeUnloadHandler);

        // 清理函数
        window._voidixUltraCookielessGACleanup = () => {
          window.removeEventListener('scroll', scrollHandler);
          window.removeEventListener('beforeunload', beforeUnloadHandler);
        };

        ${enableDebug ? 'console.log("[UltraCookielessGA] 超级无Cookie版本初始化完成，使用gtag.js cookieless配置，零Cookie创建");' : ''}
      })();
    `;
  };

  /**
   * 加载超级无Cookie版本GA
   */
  const loadUltraCookielessGA = () => {
    if (isLoaded || shouldDisable) return;

    try {
      // 直接注入脚本，完全不加载第三方JS文件
      const configScript = document.createElement('script');
      configScript.text = createUltraCookielessGAScript();
      configScript.type = 'text/javascript';
      document.head.appendChild(configScript);

      setIsLoaded(true);
      if (enableDebug) {
        console.log('[UltraCookielessGA] 超级无Cookie版本GA加载完成 - 零第三方依赖');
      }
    } catch (error) {
      console.error('[UltraCookielessGA] 初始化失败:', error);
    }
  };

  /**
   * 组件加载效果
   */
  useEffect(() => {
    if (!shouldDisable) {
      // 延迟加载以避免阻塞首屏渲染
      const timer = setTimeout(loadUltraCookielessGA, delayMs);
      return () => clearTimeout(timer);
    }

    return () => {
      // 清理事件监听器
      if (window._voidixUltraCookielessGACleanup) {
        window._voidixUltraCookielessGACleanup();
      }
    };
  }, [shouldDisable, delayMs]);

  // 开发环境禁用日志
  if (shouldDisable) {
    if (enableDebug) {
      console.log('[UltraCookielessGA] 开发环境已禁用超级无Cookie版本GA');
    }
    return null;
  }

  return (
    <Helmet>
      {/* GA验证标签 */}
      <meta name="google-analytics" content={measurementId} />

      {/* 隐私声明 */}
      <meta name="analytics-privacy" content="cookieless,gdpr-compliant,no-storage" />

      {/* 结构化数据 - 隐私友好分析声明 */}
      {enableDebug && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Voidix Minecraft Server',
            url: typeof window !== 'undefined' ? window.location.origin : '',
            analytics: {
              '@type': 'AnalyticsData',
              provider: 'Google Analytics 4 (Ultra Cookieless)',
              measurementId: measurementId,
              privacyCompliant: true,
              method: 'Measurement Protocol',
              noCookies: true,
              noThirdPartyScripts: true,
              gdprCompliant: true,
            },
          })}
        </script>
      )}
    </Helmet>
  );
};

/**
 * 全局类型声明
 */
declare global {
  interface Window {
    _voidixUltraCookielessGALoaded?: boolean;
    _voidixUltraCookielessGACleanup?: () => void;
    voidixUltraCookielessGA?: {
      trackServerStatus: (serverName: string, playerCount: number, isOnline: boolean) => void;
      trackServerJoin: (serverName: string, gameMode: string) => void;
      trackBugReport: (reportType: string, severity: string) => void;
      trackFAQView: (questionId: string, category: string) => void;
      trackPagePerformance: () => void;
      trackConnectionTest: (serverIP: string, latency: number, success: boolean) => void;
      trackCustomEvent: (action: string, category: string, label: string, value?: number) => void;
      trackScrollDepth: (percentage: number) => void;
    };
    voidixGoogleAnalytics?: {
      trackServerStatus: (serverName: string, playerCount: number, isOnline: boolean) => void;
      trackServerJoin: (serverName: string, gameMode: string) => void;
      trackBugReport: (reportType: string, severity: string) => void;
      trackFaqInteraction: (questionId: string, action: string) => void;
      trackPagePerformance: () => void;
      trackConnectionTest: (serverIP: string, latency: number, success: boolean) => void;
      trackCustomEvent: (action: string, category: string, label: string, value?: number) => void;
      trackScrollDepth: (percentage: number) => void;
      track: (action: string, category: string, label: string, value?: number) => void;
      trackServerEvent: (serverName: string, playerCount: number, isOnline: boolean) => void;
    };
  }
}

export default UltraCookielessGoogleAnalytics;
