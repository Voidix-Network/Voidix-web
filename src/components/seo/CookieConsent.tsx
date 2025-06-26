import React, { useEffect, useState } from 'react';

interface CookieConsentProps {
  className?: string;
  enableCustomization?: boolean;
}

/**
 * 简化的Cookie同意组件
 * 符合GDPR要求，提供基础的Cookie管理功能
 */
export const CookieConsent: React.FC<CookieConsentProps> = ({
  className = '',
  enableCustomization = false,
}) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // 检查是否已经做出选择
    const consent = localStorage.getItem('voidix-analytics-consent');
    if (consent === null) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('voidix-analytics-consent', 'true');
    setShowBanner(false);
    setShowSettings(false);
    window.dispatchEvent(new Event('cookieConsentChanged'));
  };

  const handleDecline = () => {
    localStorage.setItem('voidix-analytics-consent', 'false');
    setShowBanner(false);
    setShowSettings(false);
    window.dispatchEvent(new Event('cookieConsentChanged'));
  };

  const handleCustomize = () => {
    setShowSettings(true);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie横幅 */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4 z-50 ${className}`}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-white font-medium mb-2">🍪 Cookie设置</h3>
            <p className="text-gray-300 text-sm">
              我们使用Cookie来改善您的浏览体验，提供个性化内容和分析网站流量。
              您可以选择接受所有Cookie或自定义设置。
              <button
                onClick={() => (window.location.href = '/privacy')}
                className="text-purple-400 hover:text-purple-300 underline ml-1 cursor-pointer bg-transparent border-none p-0"
              >
                了解更多
              </button>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {enableCustomization && (
              <button
                onClick={handleCustomize}
                className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors text-sm"
              >
                自定义设置
              </button>
            )}
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors text-sm"
            >
              拒绝非必要
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              接受所有
            </button>
          </div>
        </div>
      </div>

      {/* Cookie设置面板 */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Cookie设置</h2>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">必要Cookie</h3>
                  <p className="text-gray-300 text-sm">网站基本功能所需</p>
                </div>
                <div className="w-10 h-6 bg-purple-600 rounded-full flex items-center px-1">
                  <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">分析Cookie</h3>
                  <p className="text-gray-300 text-sm">帮助我们了解网站使用情况</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked={false}
                    onChange={() => {
                      // 可以添加更详细的Cookie类别控制
                    }}
                  />
                  <div className="w-10 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAcceptAll}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                保存设置
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsent;
