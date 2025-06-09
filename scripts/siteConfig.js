/**
 * Voidix网站全局配置
 * 集中管理网站的基础信息和构建配置
 */

export const SITE_CONFIG = {
  // 网站基础信息
  name: 'Voidix',
  description: 'Voidix Minecraft服务器 - 专业的游戏体验平台',
  baseUrl: 'https://www.voidix.net',
  domain: 'www.voidix.net',

  // 构建配置
  build: {
    outputDir: 'dist',
    assetsDir: 'assets',
  },

  // 服务器配置
  server: {
    defaultPort: 4173,
    host: 'localhost',
  },

  // SEO配置
  seo: {
    defaultChangefreq: 'weekly',
    defaultPriority: 0.8,
    homePriority: 1.0,
  },
};

/**
 * 获取完整的站点URL
 */
export function getSiteUrl(path = '') {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_CONFIG.baseUrl}${cleanPath}`;
}

/**
 * 获取当前日期字符串 (ISO格式)
 */
export function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}
