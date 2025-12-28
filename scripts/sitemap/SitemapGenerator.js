import path from 'path';
import { BUILD_CONFIG } from '../buildConfig.js';
import { writeFileSafe } from '../utils/fileUtils.js';
import { createLogger } from '../utils/logger.js';
import {
  createSitemapConfig,
  generateRobotsContent,
  validateSitemapConfig,
} from './SitemapConfig.js';

const logger = createLogger('SitemapGenerator');

/**
 * XML Sitemap生成器
 * 负责生成符合标准的XML sitemap文件
 */
export class SitemapGenerator {
  constructor(config = null) {
    this.config = config || createSitemapConfig();
  }

  /**
   * 验证配置
   */
  validateConfig() {
    const validation = validateSitemapConfig(this.config);

    if (!validation.isValid) {
      logger.error('Sitemap配置验证失败:');
      validation.errors.forEach(error => logger.error(`  - ${error}`));
      return false;
    }

    logger.success('Sitemap配置验证通过');
    return true;
  }

  /**
   * 生成XML Sitemap内容
   */
  generateSitemapXml() {
    const urls = this.config.routes
      .map(route => {
        const url = {
          loc: `${this.config.baseUrl}${route.path}`,
          lastmod: route.lastmod,
          changefreq: route.changefreq,
          priority: route.priority,
        };
        return this.formatSitemapUrl(url);
      })
      .join('\n');

    const { declaration, namespace, schemaLocation } = this.config.xml;

    return `${declaration}
<urlset xmlns="${namespace}"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="${namespace} ${schemaLocation}">
${urls}
</urlset>`;
  }

  /**
   * 格式化单个URL条目
   */
  formatSitemapUrl(url) {
    return `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority.toFixed(1)}</priority>
  </url>`;
  }

  /**
   * 生成并保存Sitemap文件
   */
  generateSitemapFile() {
    try {
      const xml = this.generateSitemapXml();
      const outputPath = path.join(BUILD_CONFIG.distDir, this.config.outputPath);

      const success = writeFileSafe(outputPath, xml);

      if (success) {
        logger.success(`Sitemap生成成功: ${outputPath}`);
        logger.info(`包含${this.config.routes.length}个URL`);
        logger.info(`基础URL: ${this.config.baseUrl}`);
        return outputPath;
      } else {
        throw new Error('文件写入失败');
      }
    } catch (error) {
      logger.error('Sitemap生成失败', error);
      return null;
    }
  }

  /**
   * 生成robots.txt内容
   */
  generateRobotsContent() {
    return generateRobotsContent(this.config);
  }

  /**
   * 生成并保存robots.txt文件
   */
  generateRobotsFile(targetDir = null) {
    try {
      const content = this.generateRobotsContent();
      const outputPath = targetDir
        ? path.join(targetDir, this.config.robotsPath)
        : path.join(BUILD_CONFIG.distDir, this.config.robotsPath);

      const success = writeFileSafe(outputPath, content);

      if (success) {
        logger.success(`Robots.txt生成成功: ${outputPath}`);
        return outputPath;
      } else {
        throw new Error('文件写入失败');
      }
    } catch (error) {
      logger.error('Robots.txt生成失败', error);
      return null;
    }
  }

  /**
   * 同时生成sitemap.xml和robots.txt
   */
  generateAll() {
    logger.start('开始生成Sitemap和Robots.txt');

    // 验证配置
    if (!this.validateConfig()) {
      return false;
    }

    const results = {
      sitemap: null,
      robots: null,
      publicRobots: null,
    };

    // 生成sitemap.xml
    logger.step('生成sitemap.xml');
    results.sitemap = this.generateSitemapFile();

    // 生成robots.txt到dist目录
    logger.step('生成robots.txt');
    results.robots = this.generateRobotsFile();

    // 同时在public目录生成robots.txt（开发环境使用）
    results.publicRobots = this.generateRobotsFile(BUILD_CONFIG.publicDir);
    logger.success(`Public Robots.txt更新成功: ${results.publicRobots}`);

    return results;
  }
}
