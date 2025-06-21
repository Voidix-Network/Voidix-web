import { SITE_CONFIG, getSiteUrl, getCurrentDate } from '../siteConfig.js';
import { SITEMAP_CONFIG } from '../buildConfig.js';

/**
 * Sitemap配置生成器
 * 根据路由信息生成Sitemap配置
 */

/**
 * 创建Voidix站点的Sitemap配置
 */
export function createSitemapConfig(baseUrl = SITE_CONFIG.baseUrl, routes = null) {
  // 使用默认路由或传入的路由
  const defaultRoutes = [
    {
      path: '/',
      priority: SITE_CONFIG.seo.homePriority,
      changefreq: 'daily',
      lastmod: getCurrentDate(),
    },
    {
      path: '/status',
      priority: 0.9,
      changefreq: 'hourly',
      lastmod: getCurrentDate(),
    },
    {
      path: '/faq',
      priority: 0.8,
      changefreq: 'weekly',
      lastmod: getCurrentDate(),
    },
    {
      path: '/bug-report',
      priority: 0.7,
      changefreq: 'monthly',
      lastmod: getCurrentDate(),
    },
    {
      path: '/privacy',
      priority: 0.6,
      changefreq: 'monthly',
      lastmod: getCurrentDate(),
    },
  ];

  return {
    baseUrl,
    routes: routes || defaultRoutes,
    outputPath: SITEMAP_CONFIG.files.sitemap,
    robotsPath: SITEMAP_CONFIG.files.robots,
    xml: SITEMAP_CONFIG.xml,
    robots: SITEMAP_CONFIG.robots,
  };
}

/**
 * 验证Sitemap配置
 */
export function validateSitemapConfig(config) {
  const errors = [];

  // 验证基础URL
  if (!config.baseUrl || !config.baseUrl.startsWith('http')) {
    errors.push('无效的baseUrl');
  }

  // 验证路由
  if (!config.routes || !Array.isArray(config.routes) || config.routes.length === 0) {
    errors.push('routes不能为空');
  }

  // 验证每个路由
  config.routes?.forEach((route, index) => {
    if (!route.path) {
      errors.push(`路由${index}缺少path属性`);
    }
    if (typeof route.priority !== 'number' || route.priority < 0 || route.priority > 1) {
      errors.push(`路由${index}的priority必须在0-1之间`);
    }
    if (!route.changefreq) {
      errors.push(`路由${index}缺少changefreq属性`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 生成robots.txt内容
 */
export function generateRobotsContent(config) {
  const { robots } = config;
  const sitemapUrl = getSiteUrl(config.outputPath);

  let content = `User-agent: ${robots.userAgent}\n`;
  content += `Allow: ${robots.allow}\n`;

  if (robots.disallow && robots.disallow.length > 0) {
    robots.disallow.forEach(path => {
      content += `Disallow: ${path}\n`;
    });
  }

  if (robots.crawlDelay) {
    content += `Crawl-delay: ${robots.crawlDelay}\n`;
  }

  content += `\nSitemap: ${sitemapUrl}\n`;

  return content;
}
