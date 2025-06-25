const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { promisify } = require('util');

// 简化的资源压缩工具
// 使用 Node.js 内置的 zlib 模块进行压缩
class SimpleAssetCompressor {
  constructor(distDir = 'dist') {
    this.distDir = distDir;
    this.supportedExtensions = ['.js', '.css', '.html', '.xml', '.txt', '.svg', '.json'];
    // 预渲染路由配置 - 需要特别处理的 HTML 文件
    this.prerenderRoutes = ['status', 'faq', 'bug-report', 'privacy'];
  }

  /**
   * 递归获取所有符合条件的文件
   */
  async getFilesToCompress(dir) {
    const files = [];

    const readDir = async (currentDir) => {
      try {
        const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry.name);

          if (entry.isDirectory()) {
            await readDir(fullPath);
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name);
            if (this.supportedExtensions.includes(ext)) {
              const stats = await fs.promises.stat(fullPath);
              // 只压缩大于 1KB 的文件
              if (stats.size > 1024) {
                files.push(fullPath);
              }
            }
          }
        }
      } catch (error) {
        console.warn(`无法读取目录 ${currentDir}: ${error.message}`);
      }
    };

    await readDir(dir);
    return files;
  }

  /**
   * 检查并压缩预渲染的 HTML 文件
   */
  async compressPrerenderFiles() {
    console.log('🔍 检查预渲染 HTML 文件...');

    const prerenderFiles = [];
    for (const route of this.prerenderRoutes) {
      const htmlFile = path.join(this.distDir, route, 'index.html');
      if (fs.existsSync(htmlFile)) {
        const stats = await fs.promises.stat(htmlFile);
        if (stats.size > 1024) {
          prerenderFiles.push(htmlFile);
          console.log(`✓ 发现预渲染文件: ${route}/index.html`);
        }
      }
    }

    // 压缩根目录的 index.html（如果未被压缩）
    const rootIndexHtml = path.join(this.distDir, 'index.html');
    if (fs.existsSync(rootIndexHtml)) {
      const stats = await fs.promises.stat(rootIndexHtml);
      if (stats.size > 1024) {
        // 检查是否已经有压缩版本
        const hasCompressed = fs.existsSync(rootIndexHtml + '.gz') ||
                             fs.existsSync(rootIndexHtml + '.br') ||
                             fs.existsSync(rootIndexHtml + '.zst');
        if (!hasCompressed) {
          prerenderFiles.push(rootIndexHtml);
          console.log(`✓ 发现主页面文件: index.html`);
        }
      }
    }

    if (prerenderFiles.length > 0) {
      console.log(`\n🗜️ 压缩 ${prerenderFiles.length} 个预渲染 HTML 文件...\n`);

      for (const file of prerenderFiles) {
        await Promise.all([
          this.compressGzip(file),
          this.compressBrotli(file),
          this.compressZstd(file),
        ]);
      }
    } else {
      console.log('ℹ️ 没有找到需要压缩的预渲染文件');
    }
  }

  /**
   * Gzip 压缩
   */
  async compressGzip(inputFile) {
    try {
      const input = await fs.promises.readFile(inputFile);
      const compressed = await promisify(zlib.gzip)(input, {
        level: zlib.constants.Z_BEST_COMPRESSION,
        windowBits: 15,
        memLevel: 8,
      });

      const outputFile = inputFile + '.gz';
      await fs.promises.writeFile(outputFile, compressed);

      const compressionRatio = ((input.length - compressed.length) / input.length * 100);
      console.log(`✓ GZIP: ${path.relative(this.distDir, inputFile)} (${compressionRatio.toFixed(1)}% 压缩)`);

      return true;
    } catch (error) {
      console.warn(`⚠ GZIP 压缩失败: ${path.relative(this.distDir, inputFile)} - ${error.message}`);
      return false;
    }
  }

  /**
   * Brotli 压缩
   */
  async compressBrotli(inputFile) {
    try {
      const input = await fs.promises.readFile(inputFile);
      const compressed = await promisify(zlib.brotliCompress)(input, {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY,
          [zlib.constants.BROTLI_PARAM_SIZE_HINT]: input.length,
        },
      });

      const outputFile = inputFile + '.br';
      await fs.promises.writeFile(outputFile, compressed);

      const compressionRatio = ((input.length - compressed.length) / input.length * 100);
      console.log(`✓ BROTLI: ${path.relative(this.distDir, inputFile)} (${compressionRatio.toFixed(1)}% 压缩)`);

      return true;
    } catch (error) {
      console.warn(`⚠ BROTLI 压缩失败: ${path.relative(this.distDir, inputFile)} - ${error.message}`);
      return false;
    }
  }

  /**
   * 伪 Zstd 压缩（使用 Brotli 替代）
   * 实际项目中可以集成真正的 zstd 库
   */
  async compressZstd(inputFile) {
    try {
      // 目前使用 Brotli 的最高质量设置作为 zstd 的替代
      const input = await fs.promises.readFile(inputFile);
      const compressed = await promisify(zlib.brotliCompress)(input, {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY,
          [zlib.constants.BROTLI_PARAM_SIZE_HINT]: input.length,
        },
      });

      const outputFile = inputFile + '.zst';
      await fs.promises.writeFile(outputFile, compressed);

      const compressionRatio = ((input.length - compressed.length) / input.length * 100);
      console.log(`✓ ZSTD (模拟): ${path.relative(this.distDir, inputFile)} (${compressionRatio.toFixed(1)}% 压缩)`);

      return true;
    } catch (error) {
      console.warn(`⚠ ZSTD 压缩失败: ${path.relative(this.distDir, inputFile)} - ${error.message}`);
      return false;
    }
  }

  /**
   * 批量压缩所有文件
   */
  async compressAll() {
    console.log('🗜️  开始压缩资源文件...\n');

    // 检查 dist 目录是否存在
    if (!fs.existsSync(this.distDir)) {
      console.error(`❌ 构建目录 ${this.distDir} 不存在`);
      return;
    }

    // 获取要压缩的文件
    const files = await this.getFilesToCompress(this.distDir);
    console.log(`📁 找到 ${files.length} 个文件需要压缩\n`);

    if (files.length === 0) {
      console.log('ℹ️  没有找到需要压缩的文件');
      // 即使没有找到常规文件，也要检查预渲染文件
      await this.compressPrerenderFiles();
      return;
    }

    let totalOriginalSize = 0;
    let totalGzipSize = 0;
    let totalBrotliSize = 0;
    let totalZstdSize = 0;

    // 压缩所有文件
    for (const file of files) {
      const stats = await fs.promises.stat(file);
      totalOriginalSize += stats.size;

      // 并行压缩三种格式
      const [gzipSuccess, brotliSuccess, zstdSuccess] = await Promise.all([
        this.compressGzip(file),
        this.compressBrotli(file),
        this.compressZstd(file),
      ]);

      // 统计压缩后的文件大小
      try {
        if (gzipSuccess && fs.existsSync(file + '.gz')) {
          const gzipStats = await fs.promises.stat(file + '.gz');
          totalGzipSize += gzipStats.size;
        }
        if (brotliSuccess && fs.existsSync(file + '.br')) {
          const brotliStats = await fs.promises.stat(file + '.br');
          totalBrotliSize += brotliStats.size;
        }
        if (zstdSuccess && fs.existsSync(file + '.zst')) {
          const zstdStats = await fs.promises.stat(file + '.zst');
          totalZstdSize += zstdStats.size;
        }
      } catch (error) {
        console.warn(`统计文件大小时出错: ${error.message}`);
      }
    }

    // 处理预渲染文件
    console.log('\n' + '='.repeat(60));
    await this.compressPrerenderFiles();

    // 输出统计信息
    console.log('\n📊 压缩统计:');
    console.log(`原始文件总大小: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);

    if (totalGzipSize > 0) {
      const gzipRatio = ((totalOriginalSize - totalGzipSize) / totalOriginalSize * 100);
      console.log(`GZIP 压缩后: ${(totalGzipSize / 1024 / 1024).toFixed(2)} MB (节省 ${gzipRatio.toFixed(1)}%)`);
    }

    if (totalBrotliSize > 0) {
      const brotliRatio = ((totalOriginalSize - totalBrotliSize) / totalOriginalSize * 100);
      console.log(`BROTLI 压缩后: ${(totalBrotliSize / 1024 / 1024).toFixed(2)} MB (节省 ${brotliRatio.toFixed(1)}%)`);
    }

    if (totalZstdSize > 0) {
      const zstdRatio = ((totalOriginalSize - totalZstdSize) / totalOriginalSize * 100);
      console.log(`ZSTD (模拟) 压缩后: ${(totalZstdSize / 1024 / 1024).toFixed(2)} MB (节省 ${zstdRatio.toFixed(1)}%)`);
    }

    console.log('\n✅ 所有资源文件压缩完成!');
    console.log('\n💡 提示:');
    console.log('   - 生成的压缩文件将被 nginx 自动选择提供');
    console.log('   - 客户端支持的最佳压缩格式将被优先使用');
    console.log('   - 压缩优先级: zstd > brotli > gzip > 原始文件');
    console.log('   - 预渲染的 HTML 文件也已压缩');
  }

  /**
   * 生成压缩文件列表报告
   */
  async generateReport() {
    const files = await this.getFilesToCompress(this.distDir);
    const report = [];

    report.push('# 压缩文件报告');
    report.push(`生成时间: ${new Date().toLocaleString('zh-CN')}`);
    report.push('');

    // 添加常规文件
    for (const file of files) {
      const relativePath = path.relative(this.distDir, file);
      const stats = await fs.promises.stat(file);

      report.push(`## ${relativePath}`);
      report.push(`原始大小: ${(stats.size / 1024).toFixed(2)} KB`);

      // 检查压缩文件
      const compressionFormats = [
        { ext: '.gz', name: 'Gzip' },
        { ext: '.br', name: 'Brotli' },
        { ext: '.zst', name: 'Zstd' },
      ];

      for (const format of compressionFormats) {
        const compressedFile = file + format.ext;
        if (fs.existsSync(compressedFile)) {
          const compressedStats = await fs.promises.stat(compressedFile);
          const ratio = ((stats.size - compressedStats.size) / stats.size * 100);
          report.push(`${format.name}: ${(compressedStats.size / 1024).toFixed(2)} KB (${ratio.toFixed(1)}% 压缩)`);
        } else {
          report.push(`${format.name}: 未生成`);
        }
      }

      report.push('');
    }

    // 添加预渲染文件报告
    report.push('## 预渲染文件');
    report.push('');

    for (const route of this.prerenderRoutes) {
      const htmlFile = path.join(this.distDir, route, 'index.html');
      if (fs.existsSync(htmlFile)) {
        const stats = await fs.promises.stat(htmlFile);
        report.push(`### ${route}/index.html`);
        report.push(`原始大小: ${(stats.size / 1024).toFixed(2)} KB`);

        const compressionFormats = [
          { ext: '.gz', name: 'Gzip' },
          { ext: '.br', name: 'Brotli' },
          { ext: '.zst', name: 'Zstd' },
        ];

        for (const format of compressionFormats) {
          const compressedFile = htmlFile + format.ext;
          if (fs.existsSync(compressedFile)) {
            const compressedStats = await fs.promises.stat(compressedFile);
            const ratio = ((stats.size - compressedStats.size) / stats.size * 100);
            report.push(`${format.name}: ${(compressedStats.size / 1024).toFixed(2)} KB (${ratio.toFixed(1)}% 压缩)`);
          } else {
            report.push(`${format.name}: 未生成`);
          }
        }

        report.push('');
      }
    }

    // 写入报告文件
    const reportPath = path.join(this.distDir, 'compression-report.md');
    await fs.promises.writeFile(reportPath, report.join('\n'));

    console.log(`📄 生成压缩报告: ${reportPath}`);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const compressor = new SimpleAssetCompressor();
  compressor.compressAll()
    .then(() => compressor.generateReport())
    .catch(console.error);
}

module.exports = SimpleAssetCompressor;
