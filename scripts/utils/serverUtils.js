import { spawn } from 'child_process';
import { createLogger } from './logger.js';

const logger = createLogger('ServerUtils');

/**
 * 服务器工具模块
 * 提供静态服务器启动和管理功能
 */

/**
 * 启动静态服务器
 */
export function startStaticServer(distDir, port = 4173) {
  return new Promise((resolve, reject) => {
    logger.start(`启动静态服务器: http://localhost:${port}`);

    // Windows 兼容的 npx 调用
    const isWindows = process.platform === 'win32';
    const command = isWindows ? 'npx.cmd' : 'npx';

    const serverProcess = spawn(
      command,
      [
        'serve',
        distDir,
        '-p',
        port.toString(),
        '-s', // SPA模式，所有路由返回index.html
      ],
      {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: isWindows, // Windows 需要 shell
      }
    );

    let serverReady = false;
    let actualPort = port;

    serverProcess.stdout.on('data', data => {
      const output = data.toString();

      // 只输出重要信息，过滤HTTP请求日志
      if (!output.includes('HTTP  ') && !output.includes('Returned ')) {
        logger.debug(`服务器输出: ${output.trim()}`);
      }

      // 检测端口信息
      const portMatch = output.match(/http:\/\/localhost:(\d+)/);
      if (portMatch) {
        actualPort = parseInt(portMatch[1]);
        if (actualPort !== port) {
          logger.info(`检测到端口变更: ${port} → ${actualPort}`);
        }
      }

      // 检测服务器启动成功
      if (
        output.includes('Accepting connections') ||
        output.includes('serving') ||
        output.includes('Local:')
      ) {
        if (!serverReady) {
          serverReady = true;
          logger.success('静态服务器启动成功');
          resolve({ process: serverProcess, port: actualPort });
        }
      }
    });

    serverProcess.stderr.on('data', data => {
      logger.warn(`服务器错误: ${data.toString().trim()}`);
    });

    serverProcess.on('error', error => {
      logger.error('服务器启动失败', error);
      reject(error);
    });

    // 超时检测（3秒后认为服务器已启动）
    setTimeout(() => {
      if (!serverReady) {
        serverReady = true;
        logger.warn('假设静态服务器已启动（超时）');
        resolve({ process: serverProcess, port: actualPort });
      }
    }, 3000);
  });
}

/**
 * 停止服务器进程
 */
export function stopServer(serverProcess) {
  try {
    if (serverProcess && !serverProcess.killed) {
      serverProcess.kill('SIGTERM');
      logger.info('服务器进程已停止');
      return true;
    }
    return false;
  } catch (error) {
    logger.error('停止服务器失败', error);
    return false;
  }
}

/**
 * 等待指定时间
 */
export function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 检查端口是否可用
 */
export function isPortAvailable(port) {
  return new Promise(resolve => {
    const net = require('net');
    const server = net.createServer();

    server.listen(port, () => {
      server.close(() => resolve(true));
    });

    server.on('error', () => resolve(false));
  });
}
