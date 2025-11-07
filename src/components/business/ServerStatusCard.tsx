import { ServerStatus } from '@/types';
import { cn } from '@/utils';

/**
 * 服务器状态卡片接口
 */
interface ServerStatusCardProps {
  type: 'MINIGAME' | 'SURVIVAL';
  address: string;
  status: ServerStatus;
  players: number;
  maxPlayers?: number;
  className?: string;
  maintenanceText?: string;
  description?: string;
}

/**
 * 服务器状态卡片组件 - 优化维护状态显示
 */
export const ServerStatusCard: React.FC<ServerStatusCardProps> = ({
                                                                    type,
                                                                    address,
                                                                    status,
                                                                    players,
                                                                    className,
                                                                    maintenanceText,
                                                                    description,
                                                                  }) => {
  const getStatusDotColor = (status: ServerStatus) => {
    switch (status) {
      case 'online':
        return 'bg-green-400 animate-pulse';
      case 'offline':
        return 'bg-red-500';
      case 'maintenance':
        return 'bg-yellow-500 animate-pulse';
      default:
        return 'bg-gray-500';
    }
  };

  const getCompatibilityText = (type: 'MINIGAME' | 'SURVIVAL') => {
    switch (type) {
      case 'MINIGAME':
        return '兼容 1.16.5-1.21.1';
      case 'SURVIVAL':
        return '兼容 1.7.2-latest';
      default:
        return '兼容版本未知';
    }
  };

  const getDisplayStatus = () => {
    if (status === 'maintenance') {
      return maintenanceText || '维护中';
    }
    return `${players} 在线`;
  };

  return (
    <div
      className={cn(
        'bg-[#1a1f2e]/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm',
        'max-w-xs w-full min-h-[140px] flex flex-col justify-between', // 添加最小高度和flex布局
        className
      )}
    >
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className={cn('w-3 h-3 rounded-full', getStatusDotColor(status))} />
          <span className="text-sm font-medium text-gray-300">{type}</span>
        </div>

        <div className="font-mono text-lg font-bold mb-2">{address}</div>
      </div>

      <div className="flex justify-between items-end"> {/* 改为 items-end 确保底部对齐 */}
        <div className="text-xs text-gray-300">{getCompatibilityText(type)}</div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "text-sm font-semibold",
            status === 'online' && "text-green-400",
            status === 'offline' && "text-red-400",
            status === 'maintenance' && "text-yellow-400"
          )}>
            {getDisplayStatus()}
          </div>
          {/* 维护状态下显示说明提示图标 */}
          {status === 'maintenance' && description && (
            <div className="relative inline-block">
              {/* 问号图标 - 独立的触发区域 */}
              <div className="group relative inline-block">
                <div className="w-4 h-4 rounded-md bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center cursor-help transition-all duration-200 hover:bg-yellow-500/30 hover:border-yellow-500/60">
                  <span className="text-xs text-yellow-400 font-bold">?</span>
                </div>
                {/* 提示框 - 支持换行 */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800/90 backdrop-blur-sm border border-gray-600 text-gray-200 text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-10 shadow-lg max-w-[200px] w-max whitespace-normal text-left">
                  {description}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800/90"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
