/**
 * UptimeRobot API 服务测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UptimeRobotApiService, createUptimeRobotApi } from '@/services/uptimeRobotApi';
import { MonitorStatus } from '@/types/uptimeRobot';

// Mock fetch
global.fetch = vi.fn();

describe('UptimeRobotApiService', () => {
  let apiService: UptimeRobotApiService;

  beforeEach(() => {
    vi.clearAllMocks();
    apiService = createUptimeRobotApi('test-api-key');
  });

  describe('getMonitors', () => {
    it('成功获取监控数据', async () => {
      const mockResponse = {
        stat: 'ok',
        monitors: [
          {
            id: 1,
            friendly_name: '官网',
            url: 'https://www.voidix.net',
            status: 2, // UP
            custom_uptime_ranges: '99.95-99.90-99.85-99.90',
            logs: [
              {
                type: 1, // down event
                datetime: 1640995200,
                duration: 300,
              },
            ],
          },
        ],
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiService.getMonitors(3);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].name).toBe('官网');
      expect(result[0].status).toBe('ok');
    });

    it('处理API错误响应', async () => {
      const mockErrorResponse = {
        stat: 'fail',
        error: {
          type: 'invalid_parameter',
          message: 'Invalid API key',
        },
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockErrorResponse),
      });

      await expect(apiService.getMonitors()).rejects.toThrow(
        'API Error: invalid_parameter - Invalid API key'
      );
    });

    it('处理网络错误', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(apiService.getMonitors()).rejects.toThrow('Network error');
    });

    it('处理超时错误', async () => {
      // 模拟超时
      const abortError = new Error('Request timeout');
      abortError.name = 'AbortError';
      (fetch as any).mockRejectedValueOnce(abortError);

      await expect(apiService.getMonitors()).rejects.toThrow('请求超时，请检查网络连接');
    });

    it('正确映射监控名称', async () => {
      const mockResponse = {
        stat: 'ok',
        monitors: [
          {
            id: 1,
            friendly_name: 'PING www.voidix.net',
            url: 'www.voidix.net', // 域名格式（实际API可能返回的格式）
            status: 2,
            custom_uptime_ranges: '99.95-99.90',
            logs: [],
          },
          {
            id: 2,
            friendly_name: 'HTTPS www.voidix.net',
            url: 'https://www.voidix.net', // 完整URL格式
            status: 2,
            custom_uptime_ranges: '99.85-99.80',
            logs: [],
          },
          {
            id: 3,
            friendly_name: 'SMTP Monitor',
            url: 'voidix-net.mail.protection.outlook.com', // 域名格式
            status: 2,
            custom_uptime_ranges: '99.99-99.95',
            logs: [],
          },
          {
            id: 4,
            friendly_name: 'Mail Service',
            url: 'https://voidix-net.mail.protection.outlook.com', // 完整URL格式
            status: 2,
            custom_uptime_ranges: '99.99-99.95',
            logs: [],
          },
        ],
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiService.getMonitors(1);

      expect(result[0].name).toBe('官网主机'); // PING + www.voidix.net
      expect(result[1].name).toBe('官网'); // HTTPS + www.voidix.net
      expect(result[2].name).toBe('邮箱系统'); // SMTP + mail domain
      expect(result[3].name).toBe('邮箱系统'); // Mail + mail domain
    });

    it('测试不同的URL格式支持', async () => {
      const mockResponse = {
        stat: 'ok',
        monitors: [
          {
            id: 1,
            friendly_name: 'Test voidix.net',
            url: 'voidix.net', // 主域名格式
            status: 2,
            custom_uptime_ranges: '99.95-99.90',
            logs: [],
          },
          {
            id: 2,
            friendly_name: 'Test with path',
            url: 'www.voidix.net/api', // 带路径的域名
            status: 2,
            custom_uptime_ranges: '99.85-99.80',
            logs: [],
          },
          {
            id: 3,
            friendly_name: 'Unknown Service',
            url: 'unknown.example.com', // 未知域名
            status: 2,
            custom_uptime_ranges: '99.99-99.95',
            logs: [],
          },
        ],
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiService.getMonitors(1);

      expect(result[0].name).toBe('官网'); // voidix.net -> 官网（默认）
      expect(result[1].name).toBe('官网'); // www.voidix.net/api -> 官网（默认）
      expect(result[2].name).toBe('Unknown Service'); // 未匹配，返回原名称
    });
  });

  describe('transformToCardData', () => {
    it('正确转换监控数据为卡片格式', () => {
      const monitors = [
        {
          id: 1,
          name: '邮箱系统',
          url: 'voidix-net.mail.protection.outlook.com',
          status: 'ok' as const,
          average: 99.95,
          daily: [],
          total: { times: 0, duration: 0 },
        },
      ];

      const cardData = UptimeRobotApiService.transformToCardData(monitors);

      expect(cardData).toHaveLength(1);
      expect(cardData[0].id).toBe(1);
      expect(cardData[0].name).toBe('邮箱系统');
      expect(cardData[0].status).toBe(MonitorStatus.UP);
      expect(cardData[0].uptimePercentage).toBe(99.95);
    });
  });

  describe('静态方法', () => {
    it('getStatusLabel 返回正确的状态标签', () => {
      expect(UptimeRobotApiService.getStatusLabel(MonitorStatus.UP)).toBe('正常');
      expect(UptimeRobotApiService.getStatusLabel(MonitorStatus.DOWN)).toBe('故障');
      expect(UptimeRobotApiService.getStatusLabel(MonitorStatus.SEEMS_DOWN)).toBe('可能故障');
      expect(UptimeRobotApiService.getStatusLabel(MonitorStatus.PAUSED)).toBe('已暂停');
      expect(UptimeRobotApiService.getStatusLabel(MonitorStatus.NOT_CHECKED_YET)).toBe('未检查');

      // 测试字符串状态
      expect(UptimeRobotApiService.getStatusLabel('ok')).toBe('正常');
      expect(UptimeRobotApiService.getStatusLabel('down')).toBe('故障');
      expect(UptimeRobotApiService.getStatusLabel('unknow')).toBe('未知');
    });

    it('getStatusColorClass 返回正确的颜色类', () => {
      expect(UptimeRobotApiService.getStatusColorClass(MonitorStatus.UP)).toBe('text-green-400');
      expect(UptimeRobotApiService.getStatusColorClass(MonitorStatus.DOWN)).toBe('text-red-400');
      expect(UptimeRobotApiService.getStatusColorClass(MonitorStatus.SEEMS_DOWN)).toBe(
        'text-yellow-400'
      );
      expect(UptimeRobotApiService.getStatusColorClass(MonitorStatus.PAUSED)).toBe('text-gray-400');
      expect(UptimeRobotApiService.getStatusColorClass(MonitorStatus.NOT_CHECKED_YET)).toBe(
        'text-blue-400'
      );

      // 测试字符串状态
      expect(UptimeRobotApiService.getStatusColorClass('ok')).toBe('text-green-400');
      expect(UptimeRobotApiService.getStatusColorClass('down')).toBe('text-red-400');
      expect(UptimeRobotApiService.getStatusColorClass('unknow')).toBe('text-gray-400');
    });
  });
});
