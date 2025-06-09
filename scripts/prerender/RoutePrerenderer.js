import path from 'path';
import { PuppeteerRenderer } from './PuppeteerRenderer.js';
import { startStaticServer, stopServer } from '../utils/serverUtils.js';
import { writeFileSafe, getFileSize } from '../utils/fileUtils.js';
import { createLogger } from '../utils/logger.js';
import { BUILD_CONFIG } from '../buildConfig.js';

const logger = createLogger('RoutePrerenderer');

/**
 * 路由预渲染器
 * 整合静态服务器和Puppeteer渲染器，完成完整的预渲染流程
 */
export class RoutePrerenderer {
  constructor(config) {
    this.config = config;
    this.renderer = new PuppeteerRenderer(config);
    this.serverProcess = null;
    this.actualPort = null;
  }

  /**
   * 开始预渲染流程
   */
  async start() {
    logger.start('开始SEO预渲染流程');

    try {
      // 启动静态服务器
      const serverInfo = await startStaticServer(BUILD_CONFIG.distDir, this.config.server.port);
      this.serverProcess = serverInfo.process;
      this.actualPort = serverInfo.port;

      // 初始化Puppeteer浏览器
      const browserReady = await this.renderer.initBrowser();
      if (!browserReady) {
        throw new Error('Puppeteer浏览器初始化失败');
      }

      // 执行预渲染
      const results = await this.renderer.renderRoutes(this.config.routes, this.actualPort);

      // 保存预渲染结果
      const savedResults = await this.saveResults(results);

      // 输出结果摘要
      this.logSummary(savedResults);

      return savedResults;
    } catch (error) {
      logger.error('预渲染流程失败', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  /**
   * 保存预渲染结果到文件
   */
  async saveResults(results) {
    const savedResults = [];

    for (const result of results) {
      const outputPath = result.outputDir
        ? path.join(BUILD_CONFIG.distDir, result.outputDir, 'index.html')
        : path.join(BUILD_CONFIG.distDir, 'index.html');

      const success = writeFileSafe(outputPath, result.html);

      if (success) {
        const fileSize = getFileSize(outputPath);
        savedResults.push({
          route: result.route,
          outputPath,
          size: fileSize,
          success: true,
        });
        logger.success(`预渲染完成: ${result.route}`);
        logger.info(`  文件路径: ${outputPath}`);
        logger.info(`  HTML大小: ${fileSize} 字符`);
      } else {
        savedResults.push({
          route: result.route,
          outputPath,
          success: false,
        });
        logger.error(`保存失败: ${result.route}`);
      }
    }

    return savedResults;
  }

  /**
   * 输出预渲染结果摘要
   */
  logSummary(results) {
    logger.separator();
    logger.info('预渲染结果摘要:');
    logger.separator();

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    successful.forEach(result => {
      logger.info(`✅ ${result.route} → ${result.outputPath} (${result.size}字符)`);
    });

    if (failed.length > 0) {
      failed.forEach(result => {
        logger.error(`❌ ${result.route} → ${result.outputPath} (保存失败)`);
      });
    }

    logger.complete(`预渲染完成! 成功: ${successful.length}/${results.length}`);
  }

  /**
   * 清理资源
   */
  async cleanup() {
    // 关闭Puppeteer浏览器
    await this.renderer.closeBrowser();

    // 停止静态服务器
    if (this.serverProcess) {
      stopServer(this.serverProcess);
    }
  }
}
