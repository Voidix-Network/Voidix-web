import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.resolve(__dirname, '../src/components/seo/seoConfig.json');
const PAGE_KEYWORDS_CONFIG = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

console.log(`📖 Loaded ${Object.keys(PAGE_KEYWORDS_CONFIG).length} page configs from seoConfig.json`);

// 查找Vite构建后的实际入口文件
function findBuildAssets() {
  const assetsDir = path.resolve(__dirname, '../dist/assets');
  if (!fs.existsSync(assetsDir)) {
    throw new Error('❌ dist/assets directory not found. Please run vite build first!');
  }

  const files = fs.readdirSync(assetsDir);
  const jsEntry = files.find(f => f.startsWith('index-') && f.endsWith('.js'));
  const cssEntry = files.find(f => f.startsWith('index-') && f.endsWith('.css'));

  if (!jsEntry) {
    throw new Error('❌ Could not find entry JS file in dist/assets/');
  }

  console.log(`🔍 Found build assets: ${jsEntry}${cssEntry ? ', ' + cssEntry : ''}`);

  return {
    js: `/assets/${jsEntry}`,
    css: cssEntry ? `/assets/${cssEntry}` : null
  };
}

function generateHTML(pageKey, config, assets) {
  const keywords = Array.isArray(config.keywords) ? config.keywords.join(',') : '';
  const url = `https://www.voidix.net${pageKey === 'home' ? '/' : '/' + pageKey}`;

  // 面包屑导航结构化数据
  const breadcrumbSchema = pageKey !== 'home' ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {"@type": "ListItem", "position": 1, "name": "首页", "item": "https://www.voidix.net/"},
      {"@type": "ListItem", "position": 2, "name": config.title.split('|')[0].trim(), "item": url}
    ]
  } : null;

  // 组织信息结构化数据
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Voidix Minecraft Server",
    "alternateName": "Voidix",
    "url": "https://www.voidix.net",
    "logo": "https://www.voidix.net/logo.png",
    "description": "公益、公平、包容的Minecraft服务器",
    "foundingDate": "2025",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "Chinese"
    }
  };

  // 网站信息结构化数据
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Voidix",
    "url": "https://www.voidix.net",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.voidix.net/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  // 网页信息结构化数据
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": config.title,
    "description": config.description,
    "url": url,
    "inLanguage": "zh-CN",
    "isPartOf": {
      "@type": "WebSite",
      "url": "https://www.voidix.net"
    }
  };

  const schemas = [organizationSchema, websiteSchema, webPageSchema];
  if (breadcrumbSchema) schemas.push(breadcrumbSchema);

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Primary Meta Tags -->
  <title>${config.title}</title>
  <meta name="title" content="${config.title}">
  <meta name="description" content="${config.description}">
  <meta name="keywords" content="${keywords}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${config.title}">
  <meta property="og:description" content="${config.description}">
  <meta property="og:image" content="https://www.voidix.net/logo.png">
  <meta property="og:site_name" content="Voidix">
  <meta property="og:locale" content="zh_CN">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${url}">
  <meta name="twitter:title" content="${config.title}">
  <meta name="twitter:description" content="${config.description}">
  <meta name="twitter:image" content="https://www.voidix.net/logo.png">

  <!-- Additional Meta -->
  <meta name="author" content="Voidix Team">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <meta name="googlebot" content="index, follow">
  <meta name="bingbot" content="index, follow">
  <meta name="language" content="zh-CN">
  <meta name="geo.region" content="CN">
  <meta name="geo.country" content="China">
  <meta name="format-detection" content="telephone=no">
  <meta name="theme-color" content="#151f38">
  <meta name="msapplication-TileColor" content="#151f38">

  <!-- Canonical URL -->
  <link rel="canonical" href="${url}">

  <!-- Icons -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">
  <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">
  <link rel="manifest" href="/site.webmanifest">

  <!-- Structured Data -->
  ${schemas.map(s => `<script type="application/ld+json">${JSON.stringify(s, null, 2)}</script>`).join('\n  ')}

  <!-- Preconnect to improve performance -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="dns-prefetch" href="https://fonts.googleapis.com">

  <!-- Vite Build Assets -->
  ${assets.css ? `<link rel="stylesheet" href="${assets.css}">` : ''}
  <script type="module" src="${assets.js}"></script>
</head>
<body>
  <div id="root"></div>
</body>
</html>`;
}

function generateAllPages() {
  const distDir = path.resolve(__dirname, '../dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // 查找构建后的实际资源文件
  const assets = findBuildAssets();

  Object.entries(PAGE_KEYWORDS_CONFIG).forEach(([pageKey, config]) => {
    const html = generateHTML(pageKey, config, assets);
    if (pageKey === 'home') {
      fs.writeFileSync(path.join(distDir, 'index.html'), html);
      console.log('✓ Generated index.html');
    } else {
      const pageDir = path.join(distDir, pageKey);
      if (!fs.existsSync(pageDir)) {
        fs.mkdirSync(pageDir, { recursive: true });
      }
      fs.writeFileSync(path.join(pageDir, 'index.html'), html);
      console.log(`✓ Generated ${pageKey}/index.html`);
    }
  });

  console.log('\n✅ All static pages generated with full SEO!');
  console.log('📋 Included: Meta tags, Open Graph, Twitter Cards, Structured Data (Organization, Website, WebPage, Breadcrumbs)');
  console.log(`🚀 Using build assets: ${assets.js}${assets.css ? ', ' + assets.css : ''}`);
}

generateAllPages();
