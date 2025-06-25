const fs = require('fs');
const path = require('path');

/**
 * 测试压缩功能的脚本
 */
async function testCompression() {
  console.log('🧪 测试压缩功能...\n');

  // 创建测试目录
  const testDir = path.join(__dirname, '../test-compression');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }

  // 创建测试文件
  const testFiles = [
    {
      name: 'test.js',
      content: `
// 这是一个测试 JavaScript 文件
function testFunction() {
  const data = {
    message: "这是一个测试文件，用于验证压缩功能是否正常工作。",
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    nested: {
      level1: {
        level2: {
          value: "深层嵌套的数据"
        }
      }
    }
  };

  console.log("测试数据:", data);
  return data;
}

// 重复内容以增加文件大小
${Array(50).fill('// 这是重复的注释内容用于增加文件大小').join('\n')}

export default testFunction;
      `.trim()
    },
    {
      name: 'test.css',
      content: `
/* 测试 CSS 文件 */
.test-container {
  width: 100%;
  height: 100vh;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Arial', sans-serif;
}

.test-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

/* 重复样式以增加文件大小 */
${Array(30).fill('.test-item-').map((cls, i) => `
${cls}${i} {
  margin: 1rem;
  padding: 0.5rem;
  background: #f0f0f0;
  border: 1px solid #ddd;
}
`).join('')}
      `.trim()
    },
    {
      name: 'test.html',
      content: `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>压缩测试页面</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 2rem; }
    .container { max-width: 800px; margin: 0 auto; }
  </style>
</head>
<body>
  <div class="container">
    <h1>压缩功能测试页面</h1>
    <p>这是一个用于测试各种压缩格式的 HTML 文件。</p>

    ${Array(20).fill('<p>这是重复的段落内容，用于增加文件大小并测试压缩效果。</p>').join('\n    ')}

    <script>
      console.log('测试页面加载完成');
    </script>
  </div>
</body>
</html>
      `.trim()
    },
    {
      name: 'test.json',
      content: JSON.stringify({
        name: "压缩测试数据",
        description: "这是一个用于测试 JSON 文件压缩的测试数据",
        data: Array(100).fill({
          id: Math.random().toString(36),
          name: "测试项目",
          value: Math.random() * 1000,
          description: "这是一个测试项目的描述信息"
        }),
        metadata: {
          created: new Date().toISOString(),
          version: "1.0.0",
          tags: ["test", "compression", "json"]
        }
      }, null, 2)
    }
  ];

  // 写入测试文件
  for (const file of testFiles) {
    const filePath = path.join(testDir, file.name);
    await fs.promises.writeFile(filePath, file.content);
    console.log(`✓ 创建测试文件: ${file.name} (${(file.content.length / 1024).toFixed(2)} KB)`);
  }

  console.log('\n🗜️  开始压缩测试...\n');

  // 使用压缩模块
  const SimpleAssetCompressor = require('./compressAssetsSimple.cjs');
  const compressor = new SimpleAssetCompressor(testDir);

  try {
    await compressor.compressAll();
    await compressor.generateReport();

    console.log('\n📋 压缩结果验证:');

    // 验证压缩文件是否生成
    for (const file of testFiles) {
      const originalFile = path.join(testDir, file.name);
      const gzipFile = originalFile + '.gz';
      const brotliFile = originalFile + '.br';
      const zstdFile = originalFile + '.zst';

      console.log(`\n📄 ${file.name}:`);

      const originalStats = await fs.promises.stat(originalFile);
      console.log(`  原始文件: ${(originalStats.size / 1024).toFixed(2)} KB`);

      if (fs.existsSync(gzipFile)) {
        const gzipStats = await fs.promises.stat(gzipFile);
        const gzipRatio = ((originalStats.size - gzipStats.size) / originalStats.size * 100);
        console.log(`  Gzip: ${(gzipStats.size / 1024).toFixed(2)} KB (${gzipRatio.toFixed(1)}% 压缩)`);
      }

      if (fs.existsSync(brotliFile)) {
        const brotliStats = await fs.promises.stat(brotliFile);
        const brotliRatio = ((originalStats.size - brotliStats.size) / originalStats.size * 100);
        console.log(`  Brotli: ${(brotliStats.size / 1024).toFixed(2)} KB (${brotliRatio.toFixed(1)}% 压缩)`);
      }

      if (fs.existsSync(zstdFile)) {
        const zstdStats = await fs.promises.stat(zstdFile);
        const zstdRatio = ((originalStats.size - zstdStats.size) / originalStats.size * 100);
        console.log(`  Zstd (模拟): ${(zstdStats.size / 1024).toFixed(2)} KB (${zstdRatio.toFixed(1)}% 压缩)`);
      }
    }

    console.log('\n✅ 压缩功能测试完成!');
    console.log(`📁 测试文件位于: ${testDir}`);
    console.log('💡 您可以查看生成的压缩文件和报告');

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
  }
}

// 清理测试文件的函数
async function cleanupTest() {
  const testDir = path.join(__dirname, '../test-compression');
  if (fs.existsSync(testDir)) {
    const files = await fs.promises.readdir(testDir);
    for (const file of files) {
      await fs.promises.unlink(path.join(testDir, file));
    }
    fs.rmdirSync(testDir);
    console.log('🧹 清理测试文件完成');
  }
}

// 命令行参数处理
const args = process.argv.slice(2);
if (args.includes('--cleanup')) {
  cleanupTest().catch(console.error);
} else {
  testCompression().catch(console.error);
}

module.exports = { testCompression, cleanupTest };
