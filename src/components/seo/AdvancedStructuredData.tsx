import React from 'react';
import { Helmet } from 'react-helmet-async';

interface AdvancedStructuredDataProps {
  organizationName?: string;
  websiteUrl?: string;
  logoUrl?: string;
  socialLinks?: string[];
  contactEmail?: string;
  description?: string;
}

/**
 * Voidix高级结构化数据组件
 * 提供Organization、WebSite、BreadcrumbList等Schema.org标记
 * 帮助搜索引擎更好地理解网站内容和结构
 */
export const AdvancedStructuredData: React.FC<AdvancedStructuredDataProps> = ({
  organizationName = 'Voidix Minecraft Server',
  websiteUrl = 'https://www.voidix.net',
  logoUrl = 'https://www.voidix.net/android-chrome-512x512.png',
  socialLinks = [],
  contactEmail = 'contact@voidix.net',
  description = 'Voidix是专业的Minecraft服务器平台，提供高质量的游戏体验、稳定的服务器性能和活跃的玩家社区。',
}) => {
  // Organization Schema - 组织信息
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: organizationName,
    url: websiteUrl,
    logo: logoUrl,
    description: description,
    email: contactEmail,
    foundingDate: '2023',
    areaServed: {
      '@type': 'Country',
      name: 'China',
    },
    audience: {
      '@type': 'Audience',
      audienceType: 'Minecraft玩家',
    },
    serviceType: 'Minecraft游戏服务器',
    applicationCategory: 'Game',
    ...(socialLinks.length > 0 && {
      sameAs: socialLinks,
    }),
    contactPoint: {
      '@type': 'ContactPoint',
      email: contactEmail,
      contactType: 'customer service',
      areaServed: 'CN',
      availableLanguage: 'Chinese',
    },
  };

  // WebSite Schema - 网站信息
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: organizationName,
    url: websiteUrl,
    description: description,
    inLanguage: 'zh-CN',
    isAccessibleForFree: true,
    usageInfo: `${websiteUrl}/faq`,
    publisher: {
      '@type': 'Organization',
      name: organizationName,
      logo: logoUrl,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${websiteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    mainEntity: {
      '@type': 'WebPage',
      '@id': websiteUrl,
      name: '首页',
      description: description,
    },
  };

  // VideoGame Schema - 游戏相关信息
  const gameSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: 'Voidix Minecraft Server',
    description: '专业的Minecraft多人游戏服务器，提供丰富的游戏模式和优质的游戏体验',
    genre: ['沙盒游戏', '建造游戏', '多人在线游戏'],
    platform: 'Minecraft Java Edition',
    playMode: 'MultiPlayer',
    applicationCategory: 'Game',
    operatingSystem: 'Java',
    publisher: {
      '@type': 'Organization',
      name: organizationName,
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CNY',
      availability: 'https://schema.org/InStock',
      description: '免费游戏服务器',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      bestRating: '5',
      worstRating: '1',
      ratingCount: '256',
    },
  };

  // SoftwareApplication Schema - 软件应用信息（更适合在线游戏服务器）
  const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${websiteUrl}#application`,
    name: organizationName,
    url: websiteUrl,
    description: description,
    image: logoUrl,
    applicationCategory: 'Game',
    applicationSubCategory: 'Minecraft Server',
    operatingSystem: 'Cross-platform',
    softwareVersion: 'Latest',
    releaseNotes: '支持最新版本Minecraft',
    downloadUrl: websiteUrl,
    installUrl: websiteUrl,
    screenshot: logoUrl,
    video: '',
    featureList: ['多人游戏', '服务器托管', '技术支持', '社区交流'],
    requirements: 'Minecraft Java Edition或基岩版',
    permissions: '无需特殊权限',
    storageRequirements: '无本地存储要求',
    memoryRequirements: '推荐2GB内存',
    processorRequirements: '支持Java运行环境',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CNY',
      availability: 'https://schema.org/InStock',
      description: '免费游戏服务器',
      validFrom: '2023-01-01',
      eligibleRegion: {
        '@type': 'Country',
        name: 'China',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      bestRating: '5',
      worstRating: '1',
      ratingCount: '256',
      reviewCount: '128',
    },
    author: {
      '@type': 'Organization',
      name: organizationName,
    },
    publisher: {
      '@type': 'Organization',
      name: organizationName,
      logo: logoUrl,
    },
    dateCreated: '2023-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    datePublished: '2023-01-01',
    copyrightYear: '2023',
    copyrightHolder: {
      '@type': 'Organization',
      name: organizationName,
    },
    license: 'https://minecraft.net/terms',
    isAccessibleForFree: true,
    usageInfo: `${websiteUrl}/faq`,
    privacyPolicy: `${websiteUrl}/privacy`,
    termsOfService: `${websiteUrl}/terms`,
  };

  // FAQPage Schema - 常见问题页面
  const faqPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '如何连接到Voidix服务器？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '打开Minecraft客户端，点击多人游戏，添加服务器，输入Voidix服务器地址即可连接。',
        },
      },
      {
        '@type': 'Question',
        name: 'Voidix服务器支持哪些游戏模式？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Voidix支持生存模式、创造模式、小游戏模式等多种游戏模式，满足不同玩家的需求。',
        },
      },
      {
        '@type': 'Question',
        name: 'Voidix服务器是否免费？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '是的，Voidix是完全免费的Minecraft服务器，所有玩家都可以免费加入游戏。',
        },
      },
    ],
  };

  return (
    <Helmet>
      {/* Organization Schema */}
      <script type="application/ld+json">{JSON.stringify(organizationSchema, null, 2)}</script>

      {/* WebSite Schema */}
      <script type="application/ld+json">{JSON.stringify(websiteSchema, null, 2)}</script>

      {/* VideoGame Schema */}
      <script type="application/ld+json">{JSON.stringify(gameSchema, null, 2)}</script>

      {/* SoftwareApplication Schema */}
      <script type="application/ld+json">
        {JSON.stringify(softwareApplicationSchema, null, 2)}
      </script>

      {/* FAQPage Schema */}
      <script type="application/ld+json">{JSON.stringify(faqPageSchema, null, 2)}</script>

      {/* 额外的meta标签 */}
      <meta name="application-name" content={organizationName} />
      <meta name="msapplication-tooltip" content={description} />
      <meta name="msapplication-starturl" content={websiteUrl} />

      {/* Apple Web App配置 */}
      <meta name="apple-mobile-web-app-title" content={organizationName} />
      {/* 使用现代化的mobile-web-app-capable替代弃用的apple-mobile-web-app-capable */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      {/* Microsoft配置 */}
      <meta name="msapplication-TileColor" content="#2d89ef" />
      <meta name="msapplication-config" content="/browserconfig.xml" />

      {/* 主题颜色 */}
      <meta name="theme-color" content="#ffffff" />
      <meta name="msapplication-navbutton-color" content="#ffffff" />
    </Helmet>
  );
};

export default AdvancedStructuredData;
