import { useServerPlayerIgns } from '@/stores';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';

/**
 * 单个服务器卡片组件属性接口
 */
export interface ServerCardProps {
  serverId: string;
  serverInfo: any;
  displayName: string;
  categoryTitle?: string;
}

/**
 * 单个服务器卡片组件
 * 用于StatusPage显示单个服务器的状态信息
 */
export const ServerCard: React.FC<ServerCardProps> = ({
  serverId,
  serverInfo,
  displayName,
  categoryTitle,
}) => {
  const playerList = useServerPlayerIgns(serverId);
  const [isHovered, setIsHovered] = useState(false);

  if (!serverInfo) return null;

  const status = serverInfo.isOnline ? 'online' : 'offline';
  const players = serverInfo.players || 0;

  return (
    <div
      className="bg-gray-700/50 rounded p-3 hover:bg-gray-700/70 transition-colors duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 第一行：状态、服务器名、在线人数 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`w-2 h-2 rounded-full ${
              status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}
          />
          <span className={`text-sm ${categoryTitle ? 'font-normal' : 'font-medium'} text-white`}>
            {displayName}
          </span>
        </div>

        <span
          className={`text-sm font-mono ${
            status === 'online' ? 'text-green-400' : 'text-red-400'
          } transition-colors`}
        >
          {status === 'online' ? `${players} 在线` : '离线'}
        </span>
      </div>

      {/* 第二行：玩家信息（悬停时显示）*/}
      <AnimatePresence>
        {isHovered && status === 'online' && players > 0 && (
          <motion.div
            className="mt-2 pl-5 overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            {playerList.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {playerList.map(player => (
                  <span
                    key={player.uuid}
                    className="text-xs text-gray-400 bg-gray-600/30 px-1.5 py-0.5 rounded"
                    title={player.ign}
                  >
                    {player.ign}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-gray-500">加载玩家信息中...</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
