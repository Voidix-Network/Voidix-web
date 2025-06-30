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
  const verificationCodes = {
    google:
      import.meta.env.VITE_GOOGLE_SITE_VERIFICATION ||
      'x62Vza2dGv7nroz1AUYAkN0JkN69WgemhDZer5xQO1U',
    bing: import.meta.env.VITE_BING_SITE_VERIFICATION || 'D46ABE4CE43F5A97CFCBCE9695BD272A',
    baidu: import.meta.env.VITE_BAIDU_SITE_VERIFICATION || 'codeva-ZQn2BDBrNs',
    yandex: import.meta.env.VITE_YANDEX_SITE_VERIFICATION || 'c8c53fe069c3a36c',
    sogou: import.meta.env.VITE_SOGOU_SITE_VERIFICATION || 'yv6aPUmTyn',
    shenma:
      import.meta.env.VITE_SHENMA_SITE_VERIFICATION ||
      'a3aa01ddaaaaf382243ff3ece0af5b30_1749622129',
    bytedance: import.meta.env.VITE_BYTEDANCE_SITE_VERIFICATION || '/053fD306nw1IKW4fGwt',
  };

  return (
    <Helmet>
      {/* 搜索引擎验证标签无条件渲染 - 这些不是跟踪工具，只是所有权验证 */}
      {/* Google Search Console 验证 */}
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
