import { useWebSocketV2 } from '@/hooks/useWebSocketV2';

/**
 * 服务器状态栏组件
 * 显示服务器连接状态和在线玩家数量
 * 适配新版API
 */
export const ServerStatusBar: React.FC = () => {
  const { connectionStatus, aggregateStats, runtimeInfo } = useWebSocketV2();

  // 获取最后更新时间
  const getLastUpdateTime = () => {
    return runtimeInfo ? new Date().toLocaleString('zh-CN') : '获取中...';
  };

  // 骨架屏组件
  const StatusSkeleton = () => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-gray-600 animate-pulse" />
          <div className="w-24 h-4 bg-gray-600 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-4 bg-gray-600 rounded animate-pulse" />
          <div className="w-8 h-4 bg-gray-600 rounded animate-pulse" />
        </div>
      </div>
      <div className="w-32 h-4 bg-gray-600 rounded animate-pulse" />
    </div>
  );

  // 获取连接状态文本
  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return '正常运行';
      case 'reconnecting':
        return '重连中...';
      case 'failed':
        return '连接失败';
      case 'disconnected':
        return '已断开';
      default:
        return '连接中...';
    }
  };

  // 获取连接状态颜色
  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          dot: 'bg-green-400 shadow-lg shadow-green-400/30',
          text: 'text-green-400',
        };
      case 'reconnecting':
        return {
          dot: 'bg-yellow-400 shadow-lg shadow-yellow-400/30 animate-pulse',
          text: 'text-yellow-400',
        };
      case 'failed':
      case 'disconnected':
        return {
          dot: 'bg-red-400 shadow-lg shadow-red-400/30',
          text: 'text-red-400',
        };
      default:
        return {
          dot: 'bg-gray-400 shadow-lg shadow-gray-400/30',
          text: 'text-gray-400',
        };
    }
  };

  const statusColors = getConnectionStatusColor();

  // 如果数据还未加载，显示骨架屏
  if (connectionStatus === 'connecting' && !runtimeInfo) {
    return <StatusSkeleton />;
  }

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 min-h-[40px]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
        <div className="flex items-center gap-3 min-w-[140px]">
          <div className={`w-4 h-4 rounded-full flex-shrink-0 ${statusColors.dot}`} />
          <span className={`text-sm font-medium ${statusColors.text}`}>
            服务器状态: {getConnectionStatusText()}
          </span>
        </div>
        <div className="text-sm text-gray-300 min-w-[120px]">
          在线玩家:{' '}
          <span className="text-green-400 font-semibold">{aggregateStats?.totalPlayers || 0}</span>
        </div>
      </div>
      <div className="text-sm text-gray-300 min-w-[180px]">最后更新: {getLastUpdateTime()}</div>
    </div>
  );
};
