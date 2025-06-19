import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { ServerDataState, ServerDataActions } from './types';
import type { ServerInfo, ServerData, AggregateStats } from '@/types';
import { MINIGAME_KEYS, SERVER_DISPLAY_NAMES } from '@/constants';

/**
 * 服务器数据初始状态
 */
const initialServerDataState: ServerDataState = {
  servers: {},
  aggregateStats: {
    totalPlayers: 0,
    onlineServers: 0,
    totalUptime: 0,
  },
};

/**
 * 服务器数据管理Store
 * 负责管理服务器列表、状态更新和聚合统计
 */
export const useServerDataStore = create<ServerDataState & ServerDataActions>()(
  subscribeWithSelector((set, get) => ({
    ...initialServerDataState,

    /**
     * 更新单个服务器状态
     * @param serverId - 服务器ID
     * @param update - 要更新的服务器数据
     */
    updateServer: (serverId: string, update: Partial<ServerInfo>) => {
      const currentServer = get().servers[serverId];

      if (!currentServer) {
        // 如果服务器不存在，创建一个基础的服务器记录
        const displayName =
          SERVER_DISPLAY_NAMES[serverId as keyof typeof SERVER_DISPLAY_NAMES] || serverId;

        const newServer: ServerInfo = {
          id: serverId,
          name: serverId,
          displayName,
          address: `${serverId}.voidix.net`,
          status: 'online',
          players: 0,
          maxPlayers: 1000,
          uptime: 0,
          totalUptime: 0,
          lastUpdate: new Date(),
          isOnline: true,
          ...update, // 应用传入的更新
        };

        set(state => ({
          servers: {
            ...state.servers,
            [serverId]: newServer,
          },
        }));

        if (import.meta.env.DEV) {
          console.log(`[ServerDataStore] 创建新服务器: ${serverId}`, newServer);
        }
      } else {
        set(state => ({
          servers: {
            ...state.servers,
            [serverId]: {
              ...currentServer,
              ...update,
              lastUpdate: update.lastUpdate || new Date(),
            },
          },
        }));
      }

      // 异步计算聚合统计，避免阻塞UI
      setTimeout(() => get().calculateAggregateStats(), 0);
    },

    /**
     * 从原始服务器数据更新服务器状态
     * @param serverId - 服务器ID
     * @param data - 原始服务器数据
     */
    updateServerFromData: (serverId: string, data: ServerData) => {
      const displayName =
        SERVER_DISPLAY_NAMES[serverId as keyof typeof SERVER_DISPLAY_NAMES] || serverId;

      // 智能判断服务器在线状态
      const isServerOnline =
        data.isOnline !== undefined ? data.isOnline : data.online !== undefined && data.online >= 0;

      const currentServer = get().servers[serverId];
      const serverInfo: ServerInfo = {
        id: serverId,
        name: serverId,
        displayName,
        address: `${serverId}.voidix.net`,
        status: isServerOnline ? 'online' : 'offline',
        players: data.online || 0,
        maxPlayers: currentServer?.maxPlayers || 1000,
        uptime: data.uptime || currentServer?.uptime || 0,
        totalUptime: data.uptime || currentServer?.totalUptime || 0,
        lastUpdate: new Date(),
        isOnline: isServerOnline,
      };

      set(state => ({
        servers: {
          ...state.servers,
          [serverId]: serverInfo,
        },
      }));

      if (import.meta.env.DEV) {
        console.log(`[ServerDataStore] 更新服务器 ${serverId}:`, {
          playersCount: data.online,
          isOnlineFromData: data.isOnline,
          calculatedOnline: isServerOnline,
          finalStatus: isServerOnline ? 'online' : 'offline',
        });
      }

      // 异步计算聚合统计，避免阻塞UI
      setTimeout(() => get().calculateAggregateStats(), 0);
    },

    /**
     * 批量更新多个服务器
     * 优化性能，减少重复的状态更新和重渲染
     * @param servers - 服务器数据映射
     */
    updateMultipleServers: (servers: Record<string, ServerData>) => {
      const serverEntries = Object.entries(servers);

      if (import.meta.env.DEV) {
        console.log('[ServerDataStore] 批量更新服务器:', {
          serverCount: serverEntries.length,
          servers: serverEntries.map(([id]) => id),
          updates: serverEntries.map(([id, data]) => ({
            id,
            players: data.online,
            isOnline: data.isOnline,
          })),
        });
      }

      // 批量计算所有更新，减少中间状态
      const currentServers = get().servers;
      const updates = serverEntries.reduce(
        (acc, [serverId, data]) => {
          const displayName =
            SERVER_DISPLAY_NAMES[serverId as keyof typeof SERVER_DISPLAY_NAMES] || serverId;

          const isServerOnline =
            data.isOnline !== undefined
              ? data.isOnline
              : data.online !== undefined && data.online >= 0;

          const currentServer = currentServers[serverId];

          acc[serverId] = {
            id: serverId,
            name: serverId,
            displayName,
            address: `${serverId}.voidix.net`,
            status: isServerOnline ? 'online' : 'offline',
            players: data.online || 0,
            maxPlayers: currentServer?.maxPlayers || 1000,
            uptime: data.uptime || currentServer?.uptime || 0,
            totalUptime: data.uptime || currentServer?.totalUptime || 0,
            lastUpdate: new Date(),
            isOnline: isServerOnline,
          };

          return acc;
        },
        {} as Record<string, ServerInfo>
      );

      // 单次状态更新，提升性能
      set(state => ({
        servers: {
          ...state.servers,
          ...updates,
        },
      }));

      if (import.meta.env.DEV) {
        console.log('[ServerDataStore] 服务器更新完成，当前状态:', {
          totalServers: Object.keys(get().servers).length,
          totalPlayers: get().aggregateStats.totalPlayers,
        });
      }

      // 异步计算聚合统计，避免阻塞UI
      setTimeout(() => get().calculateAggregateStats(), 0);
    },

    /**
     * 更新总玩家数
     * @param totalPlayers - 总玩家数字符串
     */
    updateTotalPlayers: (totalPlayers: string) => {
      set(state => ({
        aggregateStats: {
          ...state.aggregateStats,
          totalPlayers: parseInt(totalPlayers) || 0,
        },
      }));
    },

    /**
     * 计算聚合统计
     * 排除内部测试服务器(anticheat_test)
     */
    calculateAggregateStats: () => {
      const { servers } = get();
      // 排除anticheat_test服务器（内部测试服务器）
      const serverList = Object.entries(servers)
        .filter(([serverId]) => serverId !== 'anticheat_test')
        .map(([, server]) => server);

      if (import.meta.env.DEV) {
        console.log('[ServerDataStore] 计算聚合统计，排除anticheat_test:', {
          totalServers: Object.keys(servers).length,
          filteredServers: serverList.length,
          excludedServers: ['anticheat_test'],
        });
      }

      const newStats: AggregateStats = {
        totalPlayers: serverList.reduce((sum, server) => sum + server.players, 0),
        onlineServers: serverList.filter(server => server.status === 'online').length,
        totalUptime: Math.max(...serverList.map(server => server.uptime), 0),
      };

      set({ aggregateStats: newStats });
    },

    /**
     * 获取小游戏聚合统计
     * @returns 小游戏服务器的聚合数据
     */
    getMinigameAggregateStats: () => {
      const { servers } = get();

      let onlineCount = 0;
      let isOnline = false;
      let allPresent = MINIGAME_KEYS.every(key => servers[key] !== undefined);

      MINIGAME_KEYS.forEach(key => {
        const server = servers[key];
        if (server && server.isOnline) {
          onlineCount += server.players;
          isOnline = true;
        }
      });

      return {
        onlineCount,
        isOnline,
        allPresent,
      };
    },

    /**
     * 重置服务器数据状态
     */
    reset: () => {
      set(initialServerDataState);
    },
  }))
);

/**
 * 便捷的Hook - 获取服务器列表
 */
export const useServers = () => useServerDataStore(state => state.servers);

/**
 * 便捷的Hook - 获取聚合统计
 */
export const useAggregateStats = () => useServerDataStore(state => state.aggregateStats);

/**
 * 便捷的Hook - 获取单个服务器信息
 */
export const useServer = (serverId: string) => useServerDataStore(state => state.servers[serverId]);

/**
 * 便捷的Hook - 获取小游戏聚合统计
 */
export const useMinigameStats = () =>
  useServerDataStore(state => state.getMinigameAggregateStats());
