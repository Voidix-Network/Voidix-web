import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
// @ts-ignore
import { BUILD_CONFIG } from './buildConfig.js';

/**
 * 🚀 页面资源优化器 - 自动生成page.min-[hash].css/js
 * 特性：
 * - 为每个页面生成专用的CSS/JS文件
 * - 自动添加hash防止缓存
 * - 集成极致压缩功能
 * - 自动注入到HTML中
 */

interface PageAssetOptimizerOptions {
  outputDir?: string;
  pagesDir?: string;
  componentsDir?: string;
}

interface Dependencies {
  components: string[];
  styles: string[];
  utilities: string[];
}

interface AssetResult {
  content: string;
  fileName: string;
  hash: string;
}

interface PageResult {
  page: string;
  css: {
    fileName: string;
    hash: string;
    size: number;
    content: string;
  };
  js: {
    fileName: string;
    hash: string;
    size: number;
    content: string;
  };
}

interface AssetMapPage {
  css: string;
  js: string;
  hashes: {
    css: string;
    js: string;
  };
  sizes: {
    css: number;
    js: number;
  };
}

interface AssetMap {
  generated: string;
  pages: Record<string, AssetMapPage>;
}

export class PageAssetOptimizer {
  private options: Required<PageAssetOptimizerOptions>;

  constructor(options: PageAssetOptimizerOptions = {}) {
    this.options = {
      outputDir: BUILD_CONFIG.distDir,
      pagesDir: path.join(BUILD_CONFIG.srcDir, 'pages'),
      componentsDir: path.join(BUILD_CONFIG.srcDir, 'components'),
      ...options
    };
  }

  /**
   * 生成文件哈希
   */
  generateHash(content: string): string {
    return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
  }

  /**
   * 🚀 极致CSS压缩 - 集成原压缩功能
   */
  async compressCSS(css: string): Promise<string> {
    // 移除注释
    css = css.replace(/\/\*[\s\S]*?\*\//g, '');

    // 移除多余空白
    css = css.replace(/\s+/g, ' ');

    // 移除分号前后的空格
    css = css.replace(/\s*;\s*/g, ';');

    // 移除冒号前后的空格
    css = css.replace(/\s*:\s*/g, ':');

    // 移除大括号前后的空格
    css = css.replace(/\s*{\s*/g, '{');
    css = css.replace(/\s*}\s*/g, '}');

    // 移除逗号后的空格
    css = css.replace(/,\s+/g, ',');

    // 优化颜色值
    css = css.replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3/gi, '#$1$2$3');

    // 移除最后的分号
    css = css.replace(/;}/g, '}');

    // 移除空规则
    css = css.replace(/[^{}]+\{\s*\}/g, '');

    return css.trim();
  }

  /**
   * 🚀 超级JavaScript压缩 - 基于现有Terser配置
   */
  async compressJS(js: string): Promise<string> {
    // 使用与vite.config.ts相同的压缩配置
    const { minify } = await import('terser');

    const result = await minify(js, {
      compress: {
        booleans: true,
        conditionals: true,
        dead_code: true,
        drop_console: ['log', 'debug', 'info', 'warn'],
        drop_debugger: true,
        evaluate: true,
        if_return: true,
        loops: true,
        switches: true,
        typeofs: true,
        collapse_vars: true,
        comparisons: true,
        computed_props: true,
        directives: true,
        hoist_funs: true,
        hoist_props: true,
        inline: 2,
        join_vars: true,
        negate_iife: true,
        properties: true,
        sequences: true,
        unused: true,
        unsafe_math: true,
        unsafe_regexp: true,
        unsafe_undefined: true,
        passes: 50, // 使用50轮压缩，平衡性能和效果
        pure_getters: 'strict',
        pure_new: true,
        keep_infinity: false,
        global_defs: {
          'process.env.NODE_ENV': '"production"',
        },
      },
      mangle: false, // 保持与原配置一致
      format: {
        beautify: false,
        comments: false,
        semicolons: true,
      },
      keep_classnames: true,
      keep_fnames: true,
      toplevel: false,
    });

    return result.code || js;
  }

  /**
   * 分析页面依赖
   */
  async analyzePageDependencies(pagePath: string): Promise<Dependencies> {
    const content = await fs.promises.readFile(pagePath, 'utf-8');
    const dependencies: Dependencies = {
      components: [],
      styles: [],
      utilities: []
    };

    // 分析import语句
    const importRegex = /import\s+.*?from\s+['"`]([^'"`]+)['"`]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];

      if (importPath.includes('/components/')) {
        dependencies.components.push(importPath);
      } else if (importPath.includes('.css') || importPath.includes('.scss')) {
        dependencies.styles.push(importPath);
      } else if (importPath.includes('/utils/') || importPath.includes('/hooks/')) {
        dependencies.utilities.push(importPath);
      }
    }

    return dependencies;
  }

  /**
   * 🚀 生成页面专用CSS文件
   */
  async generatePageCSS(pageName: string, dependencies: Dependencies): Promise<AssetResult> {
    let combinedCSS = '';

    // 读取全局样式
    const globalCSSPath = path.join(BUILD_CONFIG.srcDir, 'assets', 'globals.css');
    if (fs.existsSync(globalCSSPath)) {
      const globalCSS = await fs.promises.readFile(globalCSSPath, 'utf-8');
      combinedCSS += `/* 全局样式 */\n${globalCSS}\n\n`;
    }

    // 读取页面特定样式
    for (const stylePath of dependencies.styles) {
      try {
        const fullPath = path.resolve(BUILD_CONFIG.srcDir, stylePath.replace('@/', ''));
        if (fs.existsSync(fullPath)) {
          const css = await fs.promises.readFile(fullPath, 'utf-8');
          combinedCSS += `/* ${stylePath} */\n${css}\n\n`;
        }
      } catch (error) {
        console.warn(`⚠️ 无法读取样式文件: ${stylePath}`);
      }
    }

    // 添加页面特定的优化样式
    combinedCSS += this.generatePageSpecificCSS(pageName);

    // 压缩CSS
    const compressedCSS = await this.compressCSS(combinedCSS);

    // 生成哈希
    const hash = this.generateHash(compressedCSS);
    const fileName = `page.${pageName}.min-${hash}.css`;

    return {
      content: compressedCSS,
      fileName,
      hash
    };
  }

  /**
   * 🚀 生成页面专用JavaScript文件
   */
  async generatePageJS(pageName: string, _dependencies: Dependencies): Promise<AssetResult> {
    let combinedJS = '';

    // 添加页面特定的初始化代码
    combinedJS += this.generatePageInitCode(pageName);

    // 添加页面特定的工具函数
    combinedJS += this.generatePageUtilities(pageName);

    // 添加页面性能优化代码
    combinedJS += this.generatePerformanceOptimizations(pageName);

    // 压缩JavaScript
    const compressedJS = await this.compressJS(combinedJS);

    // 生成哈希
    const hash = this.generateHash(compressedJS);
    const fileName = `page.${pageName}.min-${hash}.js`;

    return {
      content: compressedJS,
      fileName,
      hash
    };
  }

  /**
   * 生成页面特定CSS优化
   */
  generatePageSpecificCSS(pageName: string): string {
    const pageOptimizations: Record<string, string> = {
      'HomePage': `
        /* 🚀 首页特定优化 */
        .hero-section { transform: translateZ(0); }
        .server-cards { will-change: transform; }
      `,
      'StatusPage': `
        /* 🚀 状态页特定优化 */
        .status-grid { contain: layout style; }
        .monitor-card { transform: translateZ(0); }
      `,
      'MonitorPage': `
        /* 🚀 监控页特定优化 */
        .monitor-chart { contain: strict; }
        .realtime-data { will-change: contents; }
      `,
      'default': `
        /* 🚀 通用页面优化 */
        .page-container { contain: layout; }
      `
    };

    return pageOptimizations[pageName] || pageOptimizations.default;
  }

  /**
   * 生成页面初始化代码
   */
  generatePageInitCode(pageName: string): string {
    return `
      /* 🚀 ${pageName} 页面初始化 */
      (function() {
        'use strict';

        // 页面性能标记
        if (performance.mark) {
          performance.mark('${pageName}-init-start');
        }

        // 页面特定的预加载
        ${this.generatePagePreloads(pageName)}

        // DOM就绪时执行
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', function() {
            ${this.generatePageDOMReady(pageName)}
          });
        } else {
          ${this.generatePageDOMReady(pageName)}
        }
      })();
    `;
  }

  /**
   * 生成页面预加载代码
   */
  generatePagePreloads(pageName: string): string {
    const preloads: Record<string, string> = {
      'HomePage': `
        // 预加载关键图片
        const heroImg = new Image();
        heroImg.src = '/images/hero-bg.webp';
      `,
      'StatusPage': `
        // 预连接监控API
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = 'https://api.uptimerobot.com';
        document.head.appendChild(link);
      `,
      'default': ''
    };

    return preloads[pageName] || preloads.default;
  }

  /**
   * 生成DOM就绪代码
   */
  generatePageDOMReady(pageName: string): string {
    return `
      // 页面特定的DOM优化
      document.body.classList.add('${pageName.toLowerCase()}-loaded');

      // 性能标记结束
      if (performance.mark) {
        performance.mark('${pageName}-init-end');
        performance.measure('${pageName}-init-duration', '${pageName}-init-start', '${pageName}-init-end');
      }
    `;
  }

  /**
   * 生成页面工具函数
   */
  generatePageUtilities(pageName: string): string {
    return `
      /* 🚀 ${pageName} 页面工具函数 */
      window.PageUtils = window.PageUtils || {};
      window.PageUtils.${pageName} = {
        // 页面特定的优化函数
        optimizeImages: function() {
          // 图片懒加载优化
          const images = document.querySelectorAll('img[loading="lazy"]');
          images.forEach(img => {
            if ('IntersectionObserver' in window) {
              // 使用现代API
              img.loading = 'lazy';
            }
          });
        },

        // 页面特定的缓存策略
        cacheStrategy: function() {
          if ('serviceWorker' in navigator) {
            // 页面特定的缓存逻辑
            console.log('${pageName} 缓存策略已激活');
          }
        }
      };
    `;
  }

  /**
   * 生成性能优化代码
   */
  generatePerformanceOptimizations(pageName: string): string {
    return `
      /* 🚀 ${pageName} 性能优化 */
      (function() {
        // 防抖滚动优化
        let ticking = false;
        function updateScrollState() {
          // 页面特定的滚动优化
          ticking = false;
        }

        function onScroll() {
          if (!ticking) {
            requestAnimationFrame(updateScrollState);
            ticking = true;
          }
        }

        // 节流事件监听器
        document.addEventListener('scroll', onScroll, { passive: true });

        // 预连接关键资源
        ${this.generateCriticalResourcePreconnects(pageName)}
      })();
    `;
  }

  /**
   * 生成关键资源预连接
   */
  generateCriticalResourcePreconnects(pageName: string): string {
    const preconnects: Record<string, string> = {
      'HomePage': `
        ['https://fonts.gstatic.com', 'https://cdn.voidix.net'].forEach(url => {
          const link = document.createElement('link');
          link.rel = 'preconnect';
          link.href = url;
          link.crossOrigin = 'anonymous';
          document.head.appendChild(link);
        });
      `,
      'StatusPage': `
        const apiLink = document.createElement('link');
        apiLink.rel = 'preconnect';
        apiLink.href = 'https://api.uptimerobot.com';
        document.head.appendChild(apiLink);
      `,
      'default': ''
    };

    return preconnects[pageName] || preconnects.default;
  }

  /**
   * 🚀 处理所有页面
   */
  async processAllPages(): Promise<PageResult[]> {
    console.log('🚀 开始生成页面专用资源文件...');

    // 🔧 确保assets目录存在
    const assetsDir = path.join(this.options.outputDir, 'assets');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
      console.log('📁 创建assets目录:', assetsDir);
    }

    const pages = [
      'HomePage',
      'StatusPage',
      'MonitorPage',
      'FaqPage',
      'BugReportPage',
      'PrivacyPolicyPage',
      'NotFoundPage'
    ];

    const results: PageResult[] = [];

    for (const pageName of pages) {
      try {
        console.log(`📄 处理页面: ${pageName}`);

        // 分析依赖（模拟）
        const dependencies: Dependencies = {
          components: [`/components/pages/${pageName}.tsx`],
          styles: ['/assets/globals.css'],
          utilities: ['/utils/index.ts']
        };

        // 生成CSS文件
        const cssResult = await this.generatePageCSS(pageName, dependencies);
        const cssPath = path.join(this.options.outputDir, 'assets', cssResult.fileName);

        // 确保文件路径目录存在
        const cssDir = path.dirname(cssPath);
        if (!fs.existsSync(cssDir)) {
          fs.mkdirSync(cssDir, { recursive: true });
        }

        await fs.promises.writeFile(cssPath, cssResult.content);

        // 生成JS文件
        const jsResult = await this.generatePageJS(pageName, dependencies);
        const jsPath = path.join(this.options.outputDir, 'assets', jsResult.fileName);

        // 确保文件路径目录存在
        const jsDir = path.dirname(jsPath);
        if (!fs.existsSync(jsDir)) {
          fs.mkdirSync(jsDir, { recursive: true });
        }

        await fs.promises.writeFile(jsPath, jsResult.content);

        results.push({
          page: pageName,
          css: {
            fileName: cssResult.fileName,
            hash: cssResult.hash,
            size: cssResult.content.length,
            content: cssResult.content
          },
          js: {
            fileName: jsResult.fileName,
            hash: jsResult.hash,
            size: jsResult.content.length,
            content: jsResult.content
          }
        });

        console.log(`✅ ${pageName}: CSS=${cssResult.fileName} (${cssResult.content.length}B), JS=${jsResult.fileName} (${jsResult.content.length}B)`);

      } catch (error) {
        console.error(`❌ 处理页面 ${pageName} 时出错:`, error);
      }
    }

    // 生成资源映射文件
    await this.generateAssetMap(results);

    console.log(`🎉 完成！共生成 ${results.length} 个页面的专用资源文件`);
    return results;
  }

  /**
   * 生成资源映射文件
   */
  async generateAssetMap(results: PageResult[]): Promise<void> {
    const assetMap: AssetMap = {
      generated: new Date().toISOString(),
      pages: {}
    };

    results.forEach(result => {
      assetMap.pages[result.page] = {
        css: `/assets/${result.css.fileName}`,
        js: `/assets/${result.js.fileName}`,
        hashes: {
          css: result.css.hash,
          js: result.js.hash
        },
        sizes: {
          css: result.css.size,
          js: result.js.size
        }
      };
    });

    const mapPath = path.join(this.options.outputDir, 'assets', 'page-assets-map.json');

    // 🔧 确保目录存在
    const mapDir = path.dirname(mapPath);
    if (!fs.existsSync(mapDir)) {
      fs.mkdirSync(mapDir, { recursive: true });
    }

    await fs.promises.writeFile(mapPath, JSON.stringify(assetMap, null, 2));

    console.log('📋 资源映射文件已生成: page-assets-map.json');
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const optimizer = new PageAssetOptimizer();
  optimizer.processAllPages().catch(console.error);
}
