import React, { useEffect } from 'react';

/**
 * 搜索引擎抓取辅助脚本组件
 * 用于帮助搜索引擎蜘蛛更好地抓取网站内容
 */
export const SearchEngineScript: React.FC = () => {
  useEffect(() => {
    const loadSearchEngineScript = () => {
      // 检查是否已经加载过脚本
      if (document.getElementById('ttzz')) {
        return;
      }

      // 检查用户是否同意加载第三方脚本
      const hasConsent = localStorage.getItem('voidix-analytics-consent');
      if (hasConsent !== 'true') {
        return;
      }

      // 延迟加载搜索引擎脚本，避免阻塞DOMContentLoaded
      setTimeout(() => {
        const script = document.createElement('script');
        script.src =
          'https://lf1-cdn-tos.bytegoofy.com/goofy/ttzz/push.js?38c7b610b4424addab832189173b924c389f5b68fd5222ecfdd99c937ceaf3ddfd9a9dcb5ced4d7780eb6f3bbd089073c2a6d54440560d63862bbf4ec01bba3a';
        script.id = 'ttzz';
        script.async = true;
        script.defer = true;

        // 错误处理
        script.onerror = () => {
          console.warn('[SearchEngine] 脚本加载失败');
        };

        script.onload = () => {
          console.debug('[SearchEngine] 脚本延迟加载成功');
        };

        // 插入到head中
        document.head.appendChild(script);
      }, 5000); // 延迟5秒加载，确保不影响页面性能
    };

    // 确保在页面完全加载后运行
    if (document.readyState === 'complete') {
      loadSearchEngineScript();
    } else {
      window.addEventListener('load', loadSearchEngineScript);
    }

    // 清理函数
    return () => {
      const existingScript = document.getElementById('ttzz');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, []);

  return null; // 这个组件不渲染任何内容
};

export default SearchEngineScript;
