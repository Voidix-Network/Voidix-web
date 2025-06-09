import { SitemapGenerator } from './sitemap/SitemapGenerator.js';
import { createSitemapConfig } from './sitemap/SitemapConfig.js';

/**
 * Voidix网站Sitemap和Robots.txt自动生成脚本
 * 在构建过程中自动生成搜索引擎友好的文件
 */

async function main() {
  try {
    // 创建Sitemap配置
    const config = createSitemapConfig('https://www.voidix.net');

    // 创建生成器实例并执行生成
    const generator = new SitemapGenerator(config);
    const results = generator.generateAll();

    if (results.sitemap && results.robots) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Sitemap生成过程出错:', error);
    process.exit(1);
  }
}

main();
