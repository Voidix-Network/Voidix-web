// filepath: c:\Users\ASKLL\WebstormProjects\voidix-web\src\components\layout\footer\ServerStatusBar.tsx
import { useServerStore } from '@/stores/serverStore';

/**
 * 服务器状态栏组件
 * 显示服务器连接状态和在线玩家数量
 */
export const ServerStatusBar: React.FC = () => {
  const { aggregateStats, connectionStatus, lastUpdateTime } = useServerStore();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
        <div className="flex items-center gap-3">
          <div
            className={`w-4 h-4 rounded-full ${
              connectionStatus === 'connected'
                ? 'bg-green-400 shadow-lg shadow-green-400/30'
                : 'bg-red-400 shadow-lg shadow-red-400/30'
            }`}
          />
          <span
            className={`text-sm font-medium ${
              connectionStatus === 'connected' ? 'text-green-400' : 'text-red-400'
            }`}
          >
            服务器状态: {connectionStatus === 'connected' ? '正常运行' : '连接中断'}
          </span>
        </div>
        {aggregateStats.totalPlayers > 0 && (
          <div className="text-sm text-gray-300">
            在线玩家:{' '}
            <span className="text-green-400 font-semibold">{aggregateStats.totalPlayers}</span>
          </div>
        )}
      </div>
      <div className="text-sm text-gray-400">
        最后更新: {lastUpdateTime ? lastUpdateTime.toLocaleString('zh-CN') : '获取中...'}
      </div>
    </div>
  );
};
