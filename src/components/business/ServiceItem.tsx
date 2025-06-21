/**
 * 监控服务项组件
 * 参考 https://github.com/yb/uptime-status 实现
 * 显示单个监控项目的详细状态信息
 */

import React from 'react';
import { StatusBar } from '@/components/ui/StatusBar';
import { EnhancedMonitor, formatDuration, UptimeRobotApiService } from '@/services/uptimeRobotApi';

interface ServiceItemProps {
  monitor: EnhancedMonitor;
  className?: string;
}

export const ServiceItem: React.FC<ServiceItemProps> = ({ monitor, className = '' }) => {
  const statusLabel = UptimeRobotApiService.getStatusLabel(monitor.status);
  const statusColor = UptimeRobotApiService.getStatusColorClass(monitor.status);

  return (
    <div className={`border-b border-gray-700/50 py-6 ${className}`}>
      {/* 服务名称和状态 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white">{monitor.name}</h3>
        </div>
        <span className={`text-sm font-medium ${statusColor}`}>{statusLabel}</span>
      </div>

      {/* 状态条 */}
      <StatusBar dailyData={monitor.daily} className="mb-4" />

      {/* 汇总信息 */}
      <div className="flex justify-between text-sm text-gray-400">
        <span>过去90天</span>
        <span>
          {monitor.total.times > 0
            ? `故障 ${monitor.total.times} 次，累计 ${formatDuration(monitor.total.duration)}，平均可用率 ${monitor.average}%`
            : `平均可用率 ${monitor.average}%`}
        </span>
      </div>
    </div>
  );
};
