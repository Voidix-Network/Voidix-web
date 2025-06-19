import type { ConnectionStatus } from '@/types';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { ConnectionActions, ConnectionState } from './types';

/**
 * 连接状态初始值
 */
const initialConnectionState: ConnectionState = {
  connectionStatus: 'disconnected',
  lastUpdateTime: null,
  isMaintenance: false,
  maintenanceStartTime: null,
  forceShowMaintenance: false,
};

/**
 * 连接状态管理Store
 * 负责管理WebSocket连接状态、维护模式状态和数据更新时间
 */
export const useConnectionStore = create<ConnectionState & ConnectionActions>()(
  subscribeWithSelector(set => ({
    ...initialConnectionState,

    /**
     * 更新连接状态
     * @param status - 新的连接状态
     */
    updateConnectionStatus: (status: ConnectionStatus) => {
      set({
        connectionStatus: status,
        lastUpdateTime: new Date(),
      });
    },

    /**
     * 更新维护状态
     * @param isMaintenance - 是否处于维护模式
     * @param startTime - 维护开始时间（可选）
     * @param force - 是否强制显示维护状态（可选）
     */
    updateMaintenanceStatus: (
      isMaintenance: boolean,
      startTime: string | null = null,
      force: boolean = false
    ) => {
      set({
        isMaintenance: force ? true : isMaintenance,
        maintenanceStartTime: startTime,
        forceShowMaintenance: force,
        lastUpdateTime: new Date(),
      });
    },

    /**
     * 更新最后数据更新时间
     */
    updateLastUpdateTime: () => {
      set({ lastUpdateTime: new Date() });
    },
  }))
);

/**
 * 便捷的Hook - 获取连接状态
 */
export const useConnectionStatus = () => useConnectionStore(state => state.connectionStatus);

/**
 * 便捷的Hook - 获取维护状态
 */
export const useMaintenanceStatus = () =>
  useConnectionStore(state => ({
    isMaintenance: state.isMaintenance,
    maintenanceStartTime: state.maintenanceStartTime,
    forceShowMaintenance: state.forceShowMaintenance,
  }));

/**
 * 便捷的Hook - 获取最后更新时间
 */
export const useLastUpdateTime = () => useConnectionStore(state => state.lastUpdateTime);
