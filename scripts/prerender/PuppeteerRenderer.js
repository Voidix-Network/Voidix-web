import puppeteer from 'puppeteer';
import { createLogger } from '../utils/logger.js';
import { wait } from '../utils/serverUtils.js';

const logger = createLogger('PuppeteerRenderer');

/**
 * Puppeteer渲染器
 * 负责使用Puppeteer进行页面预渲染
 */
export class PuppeteerRenderer {
  constructor(config) {
    this.config = config;
    this.browser = null;
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

      // 设置视口
      await page.setViewport({
        width: this.config.render.viewportWidth,
        height: this.config.render.viewportHeight,
      });

      // 访问页面
      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: this.config.render.timeout,
      });

      // 等待React完全渲染
      await page.waitForSelector('#root', { timeout: 10000 });

      // 额外等待时间确保动态内容加载
      await wait(this.config.render.waitTime);

      // 获取完整的HTML内容
      const html = await page.content();

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
