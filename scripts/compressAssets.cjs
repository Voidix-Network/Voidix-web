const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * 压缩资源文件为多种格式
 * 支持 zstd、brotli、gzip 压缩
 */
class AssetCompressor {
  constructor(distDir = 'dist') {
    this.distDir = distDir;
    this.supportedExtensions = ['.js', '.css', '.html', '.xml', '.txt', '.svg', '.json'];
    this.compressionFormats = [
      {
        name: 'zstd',
        ext: '.zst',
        command: 'zstd --ultra -22 -q "{input}" -o "{output}"',
        priority: 1
      },
      {
        name: 'brotli',
        ext: '.br',
        command: 'brotli -q 11 -o "{output}" "{input}"',
        priority: 2
      },
      {
        name: 'gzip',
        ext: '.gz',
        command: 'gzip -9 -k -f "{input}" && mv "{input}.gz" "{output}"',
        priority: 3
      }
    ];
  }

  /**
   * 递归获取所有符合条件的文件
   */
  async getFilesToCompress(dir) {
    const files = [];

    const readDir = async (currentDir) => {
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
    };

    await readDir(dir);
    return files;
  }

  /**
   * 检查压缩工具是否可用
   */
  async checkCompressionTool(command) {
    try {
      const toolName = command.split(' ')[0];
      await execAsync(`${toolName} --version`);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 压缩单个文件
   */
  async compressFile(inputFile, format) {
    const outputFile = inputFile + format.ext;
    const command = format.command
      .replace('{input}', inputFile)
      .replace('{output}', outputFile);

    try {
      await execAsync(command);

      // 检查压缩文件是否存在且有效
      const inputStats = await fs.promises.stat(inputFile);
      const outputStats = await fs.promises.stat(outputFile);

      const compressionRatio = ((inputStats.size - outputStats.size) / inputStats.size * 100);

      console.log(`✓ ${format.name.toUpperCase()}: ${path.relative(this.distDir, inputFile)} (${compressionRatio.toFixed(1)}% 压缩)`);

      return true;
    } catch (error) {
      console.warn(`⚠ ${format.name.toUpperCase()} 压缩失败: ${path.relative(this.distDir, inputFile)} - ${error.message}`);
      return false;
    }
  }

  /**
   * 批量压缩所有文件
   */
  async compressAll() {
    console.log('🗜️  开始压缩资源文件...\n');

    // 检查压缩工具可用性
    const availableFormats = [];
    for (const format of this.compressionFormats) {
      const isAvailable = await this.checkCompressionTool(format.command);
      if (isAvailable) {
        availableFormats.push(format);
        console.log(`✓ ${format.name.toUpperCase()} 压缩工具可用`);
      } else {
        console.log(`⚠ ${format.name.toUpperCase()} 压缩工具不可用，跳过`);
      }
    }

    if (availableFormats.length === 0) {
      console.error('❌ 没有可用的压缩工具');
      return;
    }

    console.log('');

    // 获取要压缩的文件
    const files = await this.getFilesToCompress(this.distDir);
    console.log(`📁 找到 ${files.length} 个文件需要压缩\n`);

    let totalOriginalSize = 0;
    let totalCompressedSizes = {};

    // 初始化压缩大小统计
    availableFormats.forEach(format => {
      totalCompressedSizes[format.name] = 0;
    });

    // 压缩所有文件
    for (const file of files) {
      const stats = await fs.promises.stat(file);
      totalOriginalSize += stats.size;

      for (const format of availableFormats) {
        const success = await this.compressFile(file, format);
        if (success) {
          const compressedFile = file + format.ext;
          const compressedStats = await fs.promises.stat(compressedFile);
          totalCompressedSizes[format.name] += compressedStats.size;
        }
      }
    }

    // 输出统计信息
    console.log('\n📊 压缩统计:');
    console.log(`原始文件总大小: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);

    availableFormats.forEach(format => {
      const compressedSize = totalCompressedSizes[format.name];
      const ratio = ((totalOriginalSize - compressedSize) / totalOriginalSize * 100);
      console.log(`${format.name.toUpperCase()} 压缩后: ${(compressedSize / 1024 / 1024).toFixed(2)} MB (节省 ${ratio.toFixed(1)}%)`);
    });

    console.log('\n✅ 资源文件压缩完成!');
  }

  /**
   * 生成内容协商配置文件
   */
  async generateNginxConfig() {
    const files = await this.getFilesToCompress(this.distDir);
    const config = [];

    config.push('# 自动生成的压缩文件内容协商配置');
    config.push('# 优先级: zstd > brotli > gzip > 原始文件');
    config.push('');

    // 为每个文件生成配置
    for (const file of files) {
      const relativePath = '/' + path.relative(this.distDir, file).replace(/\\/g, '/');

      config.push(`# ${relativePath}`);
      config.push(`location = ${relativePath} {`);

      // 检查 zstd 文件是否存在
      if (fs.existsSync(file + '.zst')) {
        config.push(`    location ~ \\.zst$ { internal; }`);
        config.push(`    try_files $uri.zst $uri.br $uri.gz $uri;`);
        config.push(`    add_header Content-Encoding zstd;`);
      }
      // 检查 brotli 文件是否存在
      else if (fs.existsSync(file + '.br')) {
        config.push(`    try_files $uri.br $uri.gz $uri;`);
        config.push(`    add_header Content-Encoding br;`);
      }
      // 检查 gzip 文件是否存在
      else if (fs.existsSync(file + '.gz')) {
        config.push(`    try_files $uri.gz $uri;`);
        config.push(`    add_header Content-Encoding gzip;`);
      }

      config.push(`}`);
      config.push('');
    }

    // 写入配置文件
    const configPath = path.join(this.distDir, 'nginx-compression.conf');
    await fs.promises.writeFile(configPath, config.join('\n'));

    console.log(`📝 生成 Nginx 配置文件: ${configPath}`);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const compressor = new AssetCompressor();
  compressor.compressAll()
    .then(() => compressor.generateNginxConfig())
    .catch(console.error);
}

module.exports = AssetCompressor;
