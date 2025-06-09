// filepath: c:\Users\ASKLL\WebstormProjects\voidix-web\src\constants\serverGroups.ts

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
