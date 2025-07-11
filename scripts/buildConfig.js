import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 构建配置模块
 * 统一管理所有构建相关的配置
 */

// 基础路径配置
export const BUILD_CONFIG = {
  // 项目根目录
  rootDir: path.resolve(__dirname, '..'),

  // 构建输出目录
  distDir: path.resolve(__dirname, '..', 'dist'),

  // 公共资源目录
  publicDir: path.resolve(__dirname, '..', 'public'),

  // 源代码目录
  srcDir: path.resolve(__dirname, '..', 'src'),
};

// 预渲染配置
export const PRERENDER_CONFIG = {
  // 服务器配置
  server: {
    port: 4173,
    host: 'localhost',
  },

  // 需要预渲染的路由
  routes: [
    { path: '/', outputDir: '' },
    { path: '/status', outputDir: 'status' },
    { path: '/faq', outputDir: 'faq' },
    { path: '/bug-report', outputDir: 'bug-report' },
    { path: '/privacy', outputDir: 'privacy' },
    { path: '/not-found', outputDir: 'not-found' },
  ],

  // 🔥 HTML终极压缩配置 - 平衡优化版
  htmlMinify: {
    // 保留的激进选项
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
    minifyCSS: true,
    minifyJS: true,

    // 为了兼容性而禁用的激进选项
    removeOptionalTags: false, // 保留</head>, <body>等，增强解析器兼容性
    removeAttributeQuotes: false, // 保留属性引号
    removeEmptyElements: false, // 保留空元素，以防万一
    caseSensitive: false,
    html5: true,
    collapseBooleanAttributes: false, // 保留布尔属性的完整形式
  },

  // Puppeteer 配置
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
    ],
  },

  // 渲染等待配置
  render: {
    waitTime: 3000, // 等待React渲染完成
    networkIdleTime: 500, // 网络空闲时间
    viewportWidth: 1920, // 视口宽度
    viewportHeight: 1080, // 视口高度
    timeout: 30000, // 页面加载超时
  },
};

// Sitemap配置
export const SITEMAP_CONFIG = {
  // 文件路径
  files: {
    sitemap: 'sitemap.xml',
    robots: 'robots.txt',
  },

  // XML配置
  xml: {
    declaration: '<?xml version="1.0" encoding="UTF-8"?>',
    namespace: 'http://www.sitemaps.org/schemas/sitemap/0.9',
    schemaLocation: 'http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd',
  },

  // Robots.txt配置
  robots: {
    userAgent: '*',
    allow: '/',
    disallow: ['/admin/', '/private/'],
    crawlDelay: 1,
  },
};
