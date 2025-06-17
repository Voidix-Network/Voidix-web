import React from 'react';
import { Helmet } from 'react-helmet-async';
import { getPageSEOConfig, generateKeywordsString, LOGO_ASSETS } from '@/constants';

export interface PageSEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'game';
  canonicalUrl?: string;
  pageKey?: string; // 新增：用于自动获取中文关键词配置
  additionalMeta?: Array<{
    name?: string;
    property?: string;
    content: string;
  }>;
}

export const PageSEO: React.FC<PageSEOProps> = ({
  title,
  description,
  keywords,
  image = LOGO_ASSETS.SEO_IMAGE,
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = 'website',
  canonicalUrl,
  pageKey,
  additionalMeta = [],
}) => {
  // 如果提供了pageKey，使用中文关键词配置
  const chineseConfig = pageKey ? getPageSEOConfig(pageKey) : null;

  const finalTitle = title || chineseConfig?.title || 'Voidix - 专业Minecraft服务器';
  const finalDescription =
    description || chineseConfig?.description || '最好玩的Minecraft小游戏服务器';
  const finalKeywords = keywords || (pageKey ? generateKeywordsString(pageKey) : '');

  const fullTitle = finalTitle.includes('Voidix')
    ? finalTitle
    : `${finalTitle} | Voidix - 专业Minecraft服务器`;

  return (
    <Helmet>
      {/* 基础SEO */}
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      {finalKeywords && <meta name="keywords" content={finalKeywords} />}

      {/* 中文SEO增强 */}
      <meta name="language" content="zh-CN" />
      <meta name="geo.region" content="CN" />
      <meta name="geo.country" content="China" />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Voidix - 专业Minecraft服务器" />
      <meta property="og:locale" content="zh_CN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={image} />

      {/* 百度SEO优化 */}
      <meta name="baidu-site-verification" content="待百度验证码" />
      <meta name="applicable-device" content="pc,mobile" />
      <meta name="MobileOptimized" content="width" />
      <meta name="HandheldFriendly" content="true" />

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
    </Helmet>
  );
};

export default PageSEO;
