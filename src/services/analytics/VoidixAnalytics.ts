/**
 * Voidix统一分析系统
 * 整合Google Analytics 4 和 Microsoft Clarity
 * 提供标准化的事件追踪接口
 */

export interface AnalyticsConfig {
  googleAnalytics: {
    measurementId: string;
    enabled: boolean;
    debugMode: boolean;
  };
  microsoftClarity: {
    projectId: string;
    enabled: boolean;
  };
  baiduAnalytics: {
    hmId: string;
    enabled: boolean;
  };
  privacy: {
    requireConsent: boolean;
    cookielessMode: boolean;
  };
  performance: {
    scriptDelay: number;
    enableRetry: boolean;
    maxRetries: number;
  };
}

export interface ConsentSettings {
  analytics: boolean;
  performance: boolean;
  marketing: boolean;
}

export interface TrackingEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  customProperties?: Record<string, any>;
}

export interface Logger {
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, error?: any): void;
}

class VoidixAnalytics {
  private static instance: VoidixAnalytics;
  private config: AnalyticsConfig | null = null;
  private isInitialized = false;
  private logger: Logger;
  private consentStatus: ConsentSettings = {
    analytics: false,
    performance: false,
    marketing: false,
  };
  private scriptLoadPromises: Map<string, Promise<void>> = new Map();
  private eventQueue: TrackingEvent[] = [];

  private constructor() {
    this.logger = this.createLogger();
  }

  /**
   * 获取VoidixAnalytics单例实例
   */
  public static getInstance(): VoidixAnalytics {
    if (!VoidixAnalytics.instance) {
      VoidixAnalytics.instance = new VoidixAnalytics();
    }
    return VoidixAnalytics.instance;
  }

  /**
   * 初始化分析系统
   */
  public async init(config: AnalyticsConfig): Promise<void> {
    try {
      this.config = config;
      this.logger.info('[VoidixAnalytics] 初始化分析系统', { config });

      // 预加载关键资源
      this.preloadCriticalResources();

      // 检查用户同意状态
      this.loadConsentFromStorage();

      if (config.privacy.requireConsent && !this.hasValidConsent()) {
        this.logger.info('[VoidixAnalytics] 等待用户同意');
        return;
      }

      await this.initializeAnalyticsServices();
      this.isInitialized = true;

      // 处理队列中的事件
      this.processEventQueue();

      this.logger.info('[VoidixAnalytics] 初始化完成');
    } catch (error) {
      this.logger.error('[VoidixAnalytics] 初始化失败', error);
      throw error;
    }
  }

  /**
   * 设置用户同意状态
   */
  public setConsent(consent: ConsentSettings): void {
    this.consentStatus = { ...consent };
    this.saveConsentToStorage();

    this.logger.info('[VoidixAnalytics] 更新同意状态', consent);

    // 如果之前未初始化且现在有了同意，则初始化服务
    if (!this.isInitialized && this.config && this.hasValidConsent()) {
      this.initializeAnalyticsServices().then(() => {
        this.isInitialized = true;
        this.processEventQueue();
      });
    }

    // 通知第三方服务更新同意状态
    this.updateThirdPartyConsent();
  }

  /**
   * 追踪自定义事件
   */
  public track(event: string, properties?: Record<string, any>): void {
    const trackingEvent: TrackingEvent = {
      category: 'custom',
      action: event,
      customProperties: properties,
    };

    if (!this.isInitialized || !this.hasValidConsent()) {
      this.eventQueue.push(trackingEvent);
      this.logger.debug('[VoidixAnalytics] 事件已加入队列', trackingEvent);
      return;
    }

    this.executeTracking(trackingEvent);
  }

  /**
   * 追踪页面浏览
   */
  public page(name?: string, properties?: Record<string, any>): void {
    const pageEvent: TrackingEvent = {
      category: 'page',
      action: 'view',
      label: name || window.location.pathname,
      customProperties: {
        ...properties,
        url: window.location.href,
        referrer: document.referrer,
        timestamp: Date.now(),
      },
    };

    if (!this.isInitialized || !this.hasValidConsent()) {
      this.eventQueue.push(pageEvent);
      return;
    }

    this.executeTracking(pageEvent);
  }

  /**
   * 追踪用户标识
   */
  public identify(userId: string, traits?: Record<string, any>): void {
    if (!this.isInitialized || !this.hasValidConsent()) {
      this.logger.debug('[VoidixAnalytics] 用户标识追踪被跳过');
      return;
    }

    this.logger.debug('[VoidixAnalytics] 追踪用户标识', { userId, traits });

    // Google Analytics 用户ID设置
    if (this.config?.googleAnalytics.enabled && window.gtag) {
      window.gtag('config', this.config.googleAnalytics.measurementId, {
        user_id: userId,
        custom_map: traits,
      });
    }

    // Microsoft Clarity 用户标识
    if (this.config?.microsoftClarity.enabled && (window as any).clarity) {
      (window as any).clarity('identify', userId, traits);
    }
  }

  /**
   * 追踪Bug报告
   */
  public trackBugReport(reportType: string, severity: string): void {
    this.track('bug_report', {
      reportType,
      severity,
      timestamp: Date.now(),
    });
  }

  /**
   * 追踪FAQ查看
   */
  public trackFAQView(questionId: string, category: string): void {
    this.track('faq_view', {
      questionId,
      category,
      timestamp: Date.now(),
    });
  }

  /**
   * 追踪自定义事件（向后兼容）
   */
  public trackCustomEvent(category: string, action: string, label?: string, value?: number): void {
    this.track(action, {
      category,
      label,
      value,
    });
  }

  /**
   * 追踪页面性能
   */
  public trackPagePerformance(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      if (navigation) {
        this.track('page_performance', {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded:
            navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstContentfulPaint: this.getFirstContentfulPaint(),
          largestContentfulPaint: this.getLargestContentfulPaint(),
        });
      }
    }
  }

  /**
   * 获取分析状态
   */
  public getStatus(): {
    initialized: boolean;
    consent: ConsentSettings;
    services: { ga4: boolean; clarity: boolean };
  } {
    return {
      initialized: this.isInitialized,
      consent: this.consentStatus,
      services: {
        ga4: Boolean(
          this.config?.googleAnalytics.enabled && typeof window !== 'undefined' && 'gtag' in window
        ),
        clarity: Boolean(
          this.config?.microsoftClarity.enabled &&
            typeof window !== 'undefined' &&
            'clarity' in window
        ),
      },
    };
  }

  /**
   * 清理资源
   */
  public destroy(): void {
    this.eventQueue = [];
    this.scriptLoadPromises.clear();
    this.isInitialized = false;
    this.logger.info('[VoidixAnalytics] 资源已清理');
  }

  // ==================== 私有方法 ====================

  private createLogger(): Logger {
    const isDev = import.meta.env.DEV;
    const enableDebug = isDev || this.config?.googleAnalytics.debugMode;

    return {
      debug: (message: string, data?: any) => {
        if (enableDebug) console.debug(message, data);
      },
      info: (message: string, data?: any) => {
        if (enableDebug) console.info(message, data);
      },
      warn: (message: string, data?: any) => {
        console.warn(message, data);
      },
      error: (message: string, error?: any) => {
        console.error(message, error);
      },
    };
  }

  private loadConsentFromStorage(): void {
    try {
      const consentString = localStorage.getItem('voidix-analytics-consent');
      if (consentString === 'true') {
        this.consentStatus = {
          analytics: true,
          performance: true,
          marketing: false,
        };
      } else if (consentString === 'false') {
        this.consentStatus = {
          analytics: false,
          performance: false,
          marketing: false,
        };
      }
    } catch (error) {
      this.logger.warn('[VoidixAnalytics] 无法读取同意状态', error);
    }
  }

  private saveConsentToStorage(): void {
    try {
      const consentValue = this.consentStatus.analytics ? 'true' : 'false';
      localStorage.setItem('voidix-analytics-consent', consentValue);
    } catch (error) {
      this.logger.warn('[VoidixAnalytics] 无法保存同意状态', error);
    }
  }

  private hasValidConsent(): boolean {
    return this.consentStatus.analytics || this.consentStatus.performance;
  }

  private async initializeAnalyticsServices(): Promise<void> {
    const promises = [];
    if (this.config?.googleAnalytics.enabled) {
      promises.push(this.initializeGoogleAnalytics());
    }
    if (this.config?.microsoftClarity.enabled) {
      promises.push(this.initializeMicrosoftClarity());
    }
    if (this.config?.baiduAnalytics.enabled) {
      promises.push(this.initializeBaiduAnalytics());
    }
    await Promise.allSettled(promises);
  }

  private async initializeGoogleAnalytics(): Promise<void> {
    if (!this.config?.googleAnalytics.measurementId) {
      throw new Error('Google Analytics Measurement ID 未配置');
    }

    const measurementId = this.config.googleAnalytics.measurementId;
    const scriptId = `ga-script-${measurementId}`;

    if (this.scriptLoadPromises.has(scriptId)) {
      return this.scriptLoadPromises.get(scriptId)!;
    }

    const loadPromise = this.retryOperation(
      () => this.loadGoogleAnalyticsScript(measurementId, scriptId),
      this.config?.performance.maxRetries || 3,
      'Google Analytics'
    );

    this.scriptLoadPromises.set(scriptId, loadPromise);
    return loadPromise;
  }

  private async loadGoogleAnalyticsScript(measurementId: string, scriptId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // 设置延迟加载
      setTimeout(() => {
        try {
          // 初始化 dataLayer
          window.dataLayer = window.dataLayer || [];
          window.gtag = function () {
            window.dataLayer.push(arguments);
          };

          // 创建并加载脚本
          const script = document.createElement('script');
          script.async = true;
          script.defer = true;
          script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
          script.id = scriptId;

          // 设置超时机制
          const timeoutId = setTimeout(() => {
            script.remove();
            reject(new Error('Google Analytics 脚本加载超时'));
          }, 10000); // 10秒超时

          script.onload = () => {
            clearTimeout(timeoutId);

            window.gtag('js', new Date());
            window.gtag('config', measurementId, {
              client_storage: this.config?.privacy.cookielessMode ? 'none' : 'enabled',
              anonymize_ip: true,
              allow_google_signals: false,
              send_page_view: true,
              // 性能优化配置
              transport_type: 'beacon',
              custom_map: {
                custom_dimension_1: 'page_type',
                custom_dimension_2: 'user_consent_status',
              },
            });

            this.logger.info('[VoidixAnalytics] Google Analytics 初始化完成');
            resolve();
          };

          script.onerror = () => {
            clearTimeout(timeoutId);
            script.remove();
            const error = new Error('Google Analytics 脚本加载失败');
            this.logger.error('[VoidixAnalytics] Google Analytics 初始化失败', error);
            reject(error);
          };

          document.head.appendChild(script);
        } catch (error) {
          reject(error);
        }
      }, this.config?.performance.scriptDelay || 3000);
    });
  }

  private async initializeMicrosoftClarity(): Promise<void> {
    if (!this.config?.microsoftClarity.projectId) {
      throw new Error('Microsoft Clarity Project ID 未配置');
    }

    const projectId = this.config.microsoftClarity.projectId;
    const scriptId = `clarity-script-${projectId}`;

    if (this.scriptLoadPromises.has(scriptId)) {
      return this.scriptLoadPromises.get(scriptId)!;
    }

    const loadPromise = this.retryOperation(
      () => this.loadMicrosoftClarityScript(projectId, scriptId),
      this.config?.performance.maxRetries || 3,
      'Microsoft Clarity'
    );

    this.scriptLoadPromises.set(scriptId, loadPromise);
    return loadPromise;
  }

  private async loadMicrosoftClarityScript(projectId: string, scriptId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // 延迟加载 - Clarity 比 GA 晚1秒加载以避免竞争
      setTimeout(
        () => {
          try {
            const self = this;
            const timeoutId = setTimeout(() => {
              reject(new Error('Microsoft Clarity 脚本加载超时'));
            }, 10000); // 10秒超时

            (function (c: any, l: any, a: any, r: any, i: any, t: any, y: any) {
              c[a] =
                c[a] ||
                function () {
                  (c[a].q = c[a].q || []).push(arguments);
                };
              t = l.createElement(r);
              t.async = 1;
              t.defer = 1;
              t.src = 'https://www.clarity.ms/tag/' + i;
              t.id = scriptId;
              y = l.getElementsByTagName(r)[0];

              t.onload = () => {
                clearTimeout(timeoutId);
                self.logger.info('[VoidixAnalytics] Microsoft Clarity 初始化完成');

                // 设置Clarity配置
                if ((window as any).clarity) {
                  (window as any).clarity('set', {
                    track_history_changes: true,
                    capture_keystrokes: false, // 隐私保护
                    capture_pointer_events: true,
                  });
                }

                resolve();
              };

              t.onerror = () => {
                clearTimeout(timeoutId);
                t.remove();
                const error = new Error('Microsoft Clarity 脚本加载失败');
                self.logger.error('[VoidixAnalytics] Microsoft Clarity 初始化失败', error);
                reject(error);
              };

              y.parentNode.insertBefore(t, y);
            })(window, document, 'clarity', 'script', projectId, null, null);
          } catch (error) {
            reject(error);
          }
        },
        (this.config?.performance.scriptDelay || 3000) + 1000
      ); // Clarity 延迟比 GA 多1秒
    });
  }

  private async initializeBaiduAnalytics(): Promise<void> {
    if (!this.config?.baiduAnalytics.hmId) {
      this.logger.warn('[VoidixAnalytics] 百度统计已启用但缺少hmId');
      return;
    }

    const hmId = this.config.baiduAnalytics.hmId;

    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        try {
          if (window._hmt) {
            this.logger.debug('[VoidixAnalytics] 百度统计脚本已加载');
            return resolve();
          }

          window._hmt = window._hmt || [];
          const script = document.createElement('script');
          script.async = true;
          script.src = `https://hm.baidu.com/hm.js?${hmId}`;
          script.id = 'baidu-analytics-script';

          const timeoutId = setTimeout(() => {
            script.remove();
            reject(new Error('Baidu Analytics 脚本加载超时'));
          }, 10000);

          script.onload = () => {
            clearTimeout(timeoutId);
            this.logger.info('[VoidixAnalytics] Baidu Analytics 初始化完成');
            resolve();
          };

          script.onerror = () => {
            clearTimeout(timeoutId);
            script.remove();
            const error = new Error('Baidu Analytics 脚本加载失败');
            this.logger.error('[VoidixAnalytics] Baidu Analytics 初始化失败', error);
            reject(error);
          };

          const firstScript = document.getElementsByTagName('script')[0];
          firstScript.parentNode?.insertBefore(script, firstScript);
        } catch (error) {
          this.logger.error('[VoidixAnalytics] Baidu Analytics 初始化时发生异常', error);
          reject(error);
        }
      }, this.config?.performance.scriptDelay || 3000);
    });
  }

  /**
   * 重试操作机制
   */
  private async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number,
    operationName: string
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.debug(`[VoidixAnalytics] ${operationName} 尝试 ${attempt}/${maxRetries}`);
        return await operation();
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`[VoidixAnalytics] ${operationName} 第 ${attempt} 次尝试失败:`, error);

        if (attempt < maxRetries) {
          // 指数退避策略
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          this.logger.debug(`[VoidixAnalytics] ${delay}ms 后重试 ${operationName}`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    this.logger.error(
      `[VoidixAnalytics] ${operationName} 在 ${maxRetries} 次尝试后仍失败`,
      lastError!
    );
    throw lastError!;
  }

  /**
   * 预加载关键资源
   */
  private preloadCriticalResources(): void {
    if (typeof document === 'undefined') return;

    const preloadResources = ['https://www.googletagmanager.com', 'https://www.clarity.ms'];

    preloadResources.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = href;
      document.head.appendChild(link);
    });

    this.logger.debug('[VoidixAnalytics] 关键资源预加载完成');
  }

  private processEventQueue(): void {
    if (this.eventQueue.length === 0) return;

    this.logger.debug('[VoidixAnalytics] 处理事件队列', { count: this.eventQueue.length });

    const events = [...this.eventQueue];
    this.eventQueue = [];

    events.forEach(event => this.executeTracking(event));
  }

  private executeTracking(event: TrackingEvent): void {
    this.logger.debug('[VoidixAnalytics] 执行事件追踪', event);

    // Google Analytics 追踪
    if (this.config?.googleAnalytics.enabled && window.gtag) {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        custom_map: event.customProperties,
      });
    }

    // Microsoft Clarity 追踪
    if (this.config?.microsoftClarity.enabled && (window as any).clarity) {
      (window as any).clarity('event', event.action, {
        category: event.category,
        label: event.label,
        value: event.value,
        ...event.customProperties,
      });
    }

    // Baidu Analytics 追踪
    if (this.config?.baiduAnalytics.enabled && typeof window._hmt !== 'undefined') {
      if (event.category === 'page') {
        const pagePath = event.label || window.location.pathname;
        window._hmt.push(['_trackPageview', pagePath]);
        this.logger.debug('[VoidixAnalytics] Baidu Analytics 追踪页面浏览', { path: pagePath });
      } else {
        // 追踪自定义事件
        const { action, customProperties } = event;
        const category = customProperties?.category || event.category;
        const label = customProperties?.label || event.label;
        const value = customProperties?.value || event.value;

        window._hmt.push(['_trackEvent', category, action, label, value]);
        this.logger.debug('[VoidixAnalytics] Baidu Analytics 追踪自定义事件', {
          category,
          action,
          label,
          value,
        });
      }
    }
  }

  private updateThirdPartyConsent(): void {
    // 更新 Google Analytics 同意状态
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: this.consentStatus.analytics ? 'granted' : 'denied',
        ad_storage: this.consentStatus.marketing ? 'granted' : 'denied',
      });
    }

    // Microsoft Clarity 不需要特殊的同意状态更新
  }

  private getFirstContentfulPaint(): number | undefined {
    const po = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          return entry.startTime;
        }
      }
    });
    po.observe({ type: 'paint', buffered: true });
    return undefined; // PerformanceObserver 是异步的，这里返回 undefined 表示需要等待
  }

  private getLargestContentfulPaint(): number | undefined {
    return new Promise<number | undefined>(resolve => {
      new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry?.startTime);
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    }) as any;
  }
}

// 创建全局实例
export const voidixAnalytics = VoidixAnalytics.getInstance();

// 向后兼容的全局API
if (typeof window !== 'undefined') {
  window.voidixUnifiedAnalytics = {
    trackBugReport: (reportType: string, severity: string) =>
      voidixAnalytics.trackBugReport(reportType, severity),
    trackFAQView: (questionId: string, category: string) =>
      voidixAnalytics.trackFAQView(questionId, category),
    trackCustomEvent: (category: string, action: string, label?: string, value?: number) =>
      voidixAnalytics.trackCustomEvent(category, action, label, value),
    trackPagePerformance: () => voidixAnalytics.trackPagePerformance(),
  };
}

export default VoidixAnalytics;

// 扩展 window 类型以包含 _hmt
declare global {
  interface Window {
    _hmt?: any[];
  }
}
