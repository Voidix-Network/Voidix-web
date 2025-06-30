import React from 'react';
import { Helmet } from 'react-helmet-async';

interface InternationalSEOProps {
  currentLanguage?: string;
  availableLanguages?: Array<{
    code: string;
    name: string;
    url: string;
    region?: string;
  }>;
  defaultLanguage?: string;
  canonical?: string;
  enableHreflang?: boolean;
  enableGeoTargeting?: boolean;
  region?: string;
  currency?: string;
}

/**
 * 国际化SEO组件
 *
 * 功能特性：
 * - 自动生成hreflang标签
 * - 多语言sitemap支持
 * - 地理定位优化
 * - 货币和区域设置
 * - 语言切换器集成
 */
export const InternationalSEO: React.FC<InternationalSEOProps> = ({
  currentLanguage = 'zh-CN',
  availableLanguages = [
    { code: 'zh-CN', name: '简体中文', url: '/', region: 'CN' },
    { code: 'zh-TW', name: '繁體中文', url: '/zh-tw/', region: 'TW' },
    { code: 'en-US', name: 'English', url: '/en/', region: 'US' },
  ],
  defaultLanguage = 'zh-CN',
  canonical,
  enableHreflang = true,
  enableGeoTargeting = true,
  region = 'CN',
  currency = 'CNY',
}) => {
  // 生成hreflang标签
  const generateHreflangTags = () => {
    if (!enableHreflang || availableLanguages.length <= 1) return [];

    const baseUrl =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'https://www.voidix.net';
    const currentPath =
      typeof window !== 'undefined' && window.location.pathname ? window.location.pathname : '/';

    const hreflangTags = availableLanguages.map(lang => {
      let href = `${baseUrl}${lang.url}`;

      // 处理子路径
      if (currentPath !== '/' && lang.code !== defaultLanguage) {
        const pathWithoutLeadingSlash = currentPath.startsWith('/')
          ? currentPath.slice(1)
          : currentPath;
        href = `${baseUrl}${lang.url}${pathWithoutLeadingSlash}`;
      }

      return {
        rel: 'alternate',
        hreflang: lang.region
          ? `${lang.code.toLowerCase()}-${lang.region}`
          : lang.code.toLowerCase(),
        href,
      };
    });

    // 添加x-default标签
    const defaultLang = availableLanguages.find(lang => lang.code === defaultLanguage);
    if (defaultLang) {
      hreflangTags.push({
        rel: 'alternate',
        hreflang: 'x-default',
        href: `${baseUrl}${defaultLang.url}`,
      });
    }

    return hreflangTags;
  };

  // 生成地理定位meta标签
  const generateGeoTargetingTags = () => {
    if (!enableGeoTargeting) return [];

    const currentLang = availableLanguages.find(lang => lang.code === currentLanguage);
    const targetRegion = currentLang?.region || region;

    return [
      { name: 'geo.region', content: targetRegion },
      { name: 'geo.placename', content: getRegionName(targetRegion) },
      { name: 'geo.position', content: getRegionCoordinates(targetRegion) },
      { name: 'ICBM', content: getRegionCoordinates(targetRegion) },
    ];
  };

  // 获取区域名称
  const getRegionName = (regionCode: string): string => {
    const regionNames: Record<string, string> = {
      CN: 'China',
      TW: 'Taiwan',
      HK: 'Hong Kong',
      US: 'United States',
      GB: 'United Kingdom',
      JP: 'Japan',
      KR: 'South Korea',
    };
    return regionNames[regionCode] || regionCode;
  };

  // 获取区域坐标
  const getRegionCoordinates = (regionCode: string): string => {
    const coordinates: Record<string, string> = {
      CN: '35.8617, 104.1954', // 中国中心坐标
      TW: '23.6978, 120.9605', // 台湾中心坐标
      HK: '22.3193, 114.1694', // 香港坐标
      US: '37.0902, -95.7129', // 美国中心坐标
      GB: '55.3781, -3.4360', // 英国中心坐标
      JP: '36.2048, 138.2529', // 日本中心坐标
      KR: '35.9078, 127.7669', // 韩国中心坐标
    };
    return coordinates[regionCode] || '0, 0';
  };

  // 生成货币和定价信息
  const generatePricingSchema = () => {
    return {
      '@context': 'https://schema.org',
      '@type': 'PriceSpecification',
      priceCurrency: currency,
      eligibleRegion: {
        '@type': 'Country',
        name: getRegionName(region),
        identifier: region,
      },
    };
  };

  // 语言切换器数据
  const getLanguageSwitcherData = () => {
    return availableLanguages.map(lang => ({
      ...lang,
      isCurrent: lang.code === currentLanguage,
      hreflang: lang.region ? `${lang.code.toLowerCase()}-${lang.region}` : lang.code.toLowerCase(),
    }));
  };

  const hreflangTags = generateHreflangTags();
  const geoTags = generateGeoTargetingTags();
  const pricingSchema = generatePricingSchema();
  const languageSwitcherData = getLanguageSwitcherData();

  return (
    <>
      {/* SEO Meta标签 */}
      <Helmet>
        {/* 语言设置 */}
        <html lang={currentLanguage.toLowerCase()} />

        {/* Hreflang标签 */}
        {hreflangTags.map((tag, index) => (
          <link key={index} rel={tag.rel} hrefLang={tag.hreflang} href={tag.href} />
        ))}

        {/* 规范化URL */}
        {canonical && <link rel="canonical" href={canonical} />}

        {/* 地理定位标签 */}
        {geoTags.map((tag, index) => (
          <meta key={index} name={tag.name} content={tag.content} />
        ))}

        {/* 货币和区域设置 */}
        <meta name="currency" content={currency} />
        <meta name="target-region" content={region} />

        {/* 定价结构化数据 */}
        <script type="application/ld+json">{JSON.stringify(pricingSchema, null, 2)}</script>

        {/* Open Graph语言标签 */}
        <meta property="og:locale" content={currentLanguage.replace('-', '_')} />
        {availableLanguages
          .filter(lang => lang.code !== currentLanguage)
          .map((lang, index) => (
            <meta
              key={index}
              property="og:locale:alternate"
              content={lang.code.replace('-', '_')}
            />
          ))}
      </Helmet>

      {/* 语言切换器UI（可选） */}
      <div className="hidden" data-language-switcher>
        {languageSwitcherData.map(lang => (
          <div
            key={lang.code}
            data-language-code={lang.code}
            data-language-name={lang.name}
            data-language-url={lang.url}
            data-is-current={lang.isCurrent}
            data-hreflang={lang.hreflang}
          />
        ))}
      </div>
    </>
  );
};

/**
 * 语言切换器Hook
 */
export const useLanguageSwitcher = (
  availableLanguages: Array<{
    code: string;
    name: string;
    url: string;
    region?: string;
  }>
) => {
  const switchLanguage = (languageCode: string) => {
    const targetLanguage = availableLanguages.find(lang => lang.code === languageCode);
    if (targetLanguage) {
      const baseUrl =
        typeof window !== 'undefined' && window.location.origin
          ? window.location.origin
          : 'https://www.voidix.net';
      const targetUrl = `${baseUrl}${targetLanguage.url}`;

      // 平滑切换到目标语言
      window.location.href = targetUrl;
    }
  };

  const getCurrentLanguage = () => {
    const path =
      typeof window !== 'undefined' && window.location.pathname ? window.location.pathname : '/';
    return (
      availableLanguages.find(
        lang => path.startsWith(lang.url) || (lang.url === '/' && path === '/')
      ) || availableLanguages[0]
    );
  };

  return {
    switchLanguage,
    getCurrentLanguage,
  };
};

/**
 * 多语言sitemap生成器
 */
export const generateMultilingualSitemap = (
  routes: string[],
  languages: Array<{ code: string; url: string; region?: string }>,
  baseUrl: string = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://www.voidix.net'
): string => {
  const sitemapEntries = routes.flatMap(route => {
    return languages.map(lang => {
      // 正确处理URL路径，避免双斜杠
      let finalRoute = route === '/' ? '' : route;
      // 确保路由以/开头（除了根路径）
      if (finalRoute && !finalRoute.startsWith('/')) {
        finalRoute = '/' + finalRoute;
      }

      // 构建完整URL，处理语言URL路径
      let langUrl = lang.url;
      if (langUrl.endsWith('/') && langUrl !== '/') {
        langUrl = langUrl.slice(0, -1); // 移除末尾斜杠
      }

      // 特殊处理根语言路径
      let url;
      if (langUrl === '/' && finalRoute) {
        url = `${baseUrl}${finalRoute}`; // 根语言直接拼接路由
      } else {
        url = `${baseUrl}${langUrl}${finalRoute}`;
      }

      const hreflang = lang.region
        ? `${lang.code.toLowerCase()}-${lang.region}`
        : lang.code.toLowerCase();

      return {
        url,
        hreflang,
        alternates: languages.map(altLang => {
          let altLangUrl = altLang.url;
          if (altLangUrl.endsWith('/') && altLangUrl !== '/') {
            altLangUrl = altLangUrl.slice(0, -1);
          }

          // 特殊处理根语言路径
          let altHref;
          if (altLangUrl === '/' && finalRoute) {
            altHref = `${baseUrl}${finalRoute}`;
          } else {
            altHref = `${baseUrl}${altLangUrl}${finalRoute}`;
          }

          return {
            hreflang: altLang.region
              ? `${altLang.code.toLowerCase()}-${altLang.region}`
              : altLang.code.toLowerCase(),
            href: altHref,
          };
        }),
      };
    });
  });

  // 生成XML格式的sitemap
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapEntries
  .map(
    entry => `
  <url>
    <loc>${entry.url}</loc>
${entry.alternates
  .map(
    alt => `
    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}" />`
  )
  .join('')}
  </url>`
  )
  .join('')}
</urlset>`;

  return xml;
};

export default InternationalSEO;
