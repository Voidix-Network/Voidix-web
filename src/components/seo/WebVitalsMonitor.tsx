import React, { useEffect } from 'react';

interface WebVitalsMonitorProps {
  enableGoogleAnalytics?: boolean;
  enableConsoleLogging?: boolean;
  enableCustomReporting?: boolean;
  reportingEndpoint?: string;
}

/**
 * Web Vitals 核心性能指标监控组件
 * 监控 LCP、FID、CLS、FCP、TTFB 等关键性能指标
 */
export const WebVitalsMonitor: React.FC<WebVitalsMonitorProps> = ({
  enableGoogleAnalytics = true,
  enableConsoleLogging = false,
  enableCustomReporting = false,
  reportingEndpoint,
}) => {
  useEffect(() => {
    // 动态导入 web-vitals 库
    const loadWebVitals = async () => {
      try {
        const webVitals = await import('web-vitals');
        // 使用 web-vitals v5 API: onCLS, onINP(替代FID), onFCP, onLCP, onTTFB
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
            userAgent: navigator.userAgent,
          };

          // 控制台日志
          if (enableConsoleLogging) {
            console.log('Web Vital:', vitalsData);
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

          // 自定义端点报告
          if (enableCustomReporting && reportingEndpoint) {
            fetch(reportingEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(vitalsData),
            }).catch(error => {
              console.warn('Failed to report Web Vital:', error);
            });
          }
        };

        // 监控所有核心性能指标
        onCLS(reportVital); // Cumulative Layout Shift
        onINP(reportVital); // Interaction to Next Paint (替代FID)
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
              if (enableGoogleAnalytics && window.gtag) {
                window.gtag('event', 'websocket_performance', {
                  event_category: 'Minecraft Server',
                  event_label: 'connection_time',
                  value: Math.round(entry.duration),
                  custom_parameter_1: entry.name,
                });
              }
            });
          }
        };

        // 延迟监控Minecraft特定指标
        setTimeout(monitorMinecraftMetrics, 3000);
      } catch (error) {
        console.warn('Failed to load web-vitals library:', error);
      }
    };

    loadWebVitals();
  }, [enableGoogleAnalytics, enableConsoleLogging, enableCustomReporting, reportingEndpoint]);

  return null; // 这是一个纯逻辑组件，不渲染任何UI
};

export default WebVitalsMonitor;
