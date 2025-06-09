import React from 'react';
import { Helmet } from 'react-helmet-async';

interface VoidixSearchConsoleProps {
  enableGoogleVerification?: boolean;
  enableBingVerification?: boolean;
  enableBaiduVerification?: boolean;
  enableYandexVerification?: boolean;
  enableSogouVerification?: boolean;
  enableShenmaVerification?: boolean;
  enableBytedanceVerification?: boolean;
}

/**
 * Voidix专用搜索引擎验证组件
 * 用于Google Search Console、Bing Webmaster Tools、百度站长平台、搜狗、神马等验证
 *
 * 使用说明：
 * 1. Google Search Console: https://search.google.com/search-console
 * 2. Bing Webmaster Tools: https://www.bing.com/webmasters
 * 3. 百度站长平台: https://ziyuan.baidu.com/
 * 4. Yandex Webmaster: https://webmaster.yandex.com/
 * 5. 搜狗站长平台: http://zhanzhang.sogou.com/
 * 6. 神马搜索站长平台: https://zhanzhang.sm.cn/
 */
export const VoidixSearchConsole: React.FC<VoidixSearchConsoleProps> = ({
  enableGoogleVerification = true,
  enableBingVerification = true,
  enableBaiduVerification = true,
  enableYandexVerification = true,
  enableSogouVerification = true,
  enableShenmaVerification = true,
  enableBytedanceVerification = true,
}) => {
  // 验证码配置：用户已提供的真实验证码
  const verificationCodes = {
    // Google Search Console已通过DNS验证完成，无需HTML meta标签
    google: import.meta.env.VITE_GOOGLE_SITE_VERIFICATION || '',
    bing: import.meta.env.VITE_BING_SITE_VERIFICATION || '',
    // 百度站长平台验证码（用户已提供）
    baidu: 'codeva-ZQn2BDBrNs',
    // Yandex Webmaster验证码（用户已提供）
    yandex: 'c8c53fe069c3a36c',
    // 中国本土搜索引擎验证码（用户已提供）
    sogou: 'yv6aPUmTyn',
    shenma: import.meta.env.VITE_SHENMA_SITE_VERIFICATION || '',
    bytedance: '/053fD306nw1IKW4fGwt',
  };

  return (
    <Helmet>
      {/* Google Search Console 验证（已通过DNS验证完成） */}
      {enableGoogleVerification && verificationCodes.google && (
        <meta name="google-site-verification" content={verificationCodes.google} />
      )}

      {/* Bing Webmaster Tools 验证 */}
      {enableBingVerification && verificationCodes.bing && (
        <meta name="msvalidate.01" content={verificationCodes.bing} />
      )}

      {/* 百度站长平台验证 */}
      {enableBaiduVerification && (
        <meta name="baidu-site-verification" content={verificationCodes.baidu} />
      )}

      {/* Yandex Webmaster 验证 */}
      {enableYandexVerification && verificationCodes.yandex && (
        <meta name="yandex-verification" content={verificationCodes.yandex} />
      )}

      {/* 搜狗站长平台验证 */}
      {enableSogouVerification && verificationCodes.sogou && (
        <meta name="sogou_site_verification" content={verificationCodes.sogou} />
      )}

      {/* 神马搜索验证 */}
      {enableShenmaVerification && verificationCodes.shenma && (
        <meta name="shenma-site-verification" content={verificationCodes.shenma} />
      )}

      {/* 字节跳动搜索验证（今日头条搜索） */}
      {enableBytedanceVerification && (
        <meta name="bytedance-verification-code" content={verificationCodes.bytedance} />
      )}

      {/* 网站所有权和爬虫指令 */}
      <meta name="author" content="Voidix Minecraft Server Team" />
      <meta name="copyright" content="© 2025 Voidix Minecraft Server" />
      <meta
        name="robots"
        content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
      />

      {/* 搜索引擎爬虫专用指令 */}
      <meta
        name="googlebot"
        content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
      />
      <meta
        name="bingbot"
        content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
      />

      {/* 网站类型声明 */}
      <meta name="classification" content="Gaming, Minecraft Server, Entertainment" />
      <meta name="category" content="Gaming" />
      <meta name="coverage" content="Worldwide" />
      <meta name="distribution" content="Global" />
      <meta name="rating" content="General" />

      {/* 地理位置信息（针对中国用户） */}
      <meta name="geo.region" content="CN" />
      <meta name="geo.placename" content="China" />
      <meta name="geo.position" content="39.9042;116.4074" />
      <meta name="ICBM" content="39.9042, 116.4074" />

      {/* 语言和本地化 */}
      <meta httpEquiv="content-language" content="zh-CN" />
      <meta name="language" content="Chinese" />
    </Helmet>
  );
};

export default VoidixSearchConsole;
