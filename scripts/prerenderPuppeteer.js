#!/usr/bin/env node

import { RoutePrerenderer } from './prerender/RoutePrerenderer.js';
import { PRERENDER_CONFIG } from './buildConfig.js';

/**
 * Voidix网站SEO预渲染脚本
 * 使用Puppeteer预渲染所有页面以提升SEO效果
 */

async function main() {
  try {
    const prerenderer = new RoutePrerenderer(PRERENDER_CONFIG);
    const results = await prerenderer.start();

    const successful = results.filter(r => r.success);
    if (successful.length === results.length) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 预渲染过程出错:', error);
    process.exit(1);
  }
}

main();
