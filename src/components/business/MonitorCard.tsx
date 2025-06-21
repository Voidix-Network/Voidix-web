/**
 * 监控卡片组件
 * 显示单个监控项目的状态信息
 */

import React from 'react';
import { MonitorCardData, MonitorStatus } from '@/types/uptimeRobot';
import { StatusIndicator } from '@/components/ui/StatusIndicator';

interface MonitorCardProps {
  monitor: MonitorCardData;
  className?: string;
}

export const MonitorCard: React.FC<MonitorCardProps> = ({ monitor, className = '' }) => {
  const formatResponseTime = (time: number): string => {
    if (time <= 0) return '无响应';
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  const formatUptime = (percentage: number): string => {
    return `${percentage.toFixed(2)}%`;
  };

  const formatLastCheck = (date: Date): string => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    return `${Math.floor(diff / 86400)}天前`;
  };

  const isHealthy = monitor.status === MonitorStatus.UP;
  const isDown =
    monitor.status === MonitorStatus.DOWN || monitor.status === MonitorStatus.SEEMS_DOWN;

  return (
    <div
      className={`bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors ${className}`}
    >
      {/* 头部：名称和状态 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate" title={monitor.name}>
            {monitor.name}
          </h3>
          <p className="text-sm text-gray-400 truncate" title={monitor.url}>
            {monitor.url}
          </p>
        </div>
        <StatusIndicator status={monitor.status} size="lg" showLabel />
      </div>

      {/* 统计信息网格 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 在线时间 */}
        <div className="text-center p-3 bg-gray-900/50 rounded-lg border border-gray-700/30">
          <div
            className={`text-2xl font-bold ${isHealthy ? 'text-green-400' : isDown ? 'text-red-400' : 'text-yellow-400'}`}
          >
            {formatUptime(monitor.uptimePercentage)}
          </div>
          <div className="text-xs text-gray-400 mt-1">在线时间</div>
        </div>

        {/* 响应时间 */}
        <div className="text-center p-3 bg-gray-900/50 rounded-lg border border-gray-700/30">
          <div
            className={`text-2xl font-bold ${
              monitor.responseTime <= 0
                ? 'text-red-400'
                : monitor.responseTime < 500
                  ? 'text-green-400'
                  : monitor.responseTime < 1000
                    ? 'text-yellow-400'
                    : 'text-red-400'
            }`}
          >
            {formatResponseTime(monitor.responseTime)}
          </div>
          <div className="text-xs text-gray-400 mt-1">响应时间</div>
        </div>
      </div>

      {/* 底部：类型和最后检查时间 */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700/30">
        <span className="text-xs text-gray-400 bg-gray-700/30 px-2 py-1 rounded">
          {monitor.type}
        </span>
        <span className="text-xs text-gray-400">
          最后检查: {formatLastCheck(monitor.lastCheck)}
        </span>
      </div>
    </div>
  );
};
