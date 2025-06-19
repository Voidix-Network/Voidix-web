import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { PlayerTrackingState, PlayerTrackingActions } from './types';

/**
 * 玩家位置跟踪初始状态
 */
const initialPlayerTrackingState: PlayerTrackingState = {
  playersLocation: {},
};

/**
 * 玩家位置跟踪Store
 * 负责管理玩家在服务器之间的位置跟踪
 * 提供高效的玩家上线、下线、移动等操作的位置管理
 */
export const usePlayerTrackingStore = create<PlayerTrackingState & PlayerTrackingActions>()(
  subscribeWithSelector((set, get) => ({
    ...initialPlayerTrackingState,

    /**
     * 处理玩家上线
     * 记录玩家位置，支持重复记录检查，防止状态不一致
     * @param playerId - 玩家ID
     * @param serverId - 服务器ID
     */
    handlePlayerAdd: (playerId: string, serverId: string) => {
      if (!playerId || !serverId) {
        if (import.meta.env.DEV) {
          console.warn('[PlayerTrackingStore] 无效的玩家ID或服务器ID:', { playerId, serverId });
        }
        return;
      }

      const state = get();
      const existingLocation = state.playersLocation[playerId];

      if (import.meta.env.DEV) {
        console.log(`[PlayerTrackingStore] 玩家 ${playerId} 上线到服务器 ${serverId}`);
      }

      // 检查是否有重复记录或移动情况
      if (existingLocation) {
        if (existingLocation === serverId) {
          if (import.meta.env.DEV) {
            console.warn(
              `[PlayerTrackingStore] 玩家 ${playerId} 重复上线到同一服务器 ${serverId}，跳过处理`
            );
          }
          return;
        } else {
          if (import.meta.env.DEV) {
            console.log(
              `[PlayerTrackingStore] 玩家 ${playerId} 从 ${existingLocation} 移动到 ${serverId}，处理为移动操作`
            );
          }
          // 使用移动处理逻辑
          get().handlePlayerMove(playerId, existingLocation, serverId);
          return;
        }
      }

      // 记录玩家位置
      set(state => ({
        playersLocation: {
          ...state.playersLocation,
          [playerId]: serverId,
        },
      }));

      if (import.meta.env.DEV) {
        console.log(`[PlayerTrackingStore] 玩家 ${playerId} 成功上线到 ${serverId}`);
      }
    },

    /**
     * 处理玩家下线
     * 清理玩家的位置记录
     * @param playerId - 玩家ID
     */
    handlePlayerRemove: (playerId: string) => {
      if (!playerId) {
        if (import.meta.env.DEV) {
          console.warn('[PlayerTrackingStore] 无效的玩家ID:', playerId);
        }
        return;
      }

      const state = get();
      const lastServerId = state.playersLocation[playerId];

      if (import.meta.env.DEV) {
        console.log(`[PlayerTrackingStore] 玩家 ${playerId} 下线`);
      }

      if (lastServerId) {
        // 删除玩家位置记录
        set(state => {
          const newPlayersLocation = { ...state.playersLocation };
          delete newPlayersLocation[playerId];
          return { playersLocation: newPlayersLocation };
        });

        if (import.meta.env.DEV) {
          console.log(`[PlayerTrackingStore] 玩家 ${playerId} 从服务器 ${lastServerId} 下线`);
        }
      } else {
        if (import.meta.env.DEV) {
          console.warn(`[PlayerTrackingStore] 玩家 ${playerId} 下线，但无位置记录`);
        }
      }
    },

    /**
     * 处理玩家在服务器间移动
     * 更新玩家位置记录，支持状态验证和详细日志
     * @param playerId - 玩家ID
     * @param fromServer - 源服务器ID
     * @param toServer - 目标服务器ID
     */
    handlePlayerMove: (playerId: string, fromServer: string, toServer: string) => {
      if (!playerId || !fromServer || !toServer) {
        if (import.meta.env.DEV) {
          console.warn('[PlayerTrackingStore] 无效的移动参数:', { playerId, fromServer, toServer });
        }
        return;
      }

      if (fromServer === toServer) {
        if (import.meta.env.DEV) {
          console.warn(`[PlayerTrackingStore] 玩家 ${playerId} 在同一服务器内移动，跳过`);
        }
        return;
      }

      const state = get();
      const currentLocation = state.playersLocation[playerId];

      if (import.meta.env.DEV) {
        console.log(`[PlayerTrackingStore] 玩家 ${playerId} 从 ${fromServer} 移动到 ${toServer}`);
      }

      // 验证当前位置记录的一致性
      if (currentLocation && currentLocation !== fromServer) {
        if (import.meta.env.DEV) {
          console.warn(
            `[PlayerTrackingStore] 位置记录不一致: 期望 ${fromServer}，实际 ${currentLocation}，使用实际位置`
          );
        }
        // 使用实际记录的位置作为源服务器
        return get().handlePlayerMove(playerId, currentLocation, toServer);
      }

      // 更新玩家位置记录
      set(state => ({
        playersLocation: {
          ...state.playersLocation,
          [playerId]: toServer,
        },
      }));

      if (import.meta.env.DEV) {
        console.log(`[PlayerTrackingStore] 玩家 ${playerId} 移动成功: ${fromServer} → ${toServer}`);
      }
    },

    /**
     * 获取玩家位置
     * @param playerId - 玩家ID
     * @returns 服务器ID或undefined
     */
    getPlayerLocation: (playerId: string) => {
      if (!playerId) return undefined;
      return get().playersLocation[playerId];
    },

    /**
     * 清理指定玩家的位置记录
     * @param playerId - 玩家ID
     */
    clearPlayerLocation: (playerId: string) => {
      if (!playerId) return;

      set(state => {
        const newPlayersLocation = { ...state.playersLocation };
        delete newPlayersLocation[playerId];
        return { playersLocation: newPlayersLocation };
      });
    },

    /**
     * 批量清理玩家位置记录
     * @param playerIds - 玩家ID列表
     */
    clearMultiplePlayerLocations: (playerIds: string[]) => {
      if (!playerIds || playerIds.length === 0) return;

      set(state => {
        const newPlayersLocation = { ...state.playersLocation };
        playerIds.forEach(playerId => {
          delete newPlayersLocation[playerId];
        });
        return { playersLocation: newPlayersLocation };
      });

      if (import.meta.env.DEV) {
        console.log(`[PlayerTrackingStore] 批量清理 ${playerIds.length} 个玩家位置记录`);
      }
    },

    /**
     * 获取在指定服务器的玩家列表
     * @param serverId - 服务器ID
     * @returns 玩家ID列表
     */
    getPlayersInServer: (serverId: string) => {
      if (!serverId) return [];

      const state = get();
      return Object.entries(state.playersLocation)
        .filter(([, location]) => location === serverId)
        .map(([playerId]) => playerId);
    },

    /**
     * 获取在线玩家总数
     * @returns 在线玩家数量
     */
    getTotalOnlinePlayers: () => {
      return Object.keys(get().playersLocation).length;
    },

    /**
     * 重置玩家位置跟踪状态
     */
    reset: () => {
      set(initialPlayerTrackingState);

      if (import.meta.env.DEV) {
        console.log('[PlayerTrackingStore] 状态已重置');
      }
    },
  }))
);

/**
 * 便捷的Hook - 获取所有玩家位置
 */
export const usePlayersLocation = () => usePlayerTrackingStore(state => state.playersLocation);

/**
 * 便捷的Hook - 获取特定玩家位置
 */
export const usePlayerLocation = (playerId: string) =>
  usePlayerTrackingStore(state => state.playersLocation[playerId]);

/**
 * 便捷的Hook - 获取在指定服务器的玩家列表
 */
export const usePlayersInServer = (serverId: string) =>
  usePlayerTrackingStore(state => state.getPlayersInServer(serverId));

/**
 * 便捷的Hook - 获取在线玩家总数
 */
export const useTotalOnlinePlayers = () =>
  usePlayerTrackingStore(state => state.getTotalOnlinePlayers());
