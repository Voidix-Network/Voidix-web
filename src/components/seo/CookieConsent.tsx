import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Shield, X } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Cookie同意横幅组件
 * 符合GDPR和隐私法规要求
 */
export const CookieConsent: React.FC = () => {
  const [showConsent, setShowConsent] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // 检查是否已经有同意记录
    const consent = localStorage.getItem('voidix-analytics-consent');
    if (!consent) {
      // 延迟显示，避免影响首屏加载
      const timer = setTimeout(() => {
        setShowConsent(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = (level: 'essential' | 'all') => {
    if (level === 'all') {
      localStorage.setItem('voidix-analytics-consent', 'true');
      localStorage.setItem('voidix-search-engine-consent', 'true');
    } else {
      localStorage.setItem('voidix-analytics-consent', 'false');
      localStorage.setItem('voidix-search-engine-consent', 'false');
    }

    localStorage.setItem('voidix-cookie-consent-given', 'true');
    setShowConsent(false);

    // 跟踪同意事件
    if (typeof window !== 'undefined' && window.voidixUnifiedAnalytics) {
      window.voidixUnifiedAnalytics.trackCustomEvent('privacy', 'cookie_consent', level, 1);
    }

    // 如果用户同意，需要刷新页面以加载分析脚本
    if (level === 'all') {
      window.location.reload();
    }
  };

  const handleReject = () => {
    localStorage.setItem('voidix-analytics-consent', 'false');
    localStorage.setItem('voidix-search-engine-consent', 'false');
    localStorage.setItem('voidix-cookie-consent-given', 'true');
    setShowConsent(false);
  };

  if (!showConsent) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-t border-gray-700"
      >
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            {/* 图标和标题 */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 bg-blue-600/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
                <Cookie className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Cookie使用同意</h3>
                <p className="text-gray-400 text-sm">我们重视您的隐私</p>
              </div>
            </div>

            {/* 内容区域 */}
            <div className="flex-1 min-w-0">
              {!showDetails ? (
                <p className="text-gray-300 text-sm leading-relaxed">
                  我们使用Cookie来改善您的体验，包括网站分析和搜索引擎优化。
                  <button
                    onClick={() => setShowDetails(true)}
                    className="text-blue-400 hover:text-blue-300 underline ml-1"
                  >
                    了解详情
                  </button>
                </p>
              ) : (
                <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                  <div className="space-y-3 text-sm">
                    <div>
                      <h4 className="text-white font-medium mb-1">必要Cookie</h4>
                      <p className="text-gray-400">
                        网站基本功能运行所必需，包括安全性和基本导航。
                      </p>
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">分析Cookie</h4>
                      <p className="text-gray-400">
                        帮助我们了解访问者如何使用网站，包括页面浏览量、访问时长等匿名统计信息。
                      </p>
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">搜索引擎优化</h4>
                      <p className="text-gray-400">
                        协助搜索引擎更好地发现和索引我们的内容，提升网站可见性。
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <Link
                      to="/privacy"
                      className="text-blue-400 hover:text-blue-300 text-sm underline flex items-center gap-1"
                    >
                      <Shield className="h-3 w-3" />
                      查看完整隐私政策
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 按钮区域 */}
            <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
              {showDetails && (
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="收起详情"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              <button
                onClick={() => handleAccept('essential')}
                className="px-4 py-2 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 rounded-lg transition-colors text-sm"
              >
                仅必要
              </button>

              <button
                onClick={handleReject}
                className="px-4 py-2 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 rounded-lg transition-colors text-sm"
              >
                拒绝全部
              </button>

              <button
                onClick={() => handleAccept('all')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                接受全部
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CookieConsent;
