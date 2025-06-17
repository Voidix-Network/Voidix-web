import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  ServerInfo,
  ConnectionStatus,
  AggregateStats,
  ServerData,
  PlayerIgnInfo,
  ServerPlayerIgns,
} from '@/types';
import {
  MINIGAME_KEYS,
  SERVER_DISPLAY_NAMES,
  // TIME_CONSTANTS // 暂时不使用，但保留导入以备后用
} from '@/constants';

/**
 * 服务器状态接口
 */
interface ServerState {
  // 核心状态
  servers: Record<string, ServerInfo>;
  connectionStatus: ConnectionStatus;
  aggregateStats: AggregateStats;

  // 维护模式状态
  isMaintenance: boolean;
  maintenanceStartTime: string | null;
  forceShowMaintenance: boolean;

  // 运行时间状态
  runningTime: number | null;
  totalRunningTime: number | null;
  initialRunningTimeSeconds: number | null;
  initialTotalRunningTimeSeconds: number | null;
  lastUptimeUpdateTimestamp: number | null;

  // 数据更新时间跟踪
  lastUpdateTime: Date | null; // 最后数据更新时间

  // 玩家位置跟踪
  playersLocation: Record<string, string>; // playerId: serverId

  // 玩家IGN数据存储
  playerIgns: Record<string, PlayerIgnInfo>; // uuid: PlayerIgnInfo
  serverPlayerIgns: ServerPlayerIgns; // serverId: PlayerIgnInfo[]
}

/**
 * 状态操作接口
 */
interface ServerActions {
  // 连接状态管理
  updateConnectionStatus: (status: ConnectionStatus) => void;

  // 服务器状态管理
  updateServer: (serverId: string, serverData: Partial<ServerInfo>) => void;
  updateServerFromData: (serverId: string, data: ServerData) => void;
  updateMultipleServers: (servers: Record<string, ServerData>) => void;
  // 完整状态更新
  handleFullUpdate: (data: {
    servers: Record<string, ServerData>;
    players: { online: string; currentPlayers: Record<string, any> };
    runningTime?: number | string;
    totalRunningTime?: number | string;
    isMaintenance: boolean;
    maintenanceStartTime: string | null;
  }) => void;

  // 维护模式管理
  updateMaintenanceStatus: (
    isMaintenance: boolean,
    startTime?: string | null,
    force?: boolean
  ) => void;
  // 玩家数据更新
  updateTotalPlayers: (totalPlayers: string) => void;
  recalculateAfterPlayerChange: () => void;

  // 玩家位置跟踪
  handlePlayerAdd: (playerId: string, serverId: string) => void;
  handlePlayerRemove: (playerId: string) => void;
  handlePlayerMove: (playerId: string, fromServer: string, toServer: string) => void;

  // 玩家IGN管理
  addPlayerIgn: (uuid: string, ign: string, serverId: string) => void;
  removePlayerIgn: (uuid: string) => void;
  updatePlayerIgn: (uuid: string, updates: Partial<PlayerIgnInfo>) => void;
  getServerPlayerIgns: (serverId: string) => PlayerIgnInfo[];
  getAllPlayerIgns: () => PlayerIgnInfo[];

  // 运行时间管理
  updateRunningTime: (runningTime: number, totalRunningTime: number) => void;
  startRealtimeUptimeTracking: () => void;
  stopRealtimeUptimeTracking: () => void;

  // 聚合统计计算
  calculateAggregateStats: () => void;

  // 实用方法
  getMinigameAggregateStats: () => {
    onlineCount: number;
    isOnline: boolean;
    allPresent: boolean;
  };
  reset: () => void;
}

// 初始状态
const initialState: ServerState = {
  servers: {},
  connectionStatus: 'disconnected',
  aggregateStats: {
    totalPlayers: 0,
    onlineServers: 0,
    totalUptime: 0,
  },
  isMaintenance: false,
  maintenanceStartTime: null,
  forceShowMaintenance: false,
  runningTime: null,
  totalRunningTime: null,
  initialRunningTimeSeconds: null,
  initialTotalRunningTimeSeconds: null,
  lastUptimeUpdateTimestamp: null,
  lastUpdateTime: null, // 初始化为null
  playersLocation: {}, // 玩家位置跟踪
  playerIgns: {}, // 玩家IGN数据存储
  serverPlayerIgns: {}, // 按服务器分组的IGN列表
};

// 运行时间更新定时器ID
let uptimeIntervalId: NodeJS.Timeout | null = null;

/**
 * 服务器状态管理Store
 * 基于原项目的状态管理逻辑，使用Zustand实现类型安全的状态管理
 */
export const useServerStore = create<ServerState & ServerActions>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    /**
     * 更新连接状态
     */
    updateConnectionStatus: (status: ConnectionStatus) => {
      set({ connectionStatus: status });
    },

    /**
     * 更新单个服务器状态
     */
    updateServer: (serverId: string, update: Partial<ServerInfo>) => {
      set(state => ({
        servers: {
          ...state.servers,
          [serverId]: {
            ...state.servers[serverId],
            ...update,
            lastUpdate: new Date(),
          } as ServerInfo,
        },
        lastUpdateTime: new Date(), // 更新全局数据更新时间
      }));

      // 自动计算聚合统计
      get().calculateAggregateStats();
    } /**
     * 从原始服务器数据更新服务器状态
     */,
    updateServerFromData: (serverId: string, data: ServerData) => {
      const displayName =
        SERVER_DISPLAY_NAMES[serverId as keyof typeof SERVER_DISPLAY_NAMES] || serverId;

      // 智能判断服务器在线状态
      // 1. 如果明确提供了isOnline字段，优先使用
      // 2. 如果能获取到玩家数量(包括0)，认为服务器在线
      // 3. 只有当无法获取数据时才认为离线
      const isServerOnline =
        data.isOnline !== undefined ? data.isOnline : data.online !== undefined && data.online >= 0;

      const currentServer = get().servers[serverId];

      set(state => ({
        servers: {
          ...state.servers,
          [serverId]: {
            id: serverId,
            name: serverId,
            displayName,
            address: `${serverId}.voidix.net`,
            status: isServerOnline ? 'online' : 'offline',
            players: data.online || 0,
            maxPlayers: currentServer?.maxPlayers || 1000, // 保持现有最大玩家数
            uptime: data.uptime || currentServer?.uptime || 0,
            totalUptime: data.uptime || currentServer?.totalUptime || 0,
            lastUpdate: new Date(),
            isOnline: isServerOnline,
          },
        },
        lastUpdateTime: new Date(), // 更新全局数据更新时间
      }));

      console.log(`[ServerStore] 更新服务器 ${serverId}:`, {
        playersCount: data.online,
        isOnlineFromData: data.isOnline,
        calculatedOnline: isServerOnline,
        finalStatus: isServerOnline ? 'online' : 'offline',
      });

      get().calculateAggregateStats();
    } /**
     * 批量更新多个服务器
     */,
    updateMultipleServers: (servers: Record<string, ServerData>) => {
      console.log('[ServerStore] 批量更新服务器:', {
        serverCount: Object.keys(servers).length,
        servers: Object.keys(servers),
        updates: Object.entries(servers).map(([id, data]) => ({
          id,
          players: data.online,
          isOnline: data.isOnline,
        })),
      });

      const { updateServerFromData } = get();
      Object.entries(servers).forEach(([serverId, data]) => {
        updateServerFromData(serverId, data);
      });

      console.log('[ServerStore] 服务器更新完成，当前状态:', {
        totalServers: Object.keys(get().servers).length,
        totalPlayers: get().aggregateStats.totalPlayers,
      });
    },

    /**
     * 处理完整状态更新（对应原项目的handleIndexFullMessage）
     */
    handleFullUpdate: data => {
      const state = get();

      // 更新服务器数据
      if (data.servers) {
        state.updateMultipleServers(data.servers);
      }

      // 更新总玩家数
      if (data.players?.online) {
        state.updateTotalPlayers(data.players.online);
      }
      // 更新运行时间
      if (data.runningTime !== undefined && data.totalRunningTime !== undefined) {
        // 确保转换为数字类型，WebSocket传来的可能是字符串
        const runningTimeNum =
          typeof data.runningTime === 'string' ? parseInt(data.runningTime, 10) : data.runningTime;
        const totalRunningTimeNum =
          typeof data.totalRunningTime === 'string'
            ? parseInt(data.totalRunningTime, 10)
            : data.totalRunningTime;

        state.updateRunningTime(runningTimeNum, totalRunningTimeNum);
      }

      // 更新维护状态
      state.updateMaintenanceStatus(
        data.isMaintenance,
        data.maintenanceStartTime,
        state.forceShowMaintenance
      );

      // 更新全局数据更新时间
      set({ lastUpdateTime: new Date() });

      // 如果不在维护模式，启动实时运行时间跟踪
      if (!data.isMaintenance && !state.forceShowMaintenance) {
        state.startRealtimeUptimeTracking();
      } else {
        state.stopRealtimeUptimeTracking();
      }
    },

    /**
     * 更新维护状态
     */
    updateMaintenanceStatus: (isMaintenance: boolean, startTime = null, force = false) => {
      set({
        isMaintenance: force ? true : isMaintenance,
        maintenanceStartTime: startTime,
        forceShowMaintenance: force,
        lastUpdateTime: new Date(), // 更新全局数据更新时间
      });
    } /**
     * 更新总玩家数
     */,
    updateTotalPlayers: (totalPlayers: string) => {
      set(state => ({
        aggregateStats: {
          ...state.aggregateStats,
          totalPlayers: parseInt(totalPlayers) || 0,
        },
        lastUpdateTime: new Date(), // 更新全局数据更新时间
      }));
    } /**
     * 处理玩家状态变化（上线/下线）后的重新计算
     */,
    recalculateAfterPlayerChange: () => {
      console.log('[ServerStore] 玩家状态变化，重新计算聚合统计');
      get().calculateAggregateStats();
    },

    /**
     * 处理玩家上线，记录位置并更新服务器玩家数
     * 增强版：支持重复记录检查，防止状态不一致
     */
    handlePlayerAdd: (playerId: string, serverId: string) => {
      console.log(`[ServerStore] 玩家 ${playerId} 上线到服务器 ${serverId}`);

      const state = get();
      const currentServer = state.servers[serverId];
      const existingLocation = state.playersLocation[playerId];

      // 检查是否有重复记录
      if (existingLocation) {
        if (existingLocation === serverId) {
          console.warn(`[ServerStore] 玩家 ${playerId} 重复上线到同一服务器 ${serverId}，跳过处理`);
          return;
        } else {
          console.log(`[ServerStore] 玩家 ${playerId} 从 ${existingLocation} 移动到 ${serverId}，处理为移动操作`);
          // 使用移动处理逻辑
          get().handlePlayerMove(playerId, existingLocation, serverId);
          return;
        }
      }

      if (currentServer) {
        // 记录玩家位置并更新服务器状态
        set(state => ({
          playersLocation: {
            ...state.playersLocation,
            [playerId]: serverId,
          },
          servers: {
            ...state.servers,
            [serverId]: {
              ...currentServer,
              players: currentServer.players + 1,
              lastUpdate: new Date(),
            },
          },
        }));

        console.log(`[ServerStore] 玩家 ${playerId} 成功上线到 ${serverId}，玩家数: ${currentServer.players} → ${currentServer.players + 1}`);

        // 重新计算聚合统计
        get().recalculateAfterPlayerChange();
      } else {
        console.warn(`[ServerStore] 尝试添加玩家到未知服务器: ${serverId}`);
        console.warn(`[ServerStore] 可用服务器列表:`, Object.keys(state.servers));
        
        // 仍然记录位置，但不更新服务器玩家数
        set(state => ({
          playersLocation: {
            ...state.playersLocation,
            [playerId]: serverId,
          },
        }));
        console.log(`[ServerStore] 已记录玩家 ${playerId} 位置为未知服务器 ${serverId}`);
      }
    },

    /**
     * 处理玩家下线，根据记录的位置更新对应服务器玩家数
     * 增强版：支持多重查找策略，提高容错性
     */
    handlePlayerRemove: (playerId: string) => {
      console.log(`[ServerStore] 玩家 ${playerId} 下线`);

      const state = get();
      let lastServerId = state.playersLocation[playerId];
      let fallbackServerId: string | null = null;

      // 策略1：直接从 playersLocation 查找
      if (lastServerId) {
        console.log(`[ServerStore] 从位置记录找到玩家 ${playerId} 位于服务器 ${lastServerId}`);
      } else {
        console.warn(`[ServerStore] 玩家 ${playerId} 的位置记录不存在，尝试备用查找策略`);
        
        // 策略2：从 playerIgns 数据中查找服务器位置
        const playerIgnInfo = state.playerIgns[playerId];
        if (playerIgnInfo && playerIgnInfo.serverId) {
          fallbackServerId = playerIgnInfo.serverId;
          console.log(`[ServerStore] 从IGN数据找到玩家 ${playerId} 位于服务器 ${fallbackServerId}`);
        } else {
          // 策略3：遍历所有服务器的IGN列表查找
          for (const [serverId, playerList] of Object.entries(state.serverPlayerIgns)) {
            const foundPlayer = playerList.find(player => player.uuid === playerId);
            if (foundPlayer) {
              fallbackServerId = serverId;
              console.log(`[ServerStore] 从服务器IGN列表找到玩家 ${playerId} 位于服务器 ${fallbackServerId}`);
              break;
            }
          }
        }
        
        // 使用备用查找结果
        if (fallbackServerId) {
          lastServerId = fallbackServerId;
          console.log(`[ServerStore] 使用备用策略确定玩家 ${playerId} 位置: ${lastServerId}`);
          
          // 修复 playersLocation 记录不一致问题
          set(state => ({
            playersLocation: {
              ...state.playersLocation,
              [playerId]: lastServerId!,
            },
          }));
          console.log(`[ServerStore] 已修复玩家 ${playerId} 的位置记录`);
        }
      }

      if (lastServerId) {
        const currentServer = state.servers[lastServerId];

        if (currentServer && currentServer.players > 0) {
          // 从记录的服务器减少玩家数
          set(state => ({
            servers: {
              ...state.servers,
              [lastServerId]: {
                ...currentServer,
                players: Math.max(0, currentServer.players - 1),
                lastUpdate: new Date(),
              },
            },
          }));

          // 删除玩家位置记录
          set(state => {
            const newPlayersLocation = { ...state.playersLocation };
            delete newPlayersLocation[playerId];
            return { playersLocation: newPlayersLocation };
          });

          console.log(`[ServerStore] 玩家 ${playerId} 从服务器 ${lastServerId} 下线，更新玩家数: ${currentServer.players} → ${Math.max(0, currentServer.players - 1)}`);

          // 重新计算聚合统计
          get().recalculateAfterPlayerChange();
        } else if (!currentServer) {
          console.warn(`[ServerStore] 玩家 ${playerId} 所在服务器 ${lastServerId} 不存在，可能已被移除`);
          
          // 清理无效的位置记录
          set(state => {
            const newPlayersLocation = { ...state.playersLocation };
            delete newPlayersLocation[playerId];
            return { playersLocation: newPlayersLocation };
          });
        } else {
          console.warn(`[ServerStore] 服务器 ${lastServerId} 玩家数已为0，无法减少。可能存在状态不一致`);
          
          // 清理位置记录但不修改服务器玩家数
          set(state => {
            const newPlayersLocation = { ...state.playersLocation };
            delete newPlayersLocation[playerId];
            return { playersLocation: newPlayersLocation };
          });
        }
      } else {
        console.warn(`[ServerStore] 玩家 ${playerId} 下线，但无法确定其位置。可能的原因：`);
        console.warn(`[ServerStore] - 玩家从未正确上线记录`);
        console.warn(`[ServerStore] - 位置记录已被清理`);
        console.warn(`[ServerStore] - IGN数据不完整`);
        console.warn(`[ServerStore] 当前状态诊断:`, {
          playersLocationCount: Object.keys(state.playersLocation).length,
          playerIgnsCount: Object.keys(state.playerIgns).length,
          serverPlayerIgnsCount: Object.keys(state.serverPlayerIgns).length,
          hasTargetInIgns: !!state.playerIgns[playerId],
          hasTargetInLocation: !!state.playersLocation[playerId],
        });
        
        // 即使找不到位置，也要尝试清理IGN数据保持一致性
        if (state.playerIgns[playerId]) {
          console.log(`[ServerStore] 清理孤立的IGN数据: ${playerId}`);
        }
      }
    },

    /**
     * 处理玩家在服务器间移动
     * 增强版：添加状态验证和详细日志
     */
    handlePlayerMove: (playerId: string, fromServer: string, toServer: string) => {
      console.log(`[ServerStore] 玩家 ${playerId} 从 ${fromServer} 移动到 ${toServer}`);

      const state = get();
      const fromServerData = state.servers[fromServer];
      const toServerData = state.servers[toServer];
      const currentLocation = state.playersLocation[playerId];

      // 验证当前位置记录的一致性
      if (currentLocation && currentLocation !== fromServer) {
        console.warn(`[ServerStore] 位置记录不一致: 期望 ${fromServer}，实际 ${currentLocation}，使用实际位置`);
        // 使用实际记录的位置作为源服务器
        return get().handlePlayerMove(playerId, currentLocation, toServer);
      }

      if (fromServerData && toServerData) {
        // 更新两个服务器的玩家数和玩家位置记录
        set(state => ({
          playersLocation: {
            ...state.playersLocation,
            [playerId]: toServer,
          },
          servers: {
            ...state.servers,
            [fromServer]: {
              ...fromServerData,
              players: Math.max(0, fromServerData.players - 1),
              lastUpdate: new Date(),
            },
            [toServer]: {
              ...toServerData,
              players: toServerData.players + 1,
              lastUpdate: new Date(),
            },
          },
        }));

        console.log(`[ServerStore] 玩家移动成功:`);
        console.log(`[ServerStore] - ${fromServer}: ${fromServerData.players} → ${Math.max(0, fromServerData.players - 1)} 玩家`);
        console.log(`[ServerStore] - ${toServer}: ${toServerData.players} → ${toServerData.players + 1} 玩家`);

        // 重新计算聚合统计
        get().recalculateAfterPlayerChange();
      } else {
        console.warn(
          `[ServerStore] 玩家移动失败：源服务器 ${fromServer} 或目标服务器 ${toServer} 不存在`
        );
        console.warn(`[ServerStore] 服务器状态:`, {
          fromServerExists: !!fromServerData,
          toServerExists: !!toServerData,
          availableServers: Object.keys(state.servers),
        });
        
        // 至少更新位置记录，即使服务器不存在
        if (toServerData) {
          console.log(`[ServerStore] 目标服务器存在，仅更新位置和目标服务器`);
          set(state => ({
            playersLocation: {
              ...state.playersLocation,
              [playerId]: toServer,
            },
            servers: {
              ...state.servers,
              [toServer]: {
                ...toServerData,
                players: toServerData.players + 1,
                lastUpdate: new Date(),
              },
            },
          }));
        } else if (fromServerData) {
          console.log(`[ServerStore] 源服务器存在，仅减少源服务器玩家数`);
          set(state => ({
            playersLocation: {
              ...state.playersLocation,
              [playerId]: toServer, // 仍然记录新位置
            },
            servers: {
              ...state.servers,
              [fromServer]: {
                ...fromServerData,
                players: Math.max(0, fromServerData.players - 1),
                lastUpdate: new Date(),
              },
            },
          }));
        } else {
          console.log(`[ServerStore] 两个服务器都不存在，仅更新位置记录`);
          set(state => ({
            playersLocation: {
              ...state.playersLocation,
              [playerId]: toServer,
            },
          }));
        }
      }
    },

    /**
     * 添加玩家IGN信息
     */
    addPlayerIgn: (uuid: string, ign: string, serverId: string) => {
      console.log(`[ServerStore] 添加玩家IGN: ${ign} (${uuid}) 在服务器 ${serverId}`);

      const playerIgnInfo: PlayerIgnInfo = {
        uuid,
        ign,
        serverId,
        joinTime: new Date(),
        lastSeen: new Date(),
      };

      set(state => {
        const newPlayerIgns = {
          ...state.playerIgns,
          [uuid]: playerIgnInfo,
        };

        const newServerPlayerIgns = { ...state.serverPlayerIgns };
        if (!newServerPlayerIgns[serverId]) {
          newServerPlayerIgns[serverId] = [];
        }

        // 移除该玩家在其他服务器的记录
        Object.keys(newServerPlayerIgns).forEach(sid => {
          if (sid !== serverId) {
            newServerPlayerIgns[sid] = newServerPlayerIgns[sid].filter(
              player => player.uuid !== uuid
            );
          }
        });

        // 添加或更新玩家在当前服务器的记录
        const existingIndex = newServerPlayerIgns[serverId].findIndex(
          player => player.uuid === uuid
        );

        if (existingIndex >= 0) {
          newServerPlayerIgns[serverId][existingIndex] = playerIgnInfo;
        } else {
          newServerPlayerIgns[serverId].push(playerIgnInfo);
        }

        return {
          playerIgns: newPlayerIgns,
          serverPlayerIgns: newServerPlayerIgns,
        };
      });
    },

    /**
     * 移除玩家IGN信息
     */
    removePlayerIgn: (uuid: string) => {
      console.log(`[ServerStore] 移除玩家IGN: ${uuid}`);

      set(state => {
        const playerIgnInfo = state.playerIgns[uuid];
        const newPlayerIgns = { ...state.playerIgns };
        delete newPlayerIgns[uuid];

        const newServerPlayerIgns = { ...state.serverPlayerIgns };
        if (playerIgnInfo) {
          const serverId = playerIgnInfo.serverId;
          if (newServerPlayerIgns[serverId]) {
            newServerPlayerIgns[serverId] = newServerPlayerIgns[serverId].filter(
              player => player.uuid !== uuid
            );
          }
        }

        return {
          playerIgns: newPlayerIgns,
          serverPlayerIgns: newServerPlayerIgns,
        };
      });
    },

    /**
     * 更新玩家IGN信息
     */
    updatePlayerIgn: (uuid: string, updates: Partial<PlayerIgnInfo>) => {
      console.log(`[ServerStore] 更新玩家IGN: ${uuid}`, updates);

      set(state => {
        const currentPlayerIgn = state.playerIgns[uuid];
        if (!currentPlayerIgn) {
          console.warn(`[ServerStore] 试图更新不存在的玩家IGN: ${uuid}`);
          return state;
        }

        const updatedPlayerIgn = {
          ...currentPlayerIgn,
          ...updates,
          lastSeen: new Date(),
        };

        const newPlayerIgns = {
          ...state.playerIgns,
          [uuid]: updatedPlayerIgn,
        };

        // 如果更新了服务器ID，需要更新serverPlayerIgns
        const newServerPlayerIgns = { ...state.serverPlayerIgns };
        if (updates.serverId && updates.serverId !== currentPlayerIgn.serverId) {
          // 从原服务器移除
          if (newServerPlayerIgns[currentPlayerIgn.serverId]) {
            newServerPlayerIgns[currentPlayerIgn.serverId] = newServerPlayerIgns[
              currentPlayerIgn.serverId
            ].filter(player => player.uuid !== uuid);
          }

          // 添加到新服务器
          if (!newServerPlayerIgns[updates.serverId]) {
            newServerPlayerIgns[updates.serverId] = [];
          }
          newServerPlayerIgns[updates.serverId].push(updatedPlayerIgn);
        } else {
          // 只更新当前服务器的信息
          const serverId = currentPlayerIgn.serverId;
          if (newServerPlayerIgns[serverId]) {
            const index = newServerPlayerIgns[serverId].findIndex(player => player.uuid === uuid);
            if (index >= 0) {
              newServerPlayerIgns[serverId][index] = updatedPlayerIgn;
            }
          }
        }

        return {
          playerIgns: newPlayerIgns,
          serverPlayerIgns: newServerPlayerIgns,
        };
      });
    },

    /**
     * 获取指定服务器的玩家IGN列表
     */
    getServerPlayerIgns: (serverId: string) => {
      const state = get();
      return state.serverPlayerIgns[serverId] || [];
    },

    /**
     * 获取所有玩家IGN信息
     */
    getAllPlayerIgns: () => {
      const state = get();
      return Object.values(state.playerIgns);
    },

    /**
     * 更新运行时间
     */
    updateRunningTime: (runningTime: number, totalRunningTime: number) => {
      set({
        runningTime,
        totalRunningTime,
      });
    },

    /**
     * 启动实时运行时间跟踪（复现原项目的startRealtimeUptimeUpdates）
     */
    startRealtimeUptimeTracking: () => {
      const state = get();

      // 清除现有定时器
      if (uptimeIntervalId) {
        clearInterval(uptimeIntervalId);
      }

      // 初始化基准时间
      const initialRunningTimeSeconds = state.runningTime || 0;
      const initialTotalRunningTimeSeconds = state.totalRunningTime || 0;
      const lastUptimeUpdateTimestamp = Date.now();

      set({
        initialRunningTimeSeconds,
        initialTotalRunningTimeSeconds,
        lastUptimeUpdateTimestamp,
      });

      // 每秒更新运行时间
      uptimeIntervalId = setInterval(() => {
        const currentState = get();

        if (
          currentState.initialRunningTimeSeconds === null ||
          currentState.lastUptimeUpdateTimestamp === null
        ) {
          return;
        }

        // 计算经过的秒数
        const elapsedSeconds = Math.floor(
          (Date.now() - currentState.lastUptimeUpdateTimestamp) / 1000
        );
        const currentRunningTime = currentState.initialRunningTimeSeconds + elapsedSeconds;
        const currentTotalRunningTime =
          (currentState.initialTotalRunningTimeSeconds || 0) + elapsedSeconds;

        set({
          runningTime: currentRunningTime,
          totalRunningTime: currentTotalRunningTime,
        });
      }, 1000);
    },

    /**
     * 停止实时运行时间跟踪
     */
    stopRealtimeUptimeTracking: () => {
      if (uptimeIntervalId) {
        clearInterval(uptimeIntervalId);
        uptimeIntervalId = null;
      }

      set({
        initialRunningTimeSeconds: null,
        initialTotalRunningTimeSeconds: null,
        lastUptimeUpdateTimestamp: null,
      });
    } /**
     * 计算聚合统计（复现原项目的聚合逻辑）
     */,
    calculateAggregateStats: () => {
      const { servers } = get();
      // 排除anticheat_test服务器（内部测试服务器）
      const serverList = Object.entries(servers)
        .filter(([serverId]) => serverId !== 'anticheat_test')
        .map(([, server]) => server);

      console.log('[ServerStore] 计算聚合统计，排除anticheat_test:', {
        totalServers: Object.keys(servers).length,
        filteredServers: serverList.length,
        excludedServers: ['anticheat_test'],
      });

      set({
        aggregateStats: {
          totalPlayers: serverList.reduce((sum, server) => sum + server.players, 0),
          onlineServers: serverList.filter(server => server.status === 'online').length,
          totalUptime: Math.max(...serverList.map(server => server.uptime), 0),
        },
      });
    },

    /**
     * 获取小游戏聚合统计（复现原项目的小游戏聚合逻辑）
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
     * 重置状态
     */
    reset: () => {
      // 停止定时器
      if (uptimeIntervalId) {
        clearInterval(uptimeIntervalId);
        uptimeIntervalId = null;
      }

      set(initialState);
    },
  }))
);

// 导出状态选择器hooks
export const useConnectionStatus = () => useServerStore(state => state.connectionStatus);
export const useServers = () => useServerStore(state => state.servers);
export const useAggregateStats = () => useServerStore(state => state.aggregateStats);
export const useMaintenanceStatus = () =>
  useServerStore(state => ({
    isMaintenance: state.isMaintenance,
    maintenanceStartTime: state.maintenanceStartTime,
    forceShowMaintenance: state.forceShowMaintenance,
  }));
export const useRunningTime = () =>
  useServerStore(state => ({
    runningTime: state.runningTime,
    totalRunningTime: state.totalRunningTime,
  }));

// 玩家IGN相关hooks
export const useServerPlayerIgns = (serverId: string) =>
  useServerStore(state => state.serverPlayerIgns[serverId] || []);
export const usePlayerIgn = (uuid: string) => useServerStore(state => state.playerIgns[uuid]);
export const useAllPlayerIgns = () => useServerStore(state => state.playerIgns);
