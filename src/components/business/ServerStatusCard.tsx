import { cn } from '@/utils';
import { ServerStatus } from '@/types';

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
}

/**
 * 服务器状态卡片组件 - 复现原项目的服务器状态显示
 * 更贴近原始HTML的简洁设计
 */
export const ServerStatusCard: React.FC<ServerStatusCardProps> = ({
  type,
  address,
  status,
  className,
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

  const compatibilityText = '兼容 1.7.2-最新版';

  return (
    <div
      className={cn(
        'bg-[#1a1f2e]/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm',
        'max-w-xs w-full',
        className
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={cn('w-3 h-3 rounded-full', getStatusDotColor(status))} />
        <span className="text-sm font-medium text-gray-300">{type}</span>
      </div>

      <div className="font-mono text-lg font-bold mb-2">{address}</div>

      <div className="mt-2 text-xs text-gray-300">{compatibilityText}</div>
    </div>
  );
};
