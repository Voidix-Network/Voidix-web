import fs from 'fs';
import path from 'path';
import type { Plugin } from 'vite';
import { PageAssetOptimizer } from './pageAssetOptimizer';

/**
 * 🚀 Vite页面资源插件 - 自动生成page.min-[hash].css/js
 * 在构建过程中自动为每个页面生成专用的优化资源文件
 */
export function pageAssetsPlugin(options: any = {}): Plugin {
  return {
    name: 'vite-plugin-page-assets',

    // 在构建完成后运行
    async generateBundle(_outputOptions, _bundle) {
      console.log('🚀 [Page Assets] 开始生成页面专用资源...');

      const optimizer = new PageAssetOptimizer(options);

      try {
        // 生成页面专用资源文件
        const results = await optimizer.processAllPages();

        // 从结果中直接获取内容，不需要重新读取文件
        for (const result of results) {
          // 添加CSS文件到bundle - 从内存中获取内容
          this.emitFile({
            type: 'asset',
            fileName: `assets/${result.css.fileName}`,
            source: result.css.content
          });

          // 添加JS文件到bundle - 从内存中获取内容
          this.emitFile({
            type: 'asset',
            fileName: `assets/${result.js.fileName}`,
            source: result.js.content
          });
        }

        console.log(`✅ [Page Assets] 成功生成 ${results.length} 个页面的专用资源`);

      } catch (error) {
        console.error('❌ [Page Assets] 生成页面资源时出错:', error);
        throw error;
      }
    },

    // 使用新的API格式
    transformIndexHtml: {
      order: 'post',
      handler(html: string, context: any) {
        try {
          const mapPath = path.join(process.cwd(), 'dist', 'assets', 'page-assets-map.json');

          if (fs.existsSync(mapPath)) {
            const assetMap = JSON.parse(fs.readFileSync(mapPath, 'utf-8'));

            // 根据路径确定页面类型
            const pageName = detectPageName(context.path);

            if (assetMap.pages[pageName]) {
              const pageAssets = assetMap.pages[pageName];

              // 注入页面专用的CSS和JS
              const injectedTags = [
                `<!-- 🚀 ${pageName} 页面专用资源 -->`,
                `<link rel="stylesheet" href="${pageAssets.css}" />`,
                `<script src="${pageAssets.js}" defer></script>`
              ].join('\n    ');

              // 在head结束前注入
              html = html.replace('</head>', `    ${injectedTags}\n</head>`);

              console.log(`📄 [Page Assets] 已为 ${pageName} 注入专用资源`);
            }
          }
        } catch (error: any) {
          console.warn('⚠️ [Page Assets] 注入页面资源时出错:', error.message);
        }

        return html;
      }
    }
  };
}

// 检测页面名称的辅助函数
function detectPageName(path: string): string {
  const pageMap: Record<string, string> = {
    '/': 'HomePage',
    '/status': 'StatusPage',
    '/monitor': 'MonitorPage',
    '/faq': 'FaqPage',
    '/bug-report': 'BugReportPage',
    '/privacy': 'PrivacyPolicyPage'
  };

  return pageMap[path] || 'NotFoundPage';
}
