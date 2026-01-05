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
  lobby: {
    name: 'minigame.voidix.net',
    description: '小游戏大厅',
    address: 'minigame.voidix.net',
    servers: [], // 动态填充lobby服务器
  },
  minigame: {
    name: 'minigame.voidix.net',
    description: '小游戏服务器',
    address: 'minigame.voidix.net',
    // 移除lobby服务器，只保留其他游戏服务器
    servers: [
      'login',
      'bedwars',
      'bedwars_solo',
      'bedwars_other',
      'thepit',
      'knockioffa',
      'buildbattle',
      'murdermystery',
      'skywars',
      'thebridge',
    ],
  },
};

/**
 * 动态获取服务器分组配置
 * 根据实际服务器数据动态调整分组，将小游戏大厅单独分组
 * @param serverIds 所有可用的服务器ID列表
 * @returns 动态调整后的服务器分组配置，包含三个分组：生存、小游戏大厅、小游戏
 */
export const getDynamicServerGroups = (serverIds: string[]) => {
  // 找出所有的lobby服务器并按字母顺序排序
  const lobbyServers = serverIds.filter(serverId => isLobbyServer(serverId)).sort();

  // 找出非lobby的小游戏服务器
  const otherMinigameServers = SERVER_GROUPS.minigame.servers.filter(
    serverId => !isLobbyServer(serverId) && serverIds.includes(serverId)
  );

  return {
    survival: SERVER_GROUPS.survival,
    lobby: {
      ...SERVER_GROUPS.lobby,
      servers: lobbyServers,
    },
    minigame: {
      ...SERVER_GROUPS.minigame,
      servers: otherMinigameServers,
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
