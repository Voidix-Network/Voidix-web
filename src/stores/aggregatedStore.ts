import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { useConnectionStore } from './connectionStore';
import { useNoticeStore } from './noticeStore';
import { usePlayerIgnStore } from './playerIgnStore';
import { usePlayerTrackingStore } from './playerTrackingStore';
import { useServerDataStore } from './serverDataStore';
import type { FullUpdateData } from './types';
import { useUptimeStore } from './uptimeStore';

/**
 * 聚合Store的状态和操作接口
 */
interface AggregatedStoreState {
  // 这里主要存储跨store的协调状态
  isInitialized: boolean;
}

interface AggregatedStoreActions {
  // 完整状态更新（原serverStore的handleFullUpdate）
  handleFullUpdate: (data: FullUpdateData) => void;

  // 处理当前玩家数据
  handleCurrentPlayersData: (currentPlayers: Record<string, any>) => void;

  // 玩家变化后的重新计算
  recalculateAfterPlayerChange: () => void;

  // 综合的玩家处理逻辑（结合位置跟踪和服务器数据更新）
  handlePlayerAdd: (playerId: string, serverId: string) => void;
  handlePlayerRemove: (playerId: string) => void;
  handlePlayerMove: (playerId: string, fromServer: string, toServer: string) => void;

  // 连接状态控制运行时间跟踪
  handleConnectionStatusChange: (status: string) => void;

  // 初始化和重置
  initialize: () => void;
  reset: () => void;
}

/**
 * 聚合Store
 * 作为各个子store的协调层，处理跨store的业务逻辑
 * 为了保持向后兼容性，提供与原serverStore相同的接口
 */
export const useAggregatedStore = create<AggregatedStoreState & AggregatedStoreActions>()(
  subscribeWithSelector((set, get) => ({
    isInitialized: false,

    /**
     * 处理完整状态更新
     * 协调所有子store的数据更新
     * @param data - 完整更新数据
     */
    handleFullUpdate: (data: FullUpdateData) => {
      const serverDataStore = useServerDataStore.getState();
      const uptimeStore = useUptimeStore.getState();
      const connectionStore = useConnectionStore.getState();

      if (import.meta.env.DEV) {
        console.log('[AggregatedStore] 处理完整状态更新', data);
      }

      // 批量更新服务器数据
      if (data.servers && Object.keys(data.servers).length > 0) {
        serverDataStore.updateMultipleServers(data.servers);
      }

      // 更新运行时间
      if (data.runningTime !== undefined || data.totalRunningTime !== undefined) {
        const runningTime =
          typeof data.runningTime === 'string' ? parseInt(data.runningTime) : data.runningTime;
        const totalRunningTime =
          typeof data.totalRunningTime === 'string'
            ? parseInt(data.totalRunningTime)
            : data.totalRunningTime;

        if (runningTime !== undefined && totalRunningTime !== undefined) {
          uptimeStore.updateRunningTime(runningTime, totalRunningTime);
        }
      }

      // 更新维护状态
      connectionStore.updateMaintenanceStatus(
        data.isMaintenance,
        data.maintenanceStartTime,
        connectionStore.forceShowMaintenance
      );

      // 更新全局数据更新时间
      connectionStore.updateLastUpdateTime();

      // 只有在连接正常且不在维护模式时才启动实时运行时间跟踪
      const isConnected = connectionStore.connectionStatus === 'connected';
      const shouldTrackTime =
        isConnected && !data.isMaintenance && !connectionStore.forceShowMaintenance;

      if (shouldTrackTime) {
        uptimeStore.startRealtimeUptimeTracking();
      } else {
        uptimeStore.stopRealtimeUptimeTracking();
      }

      // 如果fullUpdate包含玩家详情数据，处理它们（唯一处理入口）
      if (data.players?.currentPlayers && Object.keys(data.players.currentPlayers).length > 0) {
        if (import.meta.env.DEV) {
          console.log('[AggregatedStore] fullUpdate包含玩家详情数据，开始统一处理IGN和位置信息');
        }
        get().handleCurrentPlayersData(data.players.currentPlayers);
      }
    },

    /**
     * 处理当前玩家数据（从fullUpdate消息中）
     * 注意：在fullUpdate中，只处理IGN和位置信息，不修改服务器玩家数
     * 因为服务器玩家数已经通过updateMultipleServers从WebSocket数据中正确设置
     * @param currentPlayers - 当前玩家数据
     */
    handleCurrentPlayersData: (currentPlayers: Record<string, any>) => {
      const playerIgnStore = usePlayerIgnStore.getState();
      const playerTrackingStore = usePlayerTrackingStore.getState();

      Object.entries(currentPlayers).forEach(([playerId, playerData]) => {
        if (playerData && typeof playerData === 'object') {
          const uuid = playerData.uuid || playerId;
          const ign = playerData.ign || playerData.username || playerData.name || playerId;
          const serverId = playerData.server || playerData.currentServer || 'unknown';

          // 添加玩家IGN信息
          playerIgnStore.addPlayerIgn(uuid, ign, serverId);

          // 只更新玩家位置跟踪，不修改服务器玩家数（避免重复计算）
          playerTrackingStore.handlePlayerAdd(uuid, serverId);
        }
      });
    },

    /**
     * 玩家状态变化后的重新计算
     */
    recalculateAfterPlayerChange: () => {
      const serverDataStore = useServerDataStore.getState();
      if (import.meta.env.DEV) {
        console.log('[AggregatedStore] 玩家状态变化，重新计算聚合统计');
      }
      serverDataStore.calculateAggregateStats();
    },

    /**
     * 处理玩家上线
     * 协调位置跟踪和服务器数据更新
     * @param playerId - 玩家ID
     * @param serverId - 服务器ID
     */
    handlePlayerAdd: (playerId: string, serverId: string) => {
      const playerTrackingStore = usePlayerTrackingStore.getState();
      const serverDataStore = useServerDataStore.getState();

      // 更新玩家位置跟踪
      playerTrackingStore.handlePlayerAdd(playerId, serverId);

      // 获取当前服务器信息并更新玩家数
      const servers = serverDataStore.servers;
      const currentServer = servers[serverId];

      if (currentServer) {
        serverDataStore.updateServer(serverId, {
          players: currentServer.players + 1,
          lastUpdate: new Date(),
        });

        if (import.meta.env.DEV) {
          console.log(
            `[AggregatedStore] 玩家 ${playerId} 成功上线到 ${serverId}，玩家数: ${currentServer.players} → ${currentServer.players + 1}`
          );
        }

        // 重新计算聚合统计
        get().recalculateAfterPlayerChange();
      } else {
        if (import.meta.env.DEV) {
          console.warn(`[AggregatedStore] 尝试添加玩家到未知服务器: ${serverId}`);
        }
      }
    },

    /**
     * 处理玩家下线
     * 协调位置跟踪、IGN清理和服务器数据更新
     * @param playerId - 玩家ID
     */
    handlePlayerRemove: (playerId: string) => {
      const playerTrackingStore = usePlayerTrackingStore.getState();
      const playerIgnStore = usePlayerIgnStore.getState();
      const serverDataStore = useServerDataStore.getState();

      // 获取玩家位置
      const lastServerId = playerTrackingStore.getPlayerLocation(playerId);

      // 尝试从IGN数据中获取位置作为备选
      let fallbackServerId: string | null = null;
      if (!lastServerId) {
        const playerIgnInfo = playerIgnStore.playerIgns[playerId];
        if (playerIgnInfo?.serverId) {
          fallbackServerId = playerIgnInfo.serverId;
        }
      }

      const finalServerId = lastServerId || fallbackServerId;

      if (finalServerId) {
        const servers = serverDataStore.servers;
        const currentServer = servers[finalServerId];

        if (currentServer && currentServer.players > 0) {
          // 更新服务器玩家数
          serverDataStore.updateServer(finalServerId, {
            players: Math.max(0, currentServer.players - 1),
            lastUpdate: new Date(),
          });

          if (import.meta.env.DEV) {
            console.log(
              `[AggregatedStore] 玩家 ${playerId} 从服务器 ${finalServerId} 下线，更新玩家数: ${currentServer.players} → ${Math.max(0, currentServer.players - 1)}`
            );
          }

          // 重新计算聚合统计
          get().recalculateAfterPlayerChange();
        }
      }

      // 清理玩家相关数据
      playerTrackingStore.handlePlayerRemove(playerId);
      playerIgnStore.removePlayerIgn(playerId);
    },

    /**
     * 处理玩家移动
     * 协调位置跟踪和服务器数据更新
     * @param playerId - 玩家ID
     * @param fromServer - 源服务器ID
     * @param toServer - 目标服务器ID
     */
    handlePlayerMove: (playerId: string, fromServer: string, toServer: string) => {
      const playerTrackingStore = usePlayerTrackingStore.getState();
      const serverDataStore = useServerDataStore.getState();

      // 更新玩家位置跟踪
      playerTrackingStore.handlePlayerMove(playerId, fromServer, toServer);

      // 获取服务器信息
      const servers = serverDataStore.servers;
      const fromServerData = servers[fromServer];
      const toServerData = servers[toServer];

      if (fromServerData && toServerData) {
        // 更新两个服务器的玩家数
        serverDataStore.updateServer(fromServer, {
          players: Math.max(0, fromServerData.players - 1),
          lastUpdate: new Date(),
        });

        serverDataStore.updateServer(toServer, {
          players: toServerData.players + 1,
          lastUpdate: new Date(),
        });

        if (import.meta.env.DEV) {
          console.log(`[AggregatedStore] 玩家移动成功:`);
          console.log(
            `[AggregatedStore] - ${fromServer}: ${fromServerData.players} → ${Math.max(0, fromServerData.players - 1)} 玩家`
          );
          console.log(
            `[AggregatedStore] - ${toServer}: ${toServerData.players} → ${toServerData.players + 1} 玩家`
          );
        }

        // 重新计算聚合统计
        get().recalculateAfterPlayerChange();
      }
    },

    /**
     * 处理连接状态变化，控制运行时间跟踪
     * @param status - 新的连接状态
     */
    handleConnectionStatusChange: (status: string) => {
      const uptimeStore = useUptimeStore.getState();
      const connectionStore = useConnectionStore.getState();

      if (import.meta.env.DEV) {
        console.log('[AggregatedStore] 连接状态变化:', status);
      }

      // 当连接断开时，停止运行时间跟踪
      if (status !== 'connected') {
        uptimeStore.stopRealtimeUptimeTracking();
        if (import.meta.env.DEV) {
          console.log('[AggregatedStore] 连接断开，停止运行时间跟踪');
        }
      } else {
        // 连接恢复时，如果不在维护模式，重新启动运行时间跟踪
        if (!connectionStore.isMaintenance && !connectionStore.forceShowMaintenance) {
          uptimeStore.startRealtimeUptimeTracking();
          if (import.meta.env.DEV) {
            console.log('[AggregatedStore] 连接恢复，重新启动运行时间跟踪');
          }
        }
      }
    },

    /**
     * 初始化聚合Store
     * 设置各种监听器和状态同步
     */
    initialize: () => {
      if (get().isInitialized) {
        return;
      }

      if (import.meta.env.DEV) {
        console.log('[AggregatedStore] 初始化聚合Store');
      }

      // 监听连接状态变化，控制运行时间跟踪
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      void useConnectionStore.subscribe(
        state => state.connectionStatus,
        connectionStatus => {
          get().handleConnectionStatusChange(connectionStatus);
        }
      );

      // 存储取消订阅函数（如果需要清理的话）
      // 在实际应用中，这个订阅通常会持续整个应用生命周期

      set({ isInitialized: true });
    },

    /**
     * 重置聚合Store
     * 清理所有状态和监听器
     */
    reset: () => {
      const serverDataStore = useServerDataStore.getState();
      const uptimeStore = useUptimeStore.getState();
      const connectionStore = useConnectionStore.getState();
      const noticeStore = useNoticeStore.getState();
      const playerIgnStore = usePlayerIgnStore.getState();
      const playerTrackingStore = usePlayerTrackingStore.getState();

      // 停止运行时间跟踪
      uptimeStore.stopRealtimeUptimeTracking();

      // 重置各个子store
      serverDataStore.reset();
      uptimeStore.reset();
      noticeStore.reset();
      playerIgnStore.reset();
      playerTrackingStore.reset();

      // 重置连接状态
      connectionStore.updateConnectionStatus('disconnected');

      set({ isInitialized: false });
    },
  }))
);

/**
 * 便捷的Hook - 获取聚合Store状态
 */
export const useAggregatedStoreState = () =>
  useAggregatedStore(state => ({
    isInitialized: state.isInitialized,
  }));
