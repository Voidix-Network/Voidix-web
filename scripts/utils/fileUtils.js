import fs from 'fs';
import path from 'path';
import { createLogger } from './logger.js';

const logger = createLogger('FileUtils');

/**
 * 文件操作工具模块
 * 提供常用的文件和目录操作功能
 */

/**
 * 确保目录存在，如不存在则创建
 */
export function ensureDir(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      logger.debug(`创建目录: ${dirPath}`);
    }
    return true;
  } catch (error) {
    logger.error(`创建目录失败: ${dirPath}`, error);
    return false;
  }
}

/**
 * 安全写入文件
 */
export function writeFileSafe(filePath, content, encoding = 'utf-8') {
  try {
    // 确保目录存在
    const dir = path.dirname(filePath);
    ensureDir(dir);

    // 写入文件
    fs.writeFileSync(filePath, content, encoding);
    logger.debug(`文件写入成功: ${filePath}`);
    return true;
  } catch (error) {
    logger.error(`文件写入失败: ${filePath}`, error);
    return false;
  }
}

/**
 * 安全读取文件
 */
export function readFileSafe(filePath, encoding = 'utf-8') {
  try {
    if (!fs.existsSync(filePath)) {
      logger.warn(`文件不存在: ${filePath}`);
      return null;
    }

    const content = fs.readFileSync(filePath, encoding);
    logger.debug(`文件读取成功: ${filePath}`);
    return content;
  } catch (error) {
    logger.error(`文件读取失败: ${filePath}`, error);
    return null;
  }
}

/**
 * 获取文件大小（字符数）
 */
export function getFileSize(filePath) {
  try {
    const content = readFileSafe(filePath);
    return content ? content.length : 0;
  } catch (error) {
    logger.error(`获取文件大小失败: ${filePath}`, error);
    return 0;
  }
}

/**
 * 复制文件
 */
export function copyFile(sourcePath, targetPath) {
  try {
    const dir = path.dirname(targetPath);
    ensureDir(dir);

    fs.copyFileSync(sourcePath, targetPath);
    logger.debug(`文件复制成功: ${sourcePath} → ${targetPath}`);
    return true;
  } catch (error) {
    logger.error(`文件复制失败: ${sourcePath} → ${targetPath}`, error);
    return false;
  }
}

/**
 * 检查文件是否存在
 */
export function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * 获取文件的绝对路径
 */
export function getAbsolutePath(relativePath, basePath = process.cwd()) {
  return path.resolve(basePath, relativePath);
}
