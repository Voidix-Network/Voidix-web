import type { Notice } from '@/types';
import React from 'react';
import { SmartText } from '../ui/RichText';

interface NoticeCardProps {
  notice: Notice & { id: string };
  className?: string;
}

/**
 * 公告卡片组件
 * 显示单个公告的信息
 */
export const NoticeCard: React.FC<NoticeCardProps> = ({ notice, className = '' }) => {
  // 格式化时间显示
  const formatTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) {
      return `${days}天前`;
    } else if (hours > 0) {
      return `${hours}小时前`;
    } else if (minutes > 0) {
      return `${minutes}分钟前`;
    } else {
      return '刚刚';
    }
  };

  // 安全的颜色处理
  const getSafeColor = (color: string): string => {
    // 如果是Minecraft颜色代码，转换为CSS颜色
    const minecraftColors: Record<string, string> = {
      '0': '#000000',
      '1': '#0000AA',
      '2': '#00AA00',
      '3': '#00AAAA',
      '4': '#AA0000',
      '5': '#AA00AA',
      '6': '#FFAA00',
      '7': '#AAAAAA',
      '8': '#555555',
      '9': '#5555FF',
      a: '#55FF55',
      b: '#55FFFF',
      c: '#FF5555',
      d: '#FF55FF',
      e: '#FFFF55',
      f: '#FFFFFF',
    };

    // 移除颜色代码前缀
    const cleanColor = color.toLowerCase().replace(/[&§]/g, '');

    // 检查是否是有效的颜色
    if (minecraftColors[cleanColor]) {
      return minecraftColors[cleanColor];
    }

    // 检查是否是有效的CSS颜色
    if (color.startsWith('#') && /^#[0-9A-Fa-f]{6}$/.test(color)) {
      return color;
    }

    // 默认颜色
    return '#3B82F6'; // blue-500
  };

  const borderColor = getSafeColor(notice.color);
  const timeStr = formatTime(notice.time);

  return (
    <div
      className={`bg-gray-800 rounded-lg border-l-4 border-gray-700 p-4 hover:bg-gray-750 transition-colors ${className}`}
      style={{ borderLeftColor: borderColor }}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-lg leading-tight" style={{ color: borderColor }}>
          <SmartText richText={notice.title_rich} plainText={notice.title} className="inline" />
        </h3>
        <span className="text-gray-400 text-xs whitespace-nowrap ml-4">{timeStr}</span>
      </div>

      <div className="text-gray-300 text-sm leading-relaxed">
        <SmartText richText={notice.text_rich} plainText={notice.text} className="break-words" />
      </div>

      {/* 装饰性底部边框 */}
      <div className="mt-3 pt-2 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Voidix 官方公告</span>
          <div
            className="w-2 h-2 rounded-full opacity-60"
            style={{ backgroundColor: borderColor }}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * 公告卡片加载骨架屏
 */
export const NoticeCardSkeleton: React.FC = () => (
  <div className="bg-gray-800 rounded-lg border-l-4 border-gray-700 p-4 animate-pulse">
    <div className="flex items-start justify-between mb-2">
      <div className="w-32 h-5 bg-gray-600 rounded" />
      <div className="w-16 h-3 bg-gray-700 rounded" />
    </div>
    <div className="space-y-2">
      <div className="w-full h-4 bg-gray-700 rounded" />
      <div className="w-4/5 h-4 bg-gray-700 rounded" />
    </div>
    <div className="mt-3 pt-2 border-t border-gray-700">
      <div className="flex items-center justify-between">
        <div className="w-20 h-3 bg-gray-700 rounded" />
        <div className="w-2 h-2 bg-gray-700 rounded-full" />
      </div>
    </div>
  </div>
);
