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
  enableClarity?: boolean;
  enableDebug?: boolean;
  additionalMeta?: Array<{
    name?: string;
    property?: string;
    content: string;
  }>;
}

// 默认配置
const DEFAULT_SEO_CONFIG = {
  title: 'Voidix Minecraft公益服务器 - 最佳我的世界生存与小游戏服务器',
  description:
    '公益、公平、包容的Minecraft小游戏服务器，致力于为玩家提供开放、透明、无门槛的游戏体验。',
  image: '/logo.png',
  keywords: 'Minecraft,服务器,公益,小游戏,起床战争,空岛战争',
  siteName: 'Voidix - 专业Minecraft服务器',
  organizationName: 'Voidix Minecraft Server',
  websiteUrl: 'https://www.voidix.net',
  contactEmail: 'contact@voidix.net',
};

// 延迟分析跟踪 - DOMContentLoaded后加载
const initializeSimpleAnalytics = (enableAnalytics: boolean, enableDebug: boolean = false) => {
  if (!enableAnalytics || typeof window === 'undefined') return;

  // 检查用户同意
  const hasConsent = localStorage.getItem('voidix-analytics-consent') === 'true';
  const isDev = import.meta.env.DEV;

  if (!hasConsent || isDev) return;

  // 等待DOM完全加载后再初始化分析脚本
  const initAnalytics = () => {
    const measurementId = 'G-SPQQPKW4VN';

    // 只加载必要的gtag功能
    if (!window.gtag) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };

      // 进一步延迟加载gtag.js，避免阻塞渲染
      setTimeout(() => {
        const script = document.createElement('script');
        script.async = true;
        script.defer = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
        document.head.appendChild(script);

        script.onload = () => {
          window.gtag('js', new Date());
          window.gtag('config', measurementId, {
            client_storage: 'none',
            anonymize_ip: true,
            allow_google_signals: false,
            send_page_view: true,
          });
          if (enableDebug) console.log('[SEO] GA4 延迟初始化完成');
        };
      }, 3000); // 增加延迟到3秒
    }
  };

  // 确保在DOMContentLoaded之后运行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnalytics);
  } else {
    // 如果DOM已经加载完成，直接执行
    setTimeout(initAnalytics, 1000);
  }
};

// Microsoft Clarity延迟集成
const initializeClarity = (enableClarity: boolean, enableDebug: boolean = false) => {
  if (!enableClarity || typeof window === 'undefined') return;

  const hasConsent = localStorage.getItem('voidix-analytics-consent') === 'true';
  const isDev = import.meta.env.DEV;
  const clarityId = import.meta.env.VITE_CLARITY_PROJECT_ID || '';

  if (!hasConsent || isDev || !clarityId) return;

  const initClarity = () => {
    // 检查Clarity是否已加载
    if ((window as any).clarity) {
      if (enableDebug) console.log('[SEO] Clarity already loaded');
      return;
    }

    // 延迟加载Microsoft Clarity
    setTimeout(() => {
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
        y = l.getElementsByTagName(r)[0];
        y.parentNode.insertBefore(t, y);
      })(window, document, 'clarity', 'script', clarityId, null, null);

      if (enableDebug) console.log('[SEO] Clarity 延迟初始化完成');
    }, 4000); // 延迟4秒加载
  };

  // 确保在页面完全加载后运行
  if (document.readyState === 'complete') {
    initClarity();
  } else {
    window.addEventListener('load', initClarity);
  }
};

// 统一分析API
const initializeUnifiedAnalytics = (enableDebug: boolean = false) => {
  if (typeof window === 'undefined') return;

  const hasConsent = localStorage.getItem('voidix-analytics-consent') === 'true';
  const isDev = import.meta.env.DEV;

  if (!hasConsent || isDev) {
    // @ts-ignore
    window.voidixUnifiedAnalytics = undefined;
    return;
  }

  // Voidix统一分析API
  window.voidixUnifiedAnalytics = {
    trackBugReport: (reportType: string, severity: string) => {
      if ((window as any).clarity) {
        (window as any).clarity('event', 'bug_report', { reportType, severity });
      }
      if (enableDebug) console.log('[统一分析] Bug报告跟踪:', { reportType, severity });
    },
    trackFAQView: (questionId: string, category: string) => {
      if ((window as any).clarity) {
        (window as any).clarity('event', 'faq_view', { questionId, category });
      }
      if (enableDebug) console.log('[统一分析] FAQ查看跟踪:', { questionId, category });
    },
    trackCustomEvent: (category: string, action: string, label?: string, value?: number) => {
      if ((window as any).clarity) {
        (window as any).clarity('event', action, { category, label, value });
      }
      if (enableDebug)
        console.log('[统一分析] 自定义事件跟踪:', { category, action, label, value });
    },
    trackPagePerformance: () => {
      if ((window as any).clarity) {
        (window as any).clarity('event', 'page_performance');
      }
      if (enableDebug) console.log('[统一分析] 页面性能跟踪已执行');
    },
  };

  if (enableDebug) console.log('[SEO] 统一分析API已初始化');
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
        name: '监控面板',
        description: '服务器性能监控和运行数据统计',
        url: 'https://www.voidix.net/monitor',
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
      {
        '@type': 'SiteNavigationElement',
        name: '隐私政策',
        description: '了解我们的隐私保护政策',
        url: 'https://www.voidix.net/privacy',
      },
    ],
  };
};

// 生成全面的结构化数据
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
      {
        '@type': 'WebPage',
        '@id': 'https://www.voidix.net/monitor',
        name: '监控面板',
        description: '服务器性能监控',
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
  };

  // 根据页面类型返回不同的结构化数据
  const baseSchemas = [organization, website, gameSchema];

  // 首页添加Sitelinks导航数据
  if (pageKey === 'home') {
    const sitelinksData = generateSitelinksData();
    return [...baseSchemas, sitelinksData];
  }

  return baseSchemas;
};

/**
 * 核心SEO组件
 * 整合了PageSEO、基础结构化数据、轻量级分析和MicrosoftClarity
 * 使用chineseKeywords.ts中的精选配置
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
  enableClarity = true,
  enableDebug = false,
  additionalMeta = [],
}) => {
  // 获取页面配置 - 使用您精心配置的关键词
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

  // 初始化分析功能
  useEffect(() => {
    if (enableAnalytics) {
      initializeSimpleAnalytics(true, enableDebug);
    }
    if (enableClarity) {
      initializeClarity(true, enableDebug);
    }
    // 始终初始化统一API（内部会检查同意状态）
    initializeUnifiedAnalytics(enableDebug);
  }, [enableAnalytics, enableClarity, enableDebug]);

  // 生成结构化数据
  const structuredData = generateBasicStructuredData(pageKey);

  return (
    <Helmet>
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

      {/* 结构化数据 */}
      {structuredData.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema, null, 0)}
        </script>
      ))}

      {/* 额外的meta标签 */}
      {additionalMeta.map((meta, index) => (
        <meta
          key={index}
          {...(meta.name ? { name: meta.name } : {})}
          {...(meta.property ? { property: meta.property } : {})}
          content={meta.content}
        />
      ))}
    </Helmet>
  );
};

// 全局类型声明已移至 types/analytics.d.ts

export default SEO;
