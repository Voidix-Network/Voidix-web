import { useWebSocket } from '@/hooks/useWebSocket';
import { usePlayerIgnStore, useServerPlayerIgns } from '@/stores';
import { Clock, RefreshCw, Users, Wifi, WifiOff } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * 玩家IGN悬停提示组件属性接口
 */
interface PlayerIgnTooltipProps {
  /** 服务器ID */
  serverId: string;
  /** 当前玩家数量 */
  playerCount: number;
  /** 触发元素 */
  children: React.ReactNode;
  /** 是否禁用提示 */
  disabled?: boolean;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 玩家IGN悬停提示组件 - Portal版本
 * 使用Portal渲染到body，避免容器遮挡
 */
export const PlayerIgnTooltip: React.FC<PlayerIgnTooltipProps> = ({
  serverId,
  playerCount,
  children,
  disabled = false,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const playerIgns = useServerPlayerIgns(serverId);
  const { connectionStatus } = useWebSocket();

  // 开发环境检测
  const isDev = import.meta.env.DEV;

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // 生成模拟数据用于开发环境演示
  const generateMockPlayers = (count: number) => {
    const mockNames = [
      'Steve',
      'Alex',
      'Notch',
      'Herobrine',
      'Enderman',
      'Creeper',
      'Zombie',
      'Skeleton',
      'Spider',
      'Witch',
    ];
    return Array.from({ length: Math.min(count, mockNames.length) }, (_, i) => ({
      uuid: `mock-${i + 1}`,
      ign: mockNames[i],
      serverId,
      joinTime: new Date(Date.now() - Math.random() * 3600000),
      lastSeen: new Date(),
    }));
  };

  // 获取要显示的玩家数据
  const getDisplayPlayers = () => {
    if (playerIgns.length > 0) {
      return playerIgns;
    }

    if (isDev && playerCount > 0) {
      return generateMockPlayers(playerCount);
    }

    return [];
  };

  const displayPlayers = getDisplayPlayers();
  const hasRealData = playerIgns.length > 0;
  const isConnected = connectionStatus === 'connected';

  // 调试用：获取所有IGN数据
  // 使用新的专门的hook
  const { getAllPlayerIgns } = usePlayerIgnStore();
  const allPlayerIgns = getAllPlayerIgns();

  /**
   * 计算tooltip位置（相对于viewport，靠近鼠标）
   */
  const calculatePosition = (mouseEvent?: React.MouseEvent) => {
    if (!triggerRef.current) return { x: 0, y: 0 };

    const tooltipWidth = 320;
    const tooltipHeight = 300;
    const gap = 12; // 增加间距，让tooltip更靠近但不重叠

    let x: number;
    let y: number;

    if (mouseEvent) {
      // 基于鼠标位置计算
      const mouseX = mouseEvent.clientX;
      const mouseY = mouseEvent.clientY;

      // 默认显示在鼠标右下方
      x = mouseX + gap;
      y = mouseY + gap;

      // 如果右侧空间不够，显示在左侧
      if (x + tooltipWidth > window.innerWidth - 10) {
        x = mouseX - tooltipWidth - gap;
      }

      // 如果下方空间不够，显示在上方
      if (y + tooltipHeight > window.innerHeight - 10) {
        y = mouseY - tooltipHeight - gap;
      }

      // 如果左侧超出屏幕，强制靠右
      if (x < 10) {
        x = 10;
      }

      // 如果上方超出屏幕，强制靠下
      if (y < 10) {
        y = 10;
      }
    } else {
      // 降级方案：基于元素位置
      const rect = triggerRef.current.getBoundingClientRect();
      x = rect.left + rect.width + gap;
      y = rect.top;

      // 边界检查
      if (x + tooltipWidth > window.innerWidth - 10) {
        x = rect.left - tooltipWidth - gap;
      }
      if (y + tooltipHeight > window.innerHeight - 10) {
        y = rect.top - tooltipHeight + rect.height;
      }
      if (x < 10) x = 10;
      if (y < 10) y = 10;
    }

    return { x, y };
  };

  /**
   * 处理鼠标进入
   */
  const handleMouseEnter = (event: React.MouseEvent) => {
    if (disabled || playerCount === 0) return;

    // 清除隐藏超时
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    // 计算位置并显示（传递鼠标事件以获取精确位置）
    const pos = calculatePosition(event);
    setPosition(pos);
    setIsVisible(true);
  };

  /**
   * 处理鼠标离开
   */
  const handleMouseLeave = () => {
    // 延迟隐藏
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 150);
  };

  /**
   * 处理tooltip鼠标进入
   */
  const handleTooltipMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  /**
   * 处理tooltip鼠标离开
   */
  const handleTooltipMouseLeave = () => {
    setIsVisible(false);
  };

  /**
   * 格式化时间显示
   */
  const formatJoinTime = (joinTime: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - joinTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return '刚刚';
    if (diffMinutes < 60) return `${diffMinutes}分钟前`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}小时前`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}天前`;
  };

  /**
   * 渲染不同状态的内容
   */
  const renderTooltipContent = () => {
    if (!isConnected) {
      return renderConnectionError();
    }

    if (playerCount === 0) {
      return renderEmptyState('当前无玩家在线');
    }

    if (displayPlayers.length === 0) {
      return renderLoadingState();
    }

    return renderPlayerList();
  };

  /**
   * 渲染连接错误状态
   */
  const renderConnectionError = () => {
    const isReconnecting = connectionStatus === 'reconnecting';

    return (
      <div className="flex flex-col items-center justify-center py-4 text-gray-400">
        {isReconnecting ? (
          <RefreshCw className="w-8 h-8 mb-2 opacity-50 animate-spin" />
        ) : (
          <WifiOff className="w-8 h-8 mb-2 opacity-50" />
        )}
        <p className="text-sm">{isReconnecting ? '正在重新连接...' : '无法连接到服务器'}</p>
        <p className="text-xs mt-1 text-center">
          {isReconnecting ? '请稍候片刻' : '请检查网络连接'}
        </p>
      </div>
    );
  };

  /**
   * 渲染加载状态
   */
  const renderLoadingState = () => {
    return (
      <div className="flex flex-col items-center justify-center py-4 text-gray-400">
        <RefreshCw className="w-8 h-8 mb-2 opacity-50 animate-spin" />
        <p className="text-sm">玩家信息加载中...</p>
        <p className="text-xs mt-1">检测到 {playerCount} 位玩家在线</p>
        {isDev && (
          <div className="mt-3 p-2 bg-gray-700 rounded text-xs space-y-1">
            <div>🔍 调试信息:</div>
            <div>连接状态: {connectionStatus}</div>
            <div>服务器ID: {serverId}</div>
            <div>IGN数据: {playerIgns.length} 条</div>
            <div>全局IGN: {allPlayerIgns.length} 条</div>
            {allPlayerIgns.length > 0 && (
              <div>所有服务器: {allPlayerIgns.map(p => p.serverId).join(', ')}</div>
            )}
          </div>
        )}
      </div>
    );
  };

  /**
   * 渲染空状态
   */
  const renderEmptyState = (message: string) => {
    return (
      <div className="flex flex-col items-center justify-center py-4 text-gray-400">
        <Users className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">{message}</p>
      </div>
    );
  };

  /**
   * 渲染玩家列表
   */
  const renderPlayerList = () => {
    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-gray-300 border-b border-gray-600 pb-2 mb-3">
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium">
            在线玩家 ({displayPlayers.length})
            {!hasRealData && isDev && (
              <span className="ml-2 text-xs text-yellow-400">[模拟数据]</span>
            )}
          </span>
          {isConnected && <Wifi className="w-3 h-3 text-green-400" />}
        </div>

        <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
          {displayPlayers.map(player => (
            <div
              key={player.uuid}
              className="flex items-center justify-between p-2 rounded bg-gray-700/50 hover:bg-gray-700 transition-colors group"
            >
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <div
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    hasRealData ? 'bg-green-400' : 'bg-yellow-400'
                  }`}
                />
                <span className="text-white text-sm font-medium truncate">{player.ign}</span>
              </div>

              <div className="flex items-center space-x-1 text-gray-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                <Clock className="w-3 h-3" />
                <span>{formatJoinTime(player.joinTime)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 如果禁用或没有玩家，直接返回children
  if (disabled || playerCount === 0) {
    return (
      <span className={className} style={{ cursor: 'default' }}>
        {children}
      </span>
    );
  }

  return (
    <>
      {/* 触发区域 */}
      <div
        ref={triggerRef}
        className={`inline-block ${className}`}
        style={{ cursor: 'help' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>

      {/* 使用Portal渲染tooltip到body */}
      {isVisible &&
        createPortal(
          <div
            className="fixed z-50 w-80 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl p-4 transition-opacity duration-200"
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
          >
            {/* 内容 */}
            {renderTooltipContent()}
          </div>,
          document.body
        )}
    </>
  );
};
