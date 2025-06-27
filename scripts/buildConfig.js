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
  ],

  // HTML压缩配置 - SEO友好版本（移除注释但保持结构）
  htmlMinify: {
    // SEO友好的压缩设置，移除注释但保持可读性
    collapseWhitespace: false, // 不合并空白，保持文本可读性
    conservativeCollapse: false, // 禁用空白合并
    preserveLineBreaks: true, // 保留所有换行符
    removeComments: true, // 移除所有注释
    removeRedundantAttributes: false, // 保留所有属性
    removeScriptTypeAttributes: false, // 保留script类型属性
    removeStyleLinkTypeAttributes: false, // 保留样式链接类型属性
    minifyCSS: false, // 不压缩CSS
    minifyJS: false, // 不压缩JS
    useShortDoctype: true, // 使用短文档类型
    removeEmptyAttributes: false, // 保留空属性
    removeOptionalTags: false, // 保留所有可选标签
    caseSensitive: false,
    html5: true,
    // 保留重要的空白和格式
    ignoreCustomFragments: [/\{\{[\s\S]*?\}\}/, /<\?[\s\S]*?\?>/],
    removeAttributeQuotes: false, // 保留所有属性引号
    collapseBooleanAttributes: false, // 保留布尔属性完整格式
    // 移除所有注释，包括自定义注释
    ignoreCustomComments: [], // 不保留任何注释
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
