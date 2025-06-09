/**
 * 日志工具模块
 * 提供统一的日志输出格式和级别控制
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

class Logger {
  constructor(name = 'Script', level = LOG_LEVELS.INFO) {
    this.name = name;
    this.level = level;
  }

  /**
   * 格式化时间戳
   */
  getTimestamp() {
    return new Date().toLocaleTimeString('zh-CN');
  }

  /**
   * 格式化日志消息
   */
  formatMessage(level, emoji, message) {
    return `${emoji} [${this.getTimestamp()}] ${this.name}: ${message}`;
  }

  /**
   * 错误日志
   */
  error(message, error = null) {
    if (this.level >= LOG_LEVELS.ERROR) {
      console.error(this.formatMessage('ERROR', '❌', message));
      if (error) {
        console.error(error);
      }
    }
  }

  /**
   * 警告日志
   */
  warn(message) {
    if (this.level >= LOG_LEVELS.WARN) {
      console.warn(this.formatMessage('WARN', '⚠️', message));
    }
  }

  /**
   * 信息日志
   */
  info(message) {
    if (this.level >= LOG_LEVELS.INFO) {
      console.log(this.formatMessage('INFO', 'ℹ️', message));
    }
  }

  /**
   * 成功日志
   */
  success(message) {
    if (this.level >= LOG_LEVELS.INFO) {
      console.log(this.formatMessage('SUCCESS', '✅', message));
    }
  }

  /**
   * 开始日志
   */
  start(message) {
    if (this.level >= LOG_LEVELS.INFO) {
      console.log(this.formatMessage('START', '🚀', message));
    }
  }

  /**
   * 完成日志
   */
  complete(message) {
    if (this.level >= LOG_LEVELS.INFO) {
      console.log(this.formatMessage('COMPLETE', '🎉', message));
    }
  }

  /**
   * 调试日志
   */
  debug(message) {
    if (this.level >= LOG_LEVELS.DEBUG) {
      console.log(this.formatMessage('DEBUG', '🐛', message));
    }
  }

  /**
   * 步骤日志
   */
  step(message) {
    if (this.level >= LOG_LEVELS.INFO) {
      console.log(this.formatMessage('STEP', '🎯', message));
    }
  }

  /**
   * 分割线
   */
  separator() {
    if (this.level >= LOG_LEVELS.INFO) {
      console.log('='.repeat(50));
    }
  }
}

/**
 * 创建日志器实例
 */
export function createLogger(name, level = LOG_LEVELS.INFO) {
  return new Logger(name, level);
}

export { LOG_LEVELS };
