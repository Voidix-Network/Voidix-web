/**
 * UptimeRobot API 服务层
 * 基于参考项目 https://github.com/yb/uptime-status
 * 使用真实的UptimeRobot API v2获取监控数据
 */

import dayjs from 'dayjs';
import { UptimeRobotConfig, MonitorCardData, MonitorStatus } from '@/types/uptimeRobot';

/**
 * 格式化数字，保留两位小数
 */
function formatNumber(value: number): string {
  return (Math.floor(value * 100) / 100).toString();
}

/**
 * 格式化持续时间
 */
export function formatDuration(seconds: number): string {
  let s = parseInt(seconds.toString());
  let m = 0;
  let h = 0;
  if (s >= 60) {
    m = parseInt((s / 60).toString());
    s = parseInt((s % 60).toString());
    if (m >= 60) {
      h = parseInt((m / 60).toString());
      m = parseInt((m % 60).toString());
    }
  }
  let text = `${s} 秒`;
  if (m > 0) text = `${m} 分 ${text}`;
  if (h > 0) text = `${h} 小时 ${text}`;
  return text;
}

/**
 * 每日监控数据
 */
export interface DailyData {
  date: dayjs.Dayjs;
  uptime: number;
  down: {
    times: number;
    duration: number;
  };
}

/**
 * 增强的监控数据
 */
export interface EnhancedMonitor {
  id: number;
  name: string;
  url: string;
  average: number;
  daily: DailyData[];
  total: {
    times: number;
    duration: number;
  };
  status: 'ok' | 'down' | 'unknow';
}

/**
 * UptimeRobot API 服务类
 */
export class UptimeRobotApiService {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(config: UptimeRobotConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://cdn.voidix.net/uptimerobot';
    this.timeout = config.timeout || 30000;
  }

  /**
   * 获取监控数据（参考项目实现）
   */
  async getMonitors(days: number = 90): Promise<EnhancedMonitor[]> {
    // 生成日期范围 - 从90天前到今天，确保今天在最右边
    const dates: dayjs.Dayjs[] = [];
    const today = dayjs(new Date().setHours(0, 0, 0, 0));

    // 从90天前开始，到今天结束（包括今天）
    for (let d = days - 1; d >= 0; d--) {
      dates.push(today.subtract(d, 'day'));
    }

    // 生成自定义运行时间范围
    const ranges = dates.map(date => `${date.unix()}_${date.add(1, 'day').unix()}`);
    const start = dates[0].unix(); // 最早的日期
    const end = dates[dates.length - 1].add(1, 'day').unix(); // 今天的结束
    ranges.push(`${start}_${end}`);

    // 构建请求参数
    const postdata = {
      api_key: this.apiKey,
      format: 'json',
      logs: '1',
      log_types: '1-2',
      logs_start_date: start.toString(),
      logs_end_date: end.toString(),
      custom_uptime_ranges: ranges.join('-'),
    };

    try {
      // 发送请求
      const response = await this.makeRequest('/getMonitors', postdata);

      if (response.stat !== 'ok') {
        throw new Error(
          `API Error: ${response.error?.type || 'Unknown'} - ${response.error?.message || 'No message'}`
        );
      }

      // 处理响应数据
      return response.monitors.map((monitor: any) => {
        const ranges = monitor.custom_uptime_ranges.split('-');
        const average = parseFloat(formatNumber(ranges.pop()));
        const daily: DailyData[] = [];
        const map: { [key: string]: number } = {};

        // 初始化每日数据 - 按照日期顺序，今天在最后
        dates.forEach((date, index) => {
          map[date.format('YYYYMMDD')] = index;
          daily[index] = {
            date: date,
            uptime: parseFloat(formatNumber(ranges[index])),
            down: { times: 0, duration: 0 },
          };
        });

        // 处理日志数据 - 只处理宕机事件(type=1)
        const total = monitor.logs.reduce(
          (total: any, log: any) => {
            if (log.type === 1) {
              // down event
              const logDate = dayjs.unix(log.datetime);
              const dateKey = logDate.format('YYYYMMDD');

              total.duration += log.duration;
              total.times += 1;

              // 将宕机事件分配到对应的日期
              if (map[dateKey] !== undefined) {
                daily[map[dateKey]].down.duration += log.duration;
                daily[map[dateKey]].down.times += 1;
              }
            }
            return total;
          },
          { times: 0, duration: 0 }
        );

        // 确定当前状态
        let status: 'ok' | 'down' | 'unknow' = 'unknow';
        if (monitor.status === 2) status = 'ok';
        if (monitor.status === 9) status = 'down';

        return {
          id: monitor.id,
          name: this.getDisplayName(monitor.friendly_name, monitor.url),
          url: monitor.url,
          average: average,
          daily: daily,
          total: total,
          status: status,
        };
      });
    } catch (error) {
      console.error('获取监控数据失败:', error);
      throw error;
    }
  }

  /**
   * 发送API请求
   */
  private async makeRequest(endpoint: string, data: any): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      // 构建表单数据
      const formData = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'VoidixWeb/1.0',
        },
        body: formData.toString(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('请求超时，请检查网络连接');
        }
        throw error;
      }

      throw new Error('请求失败，请稍后重试');
    }
  }

  /**
   * 获取显示名称映射
   */
  private getDisplayName(friendlyName: string, url: string): string {
    // 使用更安全的URL验证方法
    const normalizedUrl = url.toLowerCase();
    const normalizedName = friendlyName.toLowerCase();

    // 验证是否为官网域名 - 支持多种URL格式，同时保持安全性
    const isVoidixDomain =
      // 完整URL格式
      normalizedUrl === 'https://www.voidix.net' ||
      normalizedUrl === 'http://www.voidix.net' ||
      normalizedUrl === 'https://www.voidix.net/' ||
      normalizedUrl === 'http://www.voidix.net/' ||
      normalizedUrl.match(/^https?:\/\/www\.voidix\.net\/[^.]*$/) ||
      // 域名格式（UptimeRobot API可能返回的格式）
      normalizedUrl === 'www.voidix.net' ||
      normalizedUrl === 'www.voidix.net/' ||
      normalizedUrl === 'voidix.net' ||
      normalizedUrl === 'voidix.net/' ||
      // 严格的域名路径匹配（防止子域名攻击）
      normalizedUrl.match(/^www\.voidix\.net\/[^.]*$/) ||
      normalizedUrl.match(/^voidix\.net\/[^.]*$/);

    if (isVoidixDomain) {
      if (normalizedName.includes('ping')) {
        return '官网主机';
      }
      if (normalizedName.includes('http')) {
        return '官网';
      }
      // 默认为官网（对于纯域名格式的监控）
      return '官网';
    }

    // 验证邮箱系统域名 - 支持多种格式
    const isMailDomain =
      // 完整URL格式
      normalizedUrl.startsWith('https://voidix-net.mail.protection.outlook.com/') ||
      normalizedUrl.startsWith('http://voidix-net.mail.protection.outlook.com/') ||
      normalizedUrl === 'https://voidix-net.mail.protection.outlook.com' ||
      normalizedUrl === 'http://voidix-net.mail.protection.outlook.com' ||
      // 域名格式
      normalizedUrl === 'voidix-net.mail.protection.outlook.com' ||
      normalizedUrl === 'voidix-net.mail.protection.outlook.com/' ||
      normalizedUrl.startsWith('voidix-net.mail.protection.outlook.com/');

    if (isMailDomain || normalizedName.includes('smtp') || normalizedName.includes('mail')) {
      return '邮箱系统';
    }

    // 如果没有匹配，返回原名称
    return friendlyName;
  }

  /**
   * 转换为卡片数据格式
   */
  static transformToCardData(monitors: EnhancedMonitor[]): MonitorCardData[] {
    return monitors.map(monitor => ({
      id: monitor.id,
      name: monitor.name,
      url: monitor.url,
      status:
        monitor.status === 'ok'
          ? MonitorStatus.UP
          : monitor.status === 'down'
            ? MonitorStatus.DOWN
            : MonitorStatus.NOT_CHECKED_YET,
      uptimePercentage: monitor.average,
      responseTime: 0, // API v2 doesn't provide real-time response time
      lastCheck: new Date(),
      type: 'HTTP(S)',
    }));
  }

  /**
   * 获取状态标签
   */
  static getStatusLabel(status: string | number): string {
    // 如果是数字，转换为对应的状态字符串
    if (typeof status === 'number') {
      switch (status) {
        case 2:
          return '正常';
        case 9:
          return '故障';
        case 8:
          return '可能故障';
        case 1:
          return '未检查';
        case 0:
          return '已暂停';
        default:
          return '未知';
      }
    }

    // 字符串状态
    switch (status) {
      case 'ok':
        return '正常';
      case 'down':
        return '故障';
      case 'unknow':
      default:
        return '未知';
    }
  }

  /**
   * 获取状态颜色类
   */
  static getStatusColorClass(status: string | number): string {
    // 如果是数字，转换为对应的状态字符串
    if (typeof status === 'number') {
      switch (status) {
        case 2:
          return 'text-green-400';
        case 9:
          return 'text-red-400';
        case 8:
          return 'text-yellow-400';
        case 1:
          return 'text-blue-400';
        case 0:
          return 'text-gray-400';
        default:
          return 'text-gray-400';
      }
    }

    // 字符串状态
    switch (status) {
      case 'ok':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      case 'unknow':
      default:
        return 'text-gray-400';
    }
  }
}

/**
 * 创建UptimeRobot API服务实例
 */
export function createUptimeRobotApi(apiKey: string): UptimeRobotApiService {
  return new UptimeRobotApiService({ apiKey });
}

/**
 * 默认的UptimeRobot API实例
 */
export const uptimeRobotApi = createUptimeRobotApi('ur2974791-a19a9c09c8f8800505f0ba45');
