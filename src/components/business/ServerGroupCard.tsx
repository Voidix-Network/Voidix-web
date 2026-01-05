import type { ServerGroupInfo, ServerGroupStats } from '@/constants/serverGroups';
import { copyToClipboard } from '@/utils';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';

/**
 * 服务器组卡片组件属性接口
 */
export interface ServerGroupCardProps {
  groupInfo: ServerGroupInfo;
  groupStats: ServerGroupStats;
  isExpanded: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

/**
 * 服务器组卡片组件
 * 用于StatusPage显示服务器组的状态信息和管理展开状态
 */
export const ServerGroupCard: React.FC<ServerGroupCardProps> = ({
  groupInfo,
  groupStats,
  isExpanded,
  onToggle,
  children,
}) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyAddress = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(groupInfo.address);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const getGroupStatusColor = () => {
    switch (groupStats.status) {
      case 'online':
        return 'bg-green-500 animate-pulse';
      case 'partial':
        return 'bg-yellow-500 animate-pulse';
      default:
        return 'bg-red-500';
    }
  };

  const getGroupStatusText = () => {
    switch (groupStats.status) {
      case 'online':
        return '全部在线';
      case 'partial':
        return '部分在线';
      default:
        return '离线';
    }
  };

  return (
    <motion.div
      className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
      whileHover={{
        borderColor: 'rgba(147, 197, 253, 0.3)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        y: -1,
      }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* 组头部信息 */}
      <motion.div
        className="p-4 cursor-pointer transition-colors"
        onClick={onToggle}
        whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.5)' }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* 状态指示器 */}
            <div className={`w-3 h-3 rounded-full ${getGroupStatusColor()}`} />

            {/* 组名称 */}
            <div>
              <h3 className="text-white font-medium">{groupInfo.description}</h3>
              <p className="text-gray-400 text-sm">{groupInfo.address}</p>
            </div>
          </div>

          {/* 组统计和展开按钮 */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-white font-medium">{groupStats.totalPlayers} 玩家在线</p>
              <p
                className={`text-sm ${
                  groupStats.status === 'online'
                    ? 'text-green-400'
                    : groupStats.status === 'partial'
                      ? 'text-yellow-400'
                      : 'text-red-400'
                }`}
              >
                {groupStats.onlineServers}/{groupStats.totalServers} 服务器 {getGroupStatusText()}
              </p>
            </div>

            {/* 展开箭头 */}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              whileHover={{ scale: 1.1 }}
              transition={{
                rotate: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                scale: { duration: 0.2 },
              }}
            >
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* 组详细信息（展开时显示） */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0, scale: 0.95 }}
            animate={{ height: 'auto', opacity: 1, scale: 1 }}
            exit={{ height: 0, opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1],
              scale: { duration: 0.2 },
              opacity: { duration: 0.3 },
            }}
            className="border-t border-gray-700 bg-gray-800/50 overflow-hidden"
          >
            <motion.div
              className="p-4 space-y-4"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.3, ease: 'easeOut' }}
            >
              {/* 快速连接区域 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-300 mb-1">快速连接地址</p>
                  <code className="text-sm font-mono text-blue-300 bg-gray-900/50 px-2 py-1 rounded">
                    {groupInfo.address}
                  </code>
                </div>
                <button
                  onClick={handleCopyAddress}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    copySuccess
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {copySuccess ? '已复制' : '复制地址'}
                </button>
              </div>

              {/* 服务器详细列表 */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-300 mb-2">服务器详情</h4>
                {children}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
