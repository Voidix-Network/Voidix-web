import React, { useEffect } from 'react';

interface WebVitalsMonitorProps {
  enableGoogleAnalytics?: boolean;
  enableMicrosoftClarity?: boolean;
  enableConsoleLogging?: boolean;
  enableCustomReporting?: boolean;
  reportingEndpoint?: string;
}

/**
 * 增强的Web Vitals性能监控组件
 * 监控LCP、INP、CLS、FCP、TTFB等关键性能指标
 * 支持Google Analytics和Microsoft Clarity上报
 */
export const WebVitalsMonitor: React.FC<WebVitalsMonitorProps> = ({
  enableGoogleAnalytics = true,
  enableMicrosoftClarity = true,
  enableConsoleLogging = false,
  enableCustomReporting = false,
  reportingEndpoint,
}) => {
  useEffect(() => {
    // 动态导入 web-vitals 库
    const loadWebVitals = async () => {
      try {
        const webVitals = await import('web-vitals');
        const { onCLS, onINP, onFCP, onLCP, onTTFB } = webVitals;

        // 性能数据报告函数
        const reportVital = (metric: any) => {
          const vitalsData = {
            name: metric.name,
            value: metric.value,
            rating: metric.rating,
            delta: metric.delta,
            id: metric.id,
            timestamp: Date.now(),
            url: window.location.href,
            pathname: window.location.pathname,
            userAgent: navigator.userAgent,
          };

          // 控制台日志
          if (enableConsoleLogging) {
            console.log('[Web Vitals]', vitalsData);
          }

          // Google Analytics 报告
          if (enableGoogleAnalytics && window.gtag) {
            window.gtag('event', metric.name, {
              event_category: 'Web Vitals',
              event_label: metric.id,
              value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
              non_interaction: true,
              custom_parameter_1: metric.rating,
              custom_parameter_2: window.location.pathname,
            });
          }

          // Microsoft Clarity 报告
          if (enableMicrosoftClarity && window.voidixClarity) {
            window.voidixClarity.trackPerformance(
              metric.name,
              metric.value,
              metric.name === 'CLS' ? 'score' : 'ms'
            );

            // 额外的性能上下文
            window.voidixClarity.trackEvent('web_vital', {
              metric: metric.name,
              value: metric.value,
              rating: metric.rating,
              page: window.location.pathname,
              userAgent: navigator.userAgent.slice(0, 100), // 限制长度
            });
          }

          // 自定义端点报告
          if (enableCustomReporting && reportingEndpoint) {
            fetch(reportingEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(vitalsData),
            }).catch(error => {
              console.warn('[Web Vitals] 报告失败:', error);
            });
          }
        };

        // 监控所有核心性能指标
        onCLS(reportVital); // Cumulative Layout Shift
        onINP(reportVital); // Interaction to Next Paint
        onFCP(reportVital); // First Contentful Paint
        onLCP(reportVital); // Largest Contentful Paint
        onTTFB(reportVital); // Time to First Byte

        // Minecraft服务器特定性能监控
        const monitorMinecraftMetrics = () => {
          // 监控WebSocket连接性能
          if (window.performance && window.performance.getEntriesByType) {
            const resourceEntries = window.performance.getEntriesByType('resource');
            const websocketEntries = resourceEntries.filter(
              entry => entry.name.includes('websocket') || entry.name.includes('ws://')
            );

            websocketEntries.forEach(entry => {
              const connectionTime = Math.round(entry.duration);

              // GA4报告
              if (enableGoogleAnalytics && window.gtag) {
                window.gtag('event', 'websocket_performance', {
                  event_category: 'Minecraft Server',
                  event_label: 'connection_time',
                  value: connectionTime,
                  custom_parameter_1: entry.name,
                });
              }

              // Clarity报告
              if (enableMicrosoftClarity && window.voidixClarity) {
                window.voidixClarity.trackServerAction('websocket_connect', 'minecraft_server', {
                  duration: connectionTime,
                  url: entry.name,
                });
              }
            });
          }

          // 监控页面加载性能
          const navigation = performance.getEntriesByType(
            'navigation'
          )[0] as PerformanceNavigationTiming;
          if (navigation) {
            const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
            const domContentLoaded =
              navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;

            if (enableMicrosoftClarity && window.voidixClarity) {
              window.voidixClarity.trackPerformance('page_load_time', loadTime);
              window.voidixClarity.trackPerformance('dom_content_loaded', domContentLoaded);
            }
          }

          // 监控内存使用情况（如果可用）
          if ('memory' in performance) {
            const memory = (performance as any).memory;
            if (enableMicrosoftClarity && window.voidixClarity) {
              window.voidixClarity.trackPerformance('memory_used', memory.usedJSHeapSize, 'bytes');
              window.voidixClarity.trackPerformance(
                'memory_limit',
                memory.jsHeapSizeLimit,
                'bytes'
              );
            }
          }
        };

        // 延迟监控Minecraft特定指标
        setTimeout(monitorMinecraftMetrics, 3000);

        // 定期监控内存使用情况
        const monitorMemoryUsage = () => {
          if ('memory' in performance && enableMicrosoftClarity && window.voidixClarity) {
            const memory = (performance as any).memory;
            const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

            if (usagePercent > 80) {
              window.voidixClarity.trackEvent('high_memory_usage', {
                usage_percent: Math.round(usagePercent),
                used_heap: memory.usedJSHeapSize,
                heap_limit: memory.jsHeapSizeLimit,
              });
            }
          }
        };

        // 每30秒检查一次内存使用情况
        const memoryInterval = setInterval(monitorMemoryUsage, 30000);

        // 清理函数
        return () => {
          clearInterval(memoryInterval);
        };
      } catch (error) {
        console.warn('[Web Vitals] 加载web-vitals库失败:', error);

        // 如果web-vitals加载失败，仍然报告错误
        if (enableMicrosoftClarity && window.voidixClarity) {
          window.voidixClarity.trackError('library_load_error', 'Failed to load web-vitals', {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    };

    loadWebVitals();
  }, [
    enableGoogleAnalytics,
    enableMicrosoftClarity,
    enableConsoleLogging,
    enableCustomReporting,
    reportingEndpoint,
  ]);

  return null; // 这是一个纯逻辑组件，不渲染任何UI
};

export default WebVitalsMonitor;
