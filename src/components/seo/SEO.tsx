/**
 * 优化的SEO组件
 * 集成新的统一分析系统，移除重复的脚本加载逻辑
 */

import { useCookieConsent, useSchema } from '@/hooks';
import { initVoidixAnalytics } from '@/services/analytics';
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { generateKeywordsString, getPageSEOConfig } from './chineseKeywords';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'game';
  canonicalUrl?: string;
  pageKey?: string;
  enableAnalytics?: boolean;
  enableDebug?: boolean;
  additionalMeta?: Array<{
    name?: string;
    property?: string;
    content: string;
  }>;
}

// 默认配置
const DEFAULT_SEO_CONFIG = {
  title: 'Voidix Minecraft公益服务器 - 免费我的世界生存与小游戏服务器',
  description:
    '公益、公平、包容的Minecraft小游戏服务器，致力于为玩家提供开放、透明、无门槛的游戏体验。',
  image: '/logo.png',
  keywords: 'Minecraft,服务器,公益,小游戏,起床战争,空岛战争',
  siteName: 'Voidix - 专业Minecraft服务器',
  organizationName: 'Voidix Minecraft Server',
  websiteUrl: 'https://www.voidix.net',
  contactEmail: 'support@voidix.net',
};

// 生成Sitelinks导航结构化数据
const generateSitelinksData = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    name: 'Voidix主导航',
    url: DEFAULT_SEO_CONFIG.websiteUrl,
    hasPart: [
      {
        '@type': 'SiteNavigationElement',
        name: '服务器状态',
        description: '查看Voidix服务器实时运行状态和在线玩家数',
        url: 'https://www.voidix.net/status',
      },
      {
        '@type': 'SiteNavigationElement',
        name: '常见问题',
        description: '新手玩家入门指南和常见问题解答',
        url: 'https://www.voidix.net/faq',
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Bug反馈',
        description: '提交游戏问题反馈和建议',
        url: 'https://www.voidix.net/bug-report',
      },
    ],
  };
};

// 生成基础结构化数据
const generateBasicStructuredData = (pageKey?: string) => {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Voidix Minecraft Server',
    alternateName: 'Voidix',
    url: DEFAULT_SEO_CONFIG.websiteUrl,
    logo: `${DEFAULT_SEO_CONFIG.websiteUrl}${DEFAULT_SEO_CONFIG.image}`,
    description: DEFAULT_SEO_CONFIG.description,
    email: DEFAULT_SEO_CONFIG.contactEmail,
    founder: [
      {
        '@type': 'Person',
        name: 'NekoSora',
        jobTitle: '核心开发者',
      },
      {
        '@type': 'Person',
        name: 'CYsonHab',
        jobTitle: '核心开发者',
      },
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Chinese',
    },
    foundingDate: '2025',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'CN',
    },
    keywords: 'Minecraft服务器,小游戏服务器,生存服务器,公益服务器,起床战争,空岛战争',
    areaServed: {
      '@type': 'Country',
      name: 'China',
    },
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Voidix Minecraft公益服务器',
    url: DEFAULT_SEO_CONFIG.websiteUrl,
    description: DEFAULT_SEO_CONFIG.description,
    inLanguage: 'zh-CN',
    publisher: {
      '@type': 'Organization',
      name: 'Voidix Team',
    },
    potentialAction: [
      {
        '@type': 'SearchAction',
        target: 'https://www.voidix.net/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
      {
        '@type': 'ReadAction',
        target: 'https://www.voidix.net/status',
        name: '查看服务器状态',
      },
      {
        '@type': 'ReadAction',
        target: 'https://www.voidix.net/faq',
        name: '常见问题解答',
      },
    ],
    // 添加主要导航页面信息
    mainEntity: [
      {
        '@type': 'WebPage',
        '@id': 'https://www.voidix.net/status',
        name: '服务器状态',
        description: '实时服务器状态监控',
      },
      {
        '@type': 'WebPage',
        '@id': 'https://www.voidix.net/faq',
        name: '常见问题',
        description: '新手玩家指南和FAQ',
      },
    ],
  };

  // 为首页添加游戏相关的结构化数据
  const gameSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: 'Voidix Minecraft服务器',
    description: DEFAULT_SEO_CONFIG.description,
    gameLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'CN',
      },
    },
    numberOfPlayers: '1-200',
    playMode: 'https://schema.org/MultiPlayer',
    gamePlatform: ['PC', 'Java Edition'],
    genre: ['沙盒游戏', '小游戏', '生存游戏'],
    gameItem: [
      {
        '@type': 'Thing',
        name: '小游戏服务器',
        description: 'minigame.voidix.net - 起床战争、空岛战争等小游戏',
      },
      {
        '@type': 'Thing',
        name: '生存服务器',
        description: 'survival.voidix.net - 纯净生存体验',
      },
    ],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CNY',
      availability: 'https://schema.org/InStock',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Voidix Team',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      reviewCount: '37',
    },
  };

  const baseSchemas: any[] = [organization, website];

  // 只在首页添加VideoGame和导航数据
  if (pageKey === 'home') {
    baseSchemas.push(gameSchema);
    const sitelinksData = generateSitelinksData();
    baseSchemas.push(sitelinksData);
  }

  return baseSchemas;
};

/**
 * 核心SEO组件
 * 使用新的统一分析系统，整合了丰富的结构化数据
 */
export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image = DEFAULT_SEO_CONFIG.image,
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = 'website',
  canonicalUrl,
  pageKey,
  enableAnalytics = true,
  enableDebug = false,
  additionalMeta = [],
}) => {
  const { addSchema, removeSchema } = useSchema();
  const { hasConsent } = useCookieConsent();

  // 检查是否已经有静态SEO（从generateStaticPages.js生成）
  const [hasStaticSEO, setHasStaticSEO] = React.useState(false);
  const [staticPageKey, setStaticPageKey] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const seoMarker = document.querySelector('meta[name="seo-rendered"]');
      if (seoMarker) {
        setHasStaticSEO(true);
        setStaticPageKey(seoMarker.getAttribute('data-page-key'));
      }
    }
  }, []);

  // 如果静态SEO存在且pageKey匹配，跳过客户端SEO注入（避免重复）
  const shouldSkipSEO = hasStaticSEO && staticPageKey === pageKey;

  // 获取页面配置
  const pageConfig = pageKey ? getPageSEOConfig(pageKey) : null;

  const finalTitle = title || (pageConfig ? pageConfig.title : DEFAULT_SEO_CONFIG.title);
  const finalDescription =
    description || (pageConfig ? pageConfig.description : DEFAULT_SEO_CONFIG.description);
  const finalKeywords =
    keywords || (pageKey ? generateKeywordsString(pageKey) : DEFAULT_SEO_CONFIG.keywords);

  const fullTitle = finalTitle.includes('Voidix')
    ? finalTitle
    : `${finalTitle} | ${DEFAULT_SEO_CONFIG.siteName}`;
  const fullImageUrl = image.startsWith('http')
    ? image
    : `${DEFAULT_SEO_CONFIG.websiteUrl}${image}`;

  // 初始化分析系统，现在会检查Cookie同意状态
  useEffect(() => {
    if (enableAnalytics && hasConsent('analytics')) {
      initVoidixAnalytics().catch(error => {
        if (enableDebug) {
          console.error('[SEO] 分析系统初始化失败:', error);
        }
      });
    }
  }, [enableAnalytics, enableDebug, hasConsent]);

  // 管理结构化数据
  useEffect(() => {
    const structuredData = generateBasicStructuredData(pageKey);
    const schemaIds: string[] = [];

    // 设置结构化数据
    structuredData.forEach((schema, index) => {
      // 使用 @type 和 index 作为唯一ID
      const schemaId = `seo-component-${schema['@type'] || 'unknown'}-${index}`;
      schemaIds.push(schemaId);
      addSchema(schemaId, schema);
    });

    // 清理函数
    return () => {
      schemaIds.forEach(id => {
        removeSchema(id);
      });
    };
  }, [pageKey, addSchema, removeSchema]);

  return (
    <Helmet>
      {/* 如果静态SEO已存在且pageKey匹配，只注入分析脚本，不重复SEO标签 */}
      {!shouldSkipSEO && (
        <>
          {/* 基础SEO */}
          <title>{fullTitle}</title>
          <meta name="description" content={finalDescription} />
          <meta name="keywords" content={finalKeywords} />

          {/* 中文优化 */}
          <meta name="language" content="zh-CN" />
          <meta name="geo.region" content="CN" />
          <meta name="geo.country" content="China" />

          {/* Open Graph */}
          <meta property="og:title" content={fullTitle} />
          <meta property="og:description" content={finalDescription} />
          <meta property="og:image" content={fullImageUrl} />
          <meta property="og:url" content={url} />
          <meta property="og:type" content={type} />
          <meta property="og:site_name" content={DEFAULT_SEO_CONFIG.siteName} />
          <meta property="og:locale" content="zh_CN" />

          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={fullTitle} />
          <meta name="twitter:description" content={finalDescription} />
          <meta name="twitter:image" content={fullImageUrl} />

          {/* 移动端优化 */}
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />

          {/* Canonical URL */}
          {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

          {/* 额外的meta标签 */}
          {additionalMeta.map((meta, index) => (
            <meta
              key={index}
              {...(meta.name ? { name: meta.name } : {})}
              {...(meta.property ? { property: meta.property } : {})}
              content={meta.content}
            />
          ))}
        </>
      )}
    </Helmet>
  );
};

export default SEO;
