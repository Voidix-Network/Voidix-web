/**
 * 监控状态指示器组件
 */

import React from 'react';
import { MonitorStatus } from '@/types/uptimeRobot';
import { UptimeRobotApiService } from '@/services/uptimeRobotApi';

interface StatusIndicatorProps {
  status: MonitorStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 'md',
  showLabel = false,
  className = '',
}) => {
  const statusLabel = UptimeRobotApiService.getStatusLabel(status);
  const colorClass = UptimeRobotApiService.getStatusColorClass(status);

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  // 从颜色类中提取颜色信息并生成对应的背景色
  const getBgColorClass = (textColorClass: string): string => {
    if (textColorClass.includes('green')) return 'bg-green-400';
    if (textColorClass.includes('red')) return 'bg-red-400';
    if (textColorClass.includes('yellow')) return 'bg-yellow-400';
    if (textColorClass.includes('blue')) return 'bg-blue-400';
    return 'bg-gray-400';
  };

  const bgColorClass = getBgColorClass(colorClass);
  const dotClass = `${sizeClasses[size]} rounded-full ${bgColorClass}`;

  if (showLabel) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={dotClass} />
        <span className={`font-medium ${colorClass} ${labelSizeClasses[size]}`}>{statusLabel}</span>
      </div>
    );
  }

  return <div className={`${dotClass} ${className}`} title={statusLabel} />;
};
