import { minify } from 'html-minifier-terser';
import puppeteer from 'puppeteer';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('PuppeteerRenderer');

/**
 * Puppeteer渲染器
 * 负责使用Puppeteer进行页面预渲染
 */
export class PuppeteerRenderer {
  constructor(config) {
    this.config = config;
    this.browser = null;

    // 🔥 HTML终极压缩配置 - 极限优化
    this.minifyOptions = {
      ...config.htmlMinify,
    };
  }

  /**
   * 初始化浏览器
   */
  async initBrowser() {
    try {
      logger.start('启动Puppeteer浏览器');
      this.browser = await puppeteer.launch(this.config.puppeteer);
      logger.success('Puppeteer浏览器启动成功');
      return true;
    } catch (error) {
      logger.error('Puppeteer浏览器启动失败', error);
      return false;
    }
  }

  /**
   * 预渲染单个路由
   */
  async renderRoute(route, serverPort) {
    const { path: routePath, outputDir } = route;
    const url = `http://localhost:${serverPort}${routePath}`;

    logger.step(`预渲染路由: ${routePath}`);

    try {
      const page = await this.browser.newPage();

      // 🚀 优化：禁用可能造成阻塞的功能
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        const resourceType = request.resourceType();
        // 阻止可能造成TBT的资源
        if (['websocket', 'eventsource', 'font', 'media', 'image'].includes(resourceType)) {
          request.abort();
        } else {
          request.continue();
        }
      });

      // 🚀 优化：注入环境变量，禁用WebSocket等
      await page.evaluateOnNewDocument(() => {
        // 禁用WebSocket连接
        window.PRERENDER_MODE = true;
        window.DISABLE_WEBSOCKET = true;

        // 模拟WebSocket以防止错误
        window.WebSocket = class MockWebSocket {
          constructor() {
            this.readyState = 3; // CLOSED
          }
          send() {}
          close() {}
          addEventListener() {}
          removeEventListener() {}
        };

        // 禁用一些可能阻塞的API
        window.fetch = () => Promise.resolve(new Response('{}'));

        // 加速定时器
        const originalSetTimeout = window.setTimeout;
        window.setTimeout = (fn, delay) => originalSetTimeout(fn, Math.min(delay, 100));
      });

      // 设置视口
      await page.setViewport({
        width: this.config.render.viewportWidth,
        height: this.config.render.viewportHeight,
      });

      // 🚀 优化：更快的页面加载策略
      await page.goto(url, {
        waitUntil: 'domcontentloaded', // 不等待所有资源加载
        timeout: this.config.render.timeout,
      });

      // 🚀 优化：等待React渲染完成但限制等待时间
      try {
        await page.waitForFunction(
          () => {
            // 检查React是否渲染完成，特别检查主要内容是否存在
            const root = document.querySelector('#root');
            if (!root || root.children.length === 0) return false;

            // 检查是否还在显示加载状态
            const loadingElement = document.querySelector('.loading-fade-in');
            if (loadingElement) return false;

            // 检查主要内容是否已渲染
            const mainContent = document.querySelector('main');
            if (!mainContent) return false;

            // 检查h1标签是否存在（为了SEO）
            const h1Element = document.querySelector('h1');
            if (!h1Element) return false;

            return true;
          },
          { timeout: 8000 } // 增加到8秒等待时间
        );

        // 额外等待一些动画完成
        await page.waitForTimeout(1000);

      } catch (timeoutError) {
        logger.warn(`等待渲染完成超时: ${routePath}, 继续使用当前状态`);

        // 超时后检查当前状态
        const hasH1 = await page.$('h1');
        if (!hasH1) {
          logger.error(`⚠️ 未检测到h1标签: ${routePath}`);
        }
      }

      // 获取初始的、包含骨架屏的HTML
      let html = await page.content();

      // 🔧 统一替换localhost URL为正确的域名
      html = this.replaceLocalhostUrls(html, serverPort);

      // 压缩HTML
      try {
        const minifiedHtml = await minify(html, this.minifyOptions);
        const originalSize = html.length;
        const minifiedSize = minifiedHtml.length;
        const compression = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);

        logger.info(`  HTML压缩: ${originalSize} → ${minifiedSize} 字符 (减少 ${compression}%)`);
        html = minifiedHtml;
      } catch (minifyError) {
        logger.warn(`HTML压缩失败，使用原始HTML: ${minifyError.message}`);
      }

      // 关闭页面
      await page.close();

      logger.success(`预渲染完成: ${routePath}`);

      return {
        route: routePath,
        outputDir,
        html,
        size: html.length,
      };
    } catch (error) {
      logger.error(`预渲染失败: ${routePath}`, error);
      return null;
    }
  }

  /**
   * 批量预渲染路由
   */
  async renderRoutes(routes, serverPort) {
    const results = [];

    for (const route of routes) {
      const result = await this.renderRoute(route, serverPort);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  /**
   * 替换HTML中的localhost URL为正确的域名
   */
  replaceLocalhostUrls(html, serverPort) {
    try {
      const localhostPattern = new RegExp(`http://localhost:${serverPort}`, 'g');
      const localhostWithoutPortPattern = /http:\/\/localhost/g;

      // 替换包含端口的localhost URL
      html = html.replace(localhostPattern, 'https://www.voidix.net');

      // 替换不包含端口的localhost URL
      html = html.replace(localhostWithoutPortPattern, 'https://www.voidix.net');

      logger.info(`  URL替换: localhost → www.voidix.net`);

      return html;
    } catch (error) {
      logger.warn(`URL替换失败: ${error.message}`);
      return html;
    }
  }

  /**
   * 关闭浏览器
   */
  async closeBrowser() {
    try {
      if (this.browser) {
        await this.browser.close();
        logger.success('Puppeteer浏览器已关闭');
      }
    } catch (error) {
      logger.error('关闭Puppeteer浏览器失败', error);
    }
  }
}
