/**
 * 监控概览统计组件
 * 显示所有监控项目的总体统计信息
 */

import React from 'react';
import { MonitorCardData, MonitorStatus } from '@/types/uptimeRobot';
import { StatusIndicator } from '@/components/ui/StatusIndicator';

interface MonitorOverviewProps {
  monitors: MonitorCardData[];
  className?: string;
}

export const MonitorOverview: React.FC<MonitorOverviewProps> = ({ monitors, className = '' }) => {
  // 计算统计数据
  const totalMonitors = monitors.length;
  const upMonitors = monitors.filter(m => m.status === MonitorStatus.UP).length;
  const downMonitors = monitors.filter(
    m => m.status === MonitorStatus.DOWN || m.status === MonitorStatus.SEEMS_DOWN
  ).length;
  // const pausedMonitors = monitors.filter(m => m.status === MonitorStatus.PAUSED).length;

  const overallUptime =
    totalMonitors > 0
      ? monitors.reduce((sum, m) => sum + m.uptimePercentage, 0) / totalMonitors
      : 0;

  const averageResponseTime =
    totalMonitors > 0
      ? monitors.filter(m => m.responseTime > 0).reduce((sum, m) => sum + m.responseTime, 0) /
        Math.max(1, monitors.filter(m => m.responseTime > 0).length)
      : 0;

  // 确定整体状态
  const getOverallStatus = (): { status: MonitorStatus; label: string; color: string } => {
    if (downMonitors > 0) {
      return {
        status: MonitorStatus.DOWN,
        label: '部分故障',
        color: 'text-red-400',
      };
    }
    if (upMonitors === totalMonitors && totalMonitors > 0) {
      return {
        status: MonitorStatus.UP,
        label: '全部正常',
        color: 'text-green-400',
      };
    }
    return {
      status: MonitorStatus.NOT_CHECKED_YET,
      label: '检查中',
      color: 'text-blue-400',
    };
  };

  const overallStatus = getOverallStatus();

  const formatResponseTime = (time: number): string => {
    if (time <= 0) return '0ms';
    if (time < 1000) return `${Math.round(time)}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  return (
    <div
      className={`bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50 rounded-xl p-6 ${className}`}
    >
      {/* 头部：整体状态 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">系统监控概览</h2>
          <div className="flex items-center gap-2">
            <StatusIndicator status={overallStatus.status} size="md" />
            <span className={`text-lg font-semibold ${overallStatus.color}`}>
              {overallStatus.label}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-white">
            {upMonitors}/{totalMonitors}
          </div>
          <div className="text-sm text-gray-400">服务正常</div>
        </div>
      </div>

      {/* 统计网格 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 正常服务 */}
        <div className="bg-green-400/10 border border-green-400/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{upMonitors}</div>
          <div className="text-sm text-gray-300">正常</div>
        </div>

        {/* 故障服务 */}
        <div className="bg-red-400/10 border border-red-400/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{downMonitors}</div>
          <div className="text-sm text-gray-300">故障</div>
        </div>

        {/* 平均在线时间 */}
        <div className="bg-blue-400/10 border border-blue-400/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{overallUptime.toFixed(1)}%</div>
          <div className="text-sm text-gray-300">平均在线时间</div>
        </div>

        {/* 平均响应时间 */}
        <div className="bg-purple-400/10 border border-purple-400/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {formatResponseTime(averageResponseTime)}
          </div>
          <div className="text-sm text-gray-300">平均响应时间</div>
        </div>
      </div>

      {/* 底部：更新时间 */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700/30">
        <span className="text-sm text-gray-400">监控项目总数: {totalMonitors}</span>
        <span className="text-sm text-gray-400">
          最后更新: {new Date().toLocaleTimeString('zh-CN')}
        </span>
      </div>
    </div>
  );
};
