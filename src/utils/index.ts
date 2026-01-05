import { STATUS_TEXTS, TIME_CONSTANTS } from '@/constants';
import { clsx, type ClassValue } from 'clsx';

// 导出服务器相关工具函数
export * from './serverUtils';

/**
 * 合并CSS类名的工具函数
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * 格式化持续时间的函数
 * 基于原项目的formatDuration实现
 */
export function formatDuration(
  totalSeconds: number | string | null | undefined,
  type: 'default' | 'totalUptime' | 'short' = 'default'
): string {
  if (totalSeconds === undefined || totalSeconds === null) return STATUS_TEXTS.loading;

  let numericSeconds = parseFloat(totalSeconds.toString());
  if (isNaN(numericSeconds) || numericSeconds < 0) {
    numericSeconds = 0;
  }

  const days = Math.floor(numericSeconds / TIME_CONSTANTS.SECONDS_IN_DAY);
  const hours = Math.floor(
    (numericSeconds % TIME_CONSTANTS.SECONDS_IN_DAY) / TIME_CONSTANTS.SECONDS_IN_HOUR
  );
  const minutes = Math.floor(
    (numericSeconds % TIME_CONSTANTS.SECONDS_IN_HOUR) / TIME_CONSTANTS.SECONDS_IN_MINUTE
  );

  if (type === 'totalUptime') {
    // 总运行时间格式化
    if (numericSeconds >= TIME_CONSTANTS.SECONDS_IN_YEAR) {
      const years = Math.floor(numericSeconds / TIME_CONSTANTS.SECONDS_IN_YEAR);
      const remainingSecondsAfterYears = numericSeconds % TIME_CONSTANTS.SECONDS_IN_YEAR;
      const daysInYearContext = Math.floor(
        remainingSecondsAfterYears / TIME_CONSTANTS.SECONDS_IN_DAY
      );
      return `${years}年 ${daysInYearContext}天`;
    }

    if (days > 0) return `${days}天 ${hours}时`;
    if (hours > 0) return `${hours}时 ${minutes}分`;
    if (numericSeconds > 0 && numericSeconds < TIME_CONSTANTS.SECONDS_IN_MINUTE) {
      return STATUS_TEXTS.lessThanAMinute;
    }
    return `${minutes}分`;
  }

  if (type === 'short') {
    // 短格式
    if (days > 0) return `${days}天`;
    if (hours > 0) return `${hours}时`;
    return `${minutes}分`;
  }

  // 默认格式化
  if (days >= 100) return `${days}天`;
  if (days > 0) return `${days}天 ${hours}时`;
  if (hours > 0) return `${hours}时 ${minutes}分`;
  if (numericSeconds > 0 && numericSeconds < TIME_CONSTANTS.SECONDS_IN_MINUTE) {
    return STATUS_TEXTS.lessThanAMinute;
  }
  if (numericSeconds === 0) return '0分';
  return `${minutes}分`;
}

/**
 * 延迟执行函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 安全地解析JSON
 */
export function safeJsonParse<T = any>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * 格式化运行时间（复现原项目的formatUptime函数）
 * @param totalSeconds 总秒数
 * @returns 格式化的运行时间字符串
 */
export function formatUptime(totalSeconds: number | string | null | undefined): string {
  return formatDuration(totalSeconds, 'default');
}

/**
 * 格式化运行时间（复现原项目的formatRunningTime函数）
 * @param totalSeconds 总秒数
 * @returns 格式化的运行时间字符串
 */
export function formatRunningTime(totalSeconds: number | string | null | undefined): string {
  return formatDuration(totalSeconds, 'totalUptime');
}

/**
 * 检查是否为开发环境
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV as boolean;
}

/**
 * 检查是否为生产环境
 */
export function isProduction(): boolean {
  return import.meta.env.PROD as boolean;
}

// 导出文本处理工具
export * from './textUtils';
