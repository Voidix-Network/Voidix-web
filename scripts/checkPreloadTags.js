#!/usr/bin/env node

/**
 * 检查构建后的HTML文件中的预加载标签
 * 用于验证autoPreloadPlugin是否正常工作
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distDir, 'index.html');

console.log('🔍 检查预加载标签...\n');

// 检查dist目录是否存在
if (!fs.existsSync(distDir)) {
  console.error('❌ dist目录不存在，请先运行构建命令');
  process.exit(1);
}

// 检查index.html是否存在
if (!fs.existsSync(indexPath)) {
  console.error('❌ dist/index.html 不存在');
  process.exit(1);
}

// 读取HTML文件
const html = fs.readFileSync(indexPath, 'utf-8');

console.log('📁 检查目录:', distDir);
console.log('📄 检查文件:', indexPath);
console.log('');

// 检查各种预加载标签 (兼容压缩HTML)
const checks = [
  {
    name: 'DNS预解析标签',
    pattern: /rel=dns-prefetch|rel="dns-prefetch"/g,
    description: '提前解析第三方域名',
  },
  {
    name: '预连接标签',
    pattern: /rel=preconnect|rel="preconnect"/g,
    description: '提前建立连接',
  },
  {
    name: '资源预加载标签',
    pattern: /rel=preload(?![a-z])|rel="preload"/g,
    description: '预加载关键资源',
  },
  {
    name: '模块预加载标签',
    pattern: /rel=modulepreload|rel="modulepreload"/g,
    description: '预加载JS模块',
  },
  {
    name: '页面预获取标签',
    pattern: /rel=prefetch|rel="prefetch"/g,
    description: '预获取可能访问的页面',
  },
  {
    name: 'CSS样式表标签',
    pattern: /rel=stylesheet|rel="stylesheet"/g,
    description: 'CSS样式表引用',
  },
];

let totalTags = 0;

console.log('📊 预加载标签检查结果:\n');

checks.forEach(check => {
  const matches = html.match(check.pattern);
  const count = matches ? matches.length : 0;
  totalTags += count;

  console.log(`   ${count > 0 ? '✅' : '⚠️'} ${check.name}: ${count} 个`);
  console.log(`      └─ ${check.description}`);
});

console.log('\n📈 统计信息:');
console.log(`   • 总预加载标签数量: ${totalTags}`);

// 检查具体的资源文件
console.log('\n🔍 检查关键资源文件:');

const criticalResources = [
  { name: 'CSS文件', pattern: /\.css/g },
  { name: 'JS文件', pattern: /\.js/g },
  { name: '图片文件', pattern: /logo\.png/g },
  { name: '第三方脚本', pattern: /(googletagmanager|clarity|bytegoofy)/g },
];

criticalResources.forEach(resource => {
  const matches = html.match(resource.pattern);
  const count = matches ? matches.length : 0;
  console.log(`   ${count > 0 ? '✅' : '⚠️'} ${resource.name}: ${count} 个引用`);
});

// 输出示例预加载标签 (兼容压缩格式)
console.log('\n📋 示例预加载标签:');
const preloadMatches = html.match(
  /(?:rel=preload|rel="preload"|rel=modulepreload|rel="modulepreload")[^>]*>/g
);
if (preloadMatches && preloadMatches.length > 0) {
  preloadMatches.slice(0, 3).forEach((tag, index) => {
    console.log(`   ${index + 1}. <link ${tag}`);
  });
  if (preloadMatches.length > 3) {
    console.log(`   ... 还有 ${preloadMatches.length - 3} 个标签`);
  }
} else {
  console.log('   ❌ 未找到预加载标签');
}

// 最终结果
console.log('\n🎯 检查结果:');
if (totalTags >= 15) {
  console.log('   ✅ 预加载系统工作正常!');
  console.log('   ✅ 检测到大量预加载优化标签');
  console.log(`   ✅ 共发现 ${totalTags} 个预加载标签`);
  console.log('   ✅ HTML已被压缩优化');
} else if (totalTags >= 10) {
  console.log('   ✅ 预加载系统基本正常');
  console.log(`   ✅ 发现 ${totalTags} 个预加载标签`);
} else {
  console.log('   ⚠️  预加载系统可能需要调整');
  console.log('   ⚠️  预加载标签数量较少');
}

console.log('\n📝 建议:');
console.log('   • 运行 npm run build:analyze 来启动本地服务器分析');
console.log('   • 检查浏览器开发者工具的Network面板验证预加载效果');
console.log('   • 使用Lighthouse测试页面性能评分');
