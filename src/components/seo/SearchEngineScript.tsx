import React, { useEffect } from 'react';

/**
 * 搜索引擎抓取辅助脚本组件
 * 用于帮助搜索引擎蜘蛛更好地抓取网站内容
 */
export const SearchEngineScript: React.FC = () => {
  useEffect(() => {
    // 检查是否已经加载过脚本
    if (document.getElementById('ttzz')) {
      return;
    }

    // 检查用户是否同意加载第三方脚本
    const hasConsent = localStorage.getItem('voidix-analytics-consent');
    if (hasConsent !== 'true') {
      return;
    }

    // 创建并加载脚本
    const script = document.createElement('script');
    script.src =
      'https://lf1-cdn-tos.bytegoofy.com/goofy/ttzz/push.js?38c7b610b4424addab832189173b924c389f5b68fd5222ecfdd99c937ceaf3ddfd9a9dcb5ced4d7780eb6f3bbd089073c2a6d54440560d63862bbf4ec01bba3a';
    script.id = 'ttzz';
    script.async = true;
    script.defer = true;

    // 错误处理
    script.onerror = () => {
      console.warn('搜索引擎脚本加载失败');
    };

    script.onload = () => {
      console.debug('搜索引擎脚本加载成功');
    };

    // 插入到第一个script标签之前
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      // 如果没有找到script标签，插入到head中
      document.head.appendChild(script);
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
