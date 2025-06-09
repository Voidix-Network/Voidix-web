import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Cookie同意设置接口
 */
export interface ConsentSettings {
  necessary: boolean; // 必要Cookie（总是true）
  analytics: boolean; // 分析Cookie（百度统计）
  marketing: boolean; // 营销Cookie
  functional: boolean; // 功能Cookie
}

/**
 * Cookie同意组件Props
 */
interface CookieConsentProps {
  /**
   * 同意设置变化回调
   */
  onConsentChange?: (consent: ConsentSettings) => void;
  /**
   * 是否显示详细设置
   */
  showDetailedSettings?: boolean;
  /**
   * 自定义样式类名
   */
  className?: string;
  /**
   * 主题模式
   */
  theme?: 'light' | 'dark' | 'auto';
}

/**
 * 默认同意设置
 */
const DEFAULT_CONSENT: ConsentSettings = {
  necessary: true, // 必要Cookie始终启用
  analytics: false, // 分析Cookie默认关闭
  marketing: false, // 营销Cookie默认关闭
  functional: true, // 功能Cookie默认启用
};

/**
 * Cookie同意横幅组件
 *
 * 功能特性：
 * - 符合GDPR/CCPA隐私法规要求
 * - 现代化UI设计，支持动画效果和暗黑主题
 * - 本地存储用户选择，避免重复询问
 * - 支持详细Cookie分类管理
 * - 与百度统计等分析工具集成
 * - 响应式设计，移动端友好
 * - 自动检测系统主题偏好
 */
export const CookieConsentDark: React.FC<CookieConsentProps> = ({
  onConsentChange,
  showDetailedSettings = false,
  className = '',
  theme = 'dark',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<ConsentSettings>(DEFAULT_CONSENT);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark');

  /**
   * 确定当前主题
   */
  useEffect(() => {
    const determineTheme = () => {
      if (theme === 'auto') {
        // 检测系统主题偏好
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'dark' : 'light';
      }
      return theme;
    };

    const resolvedTheme = determineTheme();
    setCurrentTheme(resolvedTheme);

    // 监听系统主题变化
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleThemeChange = (e: MediaQueryListEvent) => {
        setCurrentTheme(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleThemeChange);
      return () => mediaQuery.removeEventListener('change', handleThemeChange);
    }
  }, [theme]);

  /**
   * 检查是否已有存储的同意设置
   */
  useEffect(() => {
    const storedConsent = localStorage.getItem('voidix-cookie-consent');

    if (storedConsent) {
      try {
        const parsedConsent = JSON.parse(storedConsent);
        setConsent(parsedConsent);
        onConsentChange?.(parsedConsent);
      } catch (error) {
        console.warn('[CookieConsent] 解析存储的同意设置失败:', error);
        setIsVisible(true);
      }
    } else {
      // 延迟显示横幅，避免影响首屏加载
      setTimeout(() => setIsVisible(true), 2000);
    }
  }, [onConsentChange]);

  /**
   * 保存同意设置
   */
  const saveConsent = (newConsent: ConsentSettings) => {
    localStorage.setItem('voidix-cookie-consent', JSON.stringify(newConsent));
    setConsent(newConsent);
    onConsentChange?.(newConsent);
    setIsVisible(false);

    console.log('[CookieConsent] 用户同意设置已保存:', newConsent);
  };

  /**
   * 接受所有Cookie
   */
  const acceptAllCookies = () => {
    const allAcceptedConsent: ConsentSettings = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    saveConsent(allAcceptedConsent);
  };

  /**
   * 仅接受必要Cookie
   */
  const acceptNecessaryOnly = () => {
    const necessaryOnlyConsent: ConsentSettings = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    saveConsent(necessaryOnlyConsent);
  };

  /**
   * 保存自定义设置
   */
  const saveCustomSettings = () => {
    saveConsent(consent);
  };

  /**
   * 更新特定Cookie类别的同意状态
   */
  const updateConsentCategory = (category: keyof ConsentSettings, value: boolean) => {
    if (category === 'necessary') return; // 必要Cookie无法禁用

    setConsent(prev => ({
      ...prev,
      [category]: value,
    }));
  };

  // 主题样式配置
  const themeStyles = {
    dark: {
      container: 'bg-gray-900 border-gray-700 text-white',
      text: {
        primary: 'text-white',
        secondary: 'text-gray-300',
        muted: 'text-gray-400',
      },
      background: {
        primary: 'bg-gray-900',
        secondary: 'bg-gray-800',
        card: 'bg-gray-800',
      },
      border: 'border-gray-700',
      button: {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-200',
        accent: 'bg-green-600 hover:bg-green-700 text-white',
        link: 'text-blue-400 hover:text-blue-300',
      },
      input: 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500',
    },
    light: {
      container: 'bg-white border-gray-200 text-gray-900',
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-700',
        muted: 'text-gray-600',
      },
      background: {
        primary: 'bg-white',
        secondary: 'bg-gray-50',
        card: 'bg-gray-50',
      },
      border: 'border-gray-200',
      button: {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
        accent: 'bg-green-600 hover:bg-green-700 text-white',
        link: 'text-blue-600 hover:text-blue-700',
      },
      input: 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500',
    },
  };

  const styles = themeStyles[currentTheme];

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`fixed bottom-0 left-0 right-0 z-50 ${styles.container} border-t shadow-lg backdrop-blur-sm ${className}`}
      >
        <div className="max-w-6xl mx-auto p-3 sm:p-4">
          {!showDetails ? (
            // 简化横幅界面
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex-1">
                <h3 className={`text-base font-semibold ${styles.text.primary} mb-1`}>
                  🍪 我们使用Cookie来改善您的体验
                </h3>
                <p className={`text-sm ${styles.text.secondary} leading-relaxed`}>
                  我们使用Cookie来分析网站流量、优化用户体验，并提供个性化内容。
                  您可以选择接受所有Cookie，或仅接受必要的功能性Cookie。
                  {showDetailedSettings && (
                    <button
                      onClick={() => setShowDetails(true)}
                      className={`${styles.button.link} underline ml-1 font-medium transition-colors duration-200`}
                    >
                      详细设置
                    </button>
                  )}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
                <button
                  onClick={acceptNecessaryOnly}
                  className={`px-3 py-1.5 text-sm font-medium ${styles.button.secondary} rounded-md transition-colors duration-200`}
                >
                  仅必要Cookie
                </button>
                <button
                  onClick={acceptAllCookies}
                  className={`px-4 py-1.5 text-sm font-medium ${styles.button.primary} rounded-md transition-colors duration-200`}
                >
                  接受所有Cookie
                </button>
              </div>
            </div>
          ) : (
            // 详细设置界面
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${styles.text.primary}`}>Cookie偏好设置</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className={`${styles.text.muted} hover:${styles.text.secondary} text-xl transition-colors duration-200`}
                >
                  ×
                </button>
              </div>

              <div className="grid gap-3">
                {/* 必要Cookie */}
                <div
                  className={`flex items-center justify-between p-3 ${styles.background.card} rounded-md ${styles.border}`}
                >
                  <div className="flex-1">
                    <h4 className={`font-medium ${styles.text.primary} text-sm`}>必要Cookie</h4>
                    <p className={`text-xs ${styles.text.secondary} mt-0.5`}>
                      网站基本功能所必需，包括安全性、网络管理和可访问性功能。
                    </p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled={true}
                      className={`w-3.5 h-3.5 text-blue-600 ${styles.border} rounded focus:ring-blue-500 opacity-50`}
                    />
                    <span className={`ml-2 text-xs ${styles.text.muted}`}>始终启用</span>
                  </div>
                </div>

                {/* 分析Cookie */}
                <div
                  className={`flex items-center justify-between p-3 ${styles.background.card} rounded-md ${styles.border}`}
                >
                  <div className="flex-1">
                    <h4 className={`font-medium ${styles.text.primary} text-sm`}>分析Cookie</h4>
                    <p className={`text-xs ${styles.text.secondary} mt-0.5`}>
                      帮助我们了解访客如何使用网站，包括百度统计等分析工具。
                    </p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent.analytics}
                      onChange={e => updateConsentCategory('analytics', e.target.checked)}
                      className={`w-3.5 h-3.5 text-blue-600 ${styles.border} rounded focus:ring-blue-500`}
                    />
                    <span className={`ml-2 text-xs ${styles.text.secondary}`}>
                      {consent.analytics ? '已启用' : '已禁用'}
                    </span>
                  </label>
                </div>

                {/* 功能Cookie */}
                <div
                  className={`flex items-center justify-between p-3 ${styles.background.card} rounded-md ${styles.border}`}
                >
                  <div className="flex-1">
                    <h4 className={`font-medium ${styles.text.primary} text-sm`}>功能Cookie</h4>
                    <p className={`text-xs ${styles.text.secondary} mt-0.5`}>
                      启用增强功能，如个性化内容、社交媒体功能和在线聊天。
                    </p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent.functional}
                      onChange={e => updateConsentCategory('functional', e.target.checked)}
                      className={`w-3.5 h-3.5 text-blue-600 ${styles.border} rounded focus:ring-blue-500`}
                    />
                    <span className={`ml-2 text-xs ${styles.text.secondary}`}>
                      {consent.functional ? '已启用' : '已禁用'}
                    </span>
                  </label>
                </div>

                {/* 营销Cookie */}
                <div
                  className={`flex items-center justify-between p-3 ${styles.background.card} rounded-md ${styles.border}`}
                >
                  <div className="flex-1">
                    <h4 className={`font-medium ${styles.text.primary} text-sm`}>营销Cookie</h4>
                    <p className={`text-xs ${styles.text.secondary} mt-0.5`}>
                      用于跟踪访客并显示相关广告和营销内容。
                    </p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent.marketing}
                      onChange={e => updateConsentCategory('marketing', e.target.checked)}
                      className={`w-3.5 h-3.5 text-blue-600 ${styles.border} rounded focus:ring-blue-500`}
                    />
                    <span className={`ml-2 text-xs ${styles.text.secondary}`}>
                      {consent.marketing ? '已启用' : '已禁用'}
                    </span>
                  </label>
                </div>
              </div>

              <div className={`flex flex-col sm:flex-row gap-2 pt-3 border-t ${styles.border}`}>
                <button
                  onClick={acceptNecessaryOnly}
                  className={`flex-1 px-3 py-1.5 text-sm font-medium ${styles.button.secondary} rounded-md transition-colors duration-200`}
                >
                  仅接受必要Cookie
                </button>
                <button
                  onClick={saveCustomSettings}
                  className={`flex-1 px-3 py-1.5 text-sm font-medium ${styles.button.primary} rounded-md transition-colors duration-200`}
                >
                  保存设置
                </button>
                <button
                  onClick={acceptAllCookies}
                  className={`flex-1 px-3 py-1.5 text-sm font-medium ${styles.button.accent} rounded-md transition-colors duration-200`}
                >
                  接受所有Cookie
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 主题指示器（仅在调试模式下显示） */}
        {import.meta.env.DEV && (
          <div
            className={`absolute top-2 right-2 px-2 py-1 text-xs ${styles.background.card} ${styles.border} rounded opacity-50`}
          >
            {currentTheme} theme
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * 获取当前Cookie同意设置
 */
export const getCookieConsent = (): ConsentSettings | null => {
  try {
    const storedConsent = localStorage.getItem('voidix-cookie-consent');
    return storedConsent ? JSON.parse(storedConsent) : null;
  } catch {
    return null;
  }
};

/**
 * 检查特定Cookie类别是否被允许
 */
export const isCookieAllowed = (category: keyof ConsentSettings): boolean => {
  const consent = getCookieConsent();
  return consent ? consent[category] : false;
};

export default CookieConsentDark;
