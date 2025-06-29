// filepath: c:\Users\ASKLL\WebstormProjects\voidix-web\src\constants\serverGroups.ts

import { isLobbyServer } from '@/utils/serverUtils';

/**
 * 服务器分组配置
 * 用于StatusPage的服务器组织和显示
 */
export const SERVER_GROUPS = {
  survival: {
    name: 'survival.voidix.net',
    description: '生存服务器',
    address: 'survival.voidix.net',
    servers: ['survival'],
  },
  minigame: {
    name: 'minigame.voidix.net',
    description: '小游戏服务器',
    address: 'minigame.voidix.net',
    // 按重要性排序：登录服务器和大厅在最上，起床战争成组，其他游戏在后
    servers: [
      'login',
      'lobby1',
      'bedwars',
      'bedwars_solo',
      'bedwars_other',
      'thepit',
      'knockioffa',
    ],
  },
};

/**
 * 动态获取服务器分组配置
 * 根据实际服务器数据动态调整分组
 * @param serverIds 所有可用的服务器ID列表
 * @returns 动态调整后的服务器分组配置
 */
export const getDynamicServerGroups = (serverIds: string[]) => {
  // 找出所有的lobby服务器
  const lobbyServers = serverIds.filter(serverId => isLobbyServer(serverId));

  // 找出非lobby的小游戏服务器
  const otherMinigameServers = SERVER_GROUPS.minigame.servers.filter(
    serverId => !isLobbyServer(serverId)
  );

  // 构建动态的小游戏服务器列表
  const dynamicMinigameServers = [
    'login', // 登录服务器始终在最前
    ...lobbyServers.sort(), // 所有lobby服务器，按字母顺序排序
    ...otherMinigameServers.filter(serverId => serverId !== 'login'), // 其他游戏服务器
  ];

  return {
    survival: SERVER_GROUPS.survival,
    minigame: {
      ...SERVER_GROUPS.minigame,
      servers: dynamicMinigameServers,
    },
  };
};

/**
 * 服务器组信息类型
 */
export interface ServerGroupInfo {
  name: string;
  description: string;
  address: string;
  servers: string[];
}

/**
 * 服务器组统计信息类型
 */
export interface ServerGroupStats {
  totalPlayers: number;
  onlineServers: number;
  totalServers: number;
  status: 'online' | 'offline' | 'partial';
}
