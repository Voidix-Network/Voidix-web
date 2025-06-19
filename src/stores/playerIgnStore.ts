import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { PlayerIgnState, PlayerIgnActions } from './types';
import type { PlayerIgnInfo } from '@/types';

/**
 * 玩家IGN数据初始状态
 */
const initialPlayerIgnState: PlayerIgnState = {
  playerIgns: {}, // uuid: PlayerIgnInfo
  serverPlayerIgns: {}, // serverId: PlayerIgnInfo[]
};

/**
 * 玩家IGN数据管理Store
 * 负责管理玩家的IGN信息，包括按服务器分组的IGN列表
 * 提供IGN数据的CRUD操作
 */
export const usePlayerIgnStore = create<PlayerIgnState & PlayerIgnActions>()(
  subscribeWithSelector((set, get) => ({
    ...initialPlayerIgnState,

    /**
     * 添加玩家IGN信息
     * @param uuid - 玩家UUID
     * @param ign - 玩家IGN（游戏内昵称）
     * @param serverId - 服务器ID
     */
    addPlayerIgn: (uuid: string, ign: string, serverId: string) => {
      if (import.meta.env.DEV) {
        console.log(`[PlayerIgnStore] 添加玩家IGN: ${ign} (${uuid}) 在服务器 ${serverId}`);
      }

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

        // 初始化服务器IGN列表（如果不存在）
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
     * @param uuid - 玩家UUID
     */
    removePlayerIgn: (uuid: string) => {
      if (import.meta.env.DEV) {
        console.log(`[PlayerIgnStore] 移除玩家IGN: ${uuid}`);
      }

      set(state => {
        const playerIgnInfo = state.playerIgns[uuid];
        const newPlayerIgns = { ...state.playerIgns };
        delete newPlayerIgns[uuid];

        const newServerPlayerIgns = { ...state.serverPlayerIgns };

        // 从对应服务器的IGN列表中移除
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
     * @param uuid - 玩家UUID
     * @param updates - 要更新的数据
     */
    updatePlayerIgn: (uuid: string, updates: Partial<PlayerIgnInfo>) => {
      if (import.meta.env.DEV) {
        console.log(`[PlayerIgnStore] 更新玩家IGN: ${uuid}`, updates);
      }

      set(state => {
        const currentPlayerIgn = state.playerIgns[uuid];
        if (!currentPlayerIgn) {
          if (import.meta.env.DEV) {
            console.warn(`[PlayerIgnStore] 试图更新不存在的玩家IGN: ${uuid}`);
          }
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
     * @param serverId - 服务器ID
     * @returns 玩家IGN信息数组
     */
    getServerPlayerIgns: (serverId: string) => {
      const state = get();
      return state.serverPlayerIgns[serverId] || [];
    },

    /**
     * 获取所有玩家IGN信息
     * @returns 所有玩家IGN信息数组
     */
    getAllPlayerIgns: () => {
      const state = get();
      return Object.values(state.playerIgns);
    },

    /**
     * 重置玩家IGN数据状态
     */
    reset: () => {
      set(initialPlayerIgnState);
    },
  }))
);

/**
 * 便捷的Hook - 获取所有玩家IGN数据
 */
export const useAllPlayerIgns = () => usePlayerIgnStore(state => state.playerIgns);

/**
 * 便捷的Hook - 获取指定服务器的玩家IGN列表
 */
export const useServerPlayerIgns = (serverId: string) =>
  usePlayerIgnStore(state => state.serverPlayerIgns[serverId] || []);

/**
 * 便捷的Hook - 获取特定玩家的IGN信息
 */
export const usePlayerIgn = (uuid: string) => usePlayerIgnStore(state => state.playerIgns[uuid]);

/**
 * 便捷的Hook - 检查玩家是否在指定服务器
 */
export const useIsPlayerInServer = (uuid: string, serverId: string) =>
  usePlayerIgnStore(state => {
    const playerIgn = state.playerIgns[uuid];
    return playerIgn?.serverId === serverId;
  });
