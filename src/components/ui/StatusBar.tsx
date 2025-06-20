/**
 * 监控状态条组件
 * 参考 https://github.com/yb/uptime-status 实现
 * 显示90天的监控状态，支持故障渐变色和悬停提示
 * 今天在最右边，渐变色基于24小时中的宕机时长
 */

import React from 'react';
import { DailyData } from '@/services/uptimeRobotApi';

interface StatusBarProps {
  dailyData: DailyData[];
  className?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({ dailyData, className = '' }) => {
  // 确保数组按日期排序，今天在最右边
  const sortedData = [...dailyData].sort((a, b) => a.date.unix() - b.date.unix());

  /**
   * 获取状态条颜色 - Discord风格，完全正常vs有任何问题的明显区别
   * 100% = Discord绿色，有任何宕机 = Discord黄绿色开始的渐变
   */
  const getBarStyle = (data: DailyData): React.CSSProperties => {
    const { uptime, down } = data;

    // 无数据时显示灰色
    if (uptime <= 0 && down.times === 0) {
      return { backgroundColor: '#6b7280' }; // 无数据 - 灰色
    }

    // 确保可用率在0-100之间
    const uptimePercent = Math.max(0, Math.min(uptime, 100));

    // Discord风格颜色方案：100%完美绿色，有任何问题就变黄绿色
    if (uptimePercent >= 100) {
      // 100%: Discord完美绿色
      return { backgroundColor: '#3ba55c' }; // Discord正常绿色
    } else if (uptimePercent >= 99.5) {
      // 99.5%-99.99%: Discord轻微问题的黄绿色
      return { backgroundColor: '#8e9333' }; // Discord轻微问题黄绿色
    } else if (uptimePercent >= 95) {
      // 95%-99.5%: 偏黄色
      return { backgroundColor: '#d4ac0d' }; // 更偏黄色
    } else if (uptimePercent >= 85) {
      // 85%-95%: 橙色
      return { backgroundColor: '#e67e22' }; // 橙色
    } else if (uptimePercent >= 70) {
      // 70%-85%: 深橙色
      return { backgroundColor: '#e74c3c' }; // 红橙色
    } else {
      // 0%-70%: 深红色
      return { backgroundColor: '#c0392b' }; // 深红色
    }
  };

  /**
   * 生成悬停提示文本
   */
  const getTooltipText = (data: DailyData): string => {
    const { date, uptime, down } = data;
    const dateStr = date.format('YYYY-MM-DD');
    const isToday = date.isSame(new Date(), 'day');
    const dayLabel = isToday ? '今天' : dateStr;

    if (uptime <= 0 && down.times === 0) {
      return `${dayLabel} - 无数据`;
    }

    if (uptime >= 100) {
      return `${dayLabel} - 可用率 ${uptime.toFixed(2)}%`;
    }

    if (down.times > 0) {
      const downtimeMinutes = Math.round(down.duration / 60);
      const hours = Math.floor(downtimeMinutes / 60);
      const minutes = downtimeMinutes % 60;

      let durationText = '';
      if (hours > 0) {
        durationText = `${hours}小时${minutes}分钟`;
      } else {
        durationText = `${minutes}分钟`;
      }

      return `${dayLabel} - 故障 ${down.times} 次，累计 ${durationText}，可用率 ${uptime.toFixed(2)}%`;
    }

    return `${dayLabel} - 可用率 ${uptime.toFixed(2)}%`;
  };

  return (
    <div className={`${className}`}>
      {/* 状态条 */}
      <div className="flex gap-[1px] h-6 bg-gray-800 p-1 rounded">
        {sortedData.map((data, index) => (
          <div
            key={`${data.date.format('YYYY-MM-DD')}-${index}`}
            className="flex-1 rounded-sm cursor-pointer hover:opacity-70 transition-opacity"
            style={getBarStyle(data)}
            title={getTooltipText(data)}
          />
        ))}
      </div>

      {/* 时间标签 */}
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span>{sortedData.length}天前</span>
        <span>今天</span>
      </div>
    </div>
  );
};
