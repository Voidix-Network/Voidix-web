/**
 * Stores入口文件
 * 提供所有store的导出和向后兼容性
 */

// 导出所有子store
export * from './aggregatedStore';
export * from './connectionStore';
export * from './playerIgnStore';
export * from './playerTrackingStore';
export * from './serverDataStore';
export * from './uptimeStore';

// 导出类型定义
export * from './types';

// 便捷的组合hooks，提供与原serverStore相同的接口
import { useAggregatedStore } from './aggregatedStore';
import { useConnectionStore } from './connectionStore';
import { usePlayerIgnStore } from './playerIgnStore';
import { usePlayerTrackingStore } from './playerTrackingStore';
import { useServerDataStore } from './serverDataStore';
import { useUptimeStore } from './uptimeStore';

/**
 * 组合Hook - 提供与原useServerStore相同的接口
 * @deprecated 建议使用具体的子store hooks
 */
export const useServerStoreCompat = () => {
  const connection = useConnectionStore();
  const serverData = useServerDataStore();
  const playerTracking = usePlayerTrackingStore();
  const playerIgn = usePlayerIgnStore();
  const uptime = useUptimeStore();
  const aggregated = useAggregatedStore();

  return {
    // 连接状态
    connectionStatus: connection.connectionStatus,
    lastUpdateTime: connection.lastUpdateTime,
    isMaintenance: connection.isMaintenance,
    maintenanceStartTime: connection.maintenanceStartTime,
    forceShowMaintenance: connection.forceShowMaintenance,

    // 服务器数据
    servers: serverData.servers,
    aggregateStats: serverData.aggregateStats,

    // 玩家位置跟踪
    playersLocation: playerTracking.playersLocation,

    // 玩家IGN数据
    playerIgns: playerIgn.playerIgns,
    serverPlayerIgns: playerIgn.serverPlayerIgns,

    // 运行时间
    runningTime: uptime.runningTime,
    totalRunningTime: uptime.totalRunningTime,
    initialRunningTimeSeconds: uptime.initialRunningTimeSeconds,
    initialTotalRunningTimeSeconds: uptime.initialTotalRunningTimeSeconds,
    lastUptimeUpdateTimestamp: uptime.lastUptimeUpdateTimestamp,

    // 操作方法 - 连接状态
    updateConnectionStatus: connection.updateConnectionStatus,
    updateMaintenanceStatus: connection.updateMaintenanceStatus,

    // 操作方法 - 服务器数据
    updateServer: serverData.updateServer,
    updateServerFromData: serverData.updateServerFromData,
    updateMultipleServers: serverData.updateMultipleServers,
    updateTotalPlayers: serverData.updateTotalPlayers,
    calculateAggregateStats: serverData.calculateAggregateStats,
    getMinigameAggregateStats: serverData.getMinigameAggregateStats,

    // 操作方法 - 玩家跟踪
    handlePlayerAdd: aggregated.handlePlayerAdd,
    handlePlayerRemove: aggregated.handlePlayerRemove,
    handlePlayerMove: aggregated.handlePlayerMove,

    // 操作方法 - IGN管理
    addPlayerIgn: playerIgn.addPlayerIgn,
    removePlayerIgn: playerIgn.removePlayerIgn,
    updatePlayerIgn: playerIgn.updatePlayerIgn,
    getServerPlayerIgns: playerIgn.getServerPlayerIgns,
    getAllPlayerIgns: playerIgn.getAllPlayerIgns,

    // 操作方法 - 运行时间
    updateRunningTime: uptime.updateRunningTime,
    startRealtimeUptimeTracking: uptime.startRealtimeUptimeTracking,
    stopRealtimeUptimeTracking: uptime.stopRealtimeUptimeTracking,

    // 操作方法 - 聚合操作
    handleFullUpdate: aggregated.handleFullUpdate,
    recalculateAfterPlayerChange: aggregated.recalculateAfterPlayerChange,
    reset: aggregated.reset,
  };
};

// 为了测试兼容性，添加getState方法支持
type ServerStoreCompatType = {
  (): ReturnType<typeof useServerStoreCompat>;
  getState(): ReturnType<typeof useServerStoreCompat>;
};

(useServerStoreCompat as any).getState = () => {
  const connection = useConnectionStore.getState();
  const serverData = useServerDataStore.getState();
  const playerTracking = usePlayerTrackingStore.getState();
  const playerIgn = usePlayerIgnStore.getState();
  const uptime = useUptimeStore.getState();
  const aggregated = useAggregatedStore.getState();

  return {
    // 连接状态
    connectionStatus: connection.connectionStatus,
    lastUpdateTime: connection.lastUpdateTime,
    isMaintenance: connection.isMaintenance,
    maintenanceStartTime: connection.maintenanceStartTime,
    forceShowMaintenance: connection.forceShowMaintenance,

    // 服务器数据
    servers: serverData.servers,
    aggregateStats: serverData.aggregateStats,

    // 玩家位置跟踪
    playersLocation: playerTracking.playersLocation,

    // 玩家IGN数据
    playerIgns: playerIgn.playerIgns,
    serverPlayerIgns: playerIgn.serverPlayerIgns,

    // 运行时间
    runningTime: uptime.runningTime,
    totalRunningTime: uptime.totalRunningTime,
    initialRunningTimeSeconds: uptime.initialRunningTimeSeconds,
    initialTotalRunningTimeSeconds: uptime.initialTotalRunningTimeSeconds,
    lastUptimeUpdateTimestamp: uptime.lastUptimeUpdateTimestamp,

    // 操作方法 - 连接状态
    updateConnectionStatus: connection.updateConnectionStatus,
    updateMaintenanceStatus: connection.updateMaintenanceStatus,

    // 操作方法 - 服务器数据
    updateServer: serverData.updateServer,
    updateServerFromData: serverData.updateServerFromData,
    updateMultipleServers: serverData.updateMultipleServers,
    updateTotalPlayers: serverData.updateTotalPlayers,
    calculateAggregateStats: serverData.calculateAggregateStats,
    getMinigameAggregateStats: serverData.getMinigameAggregateStats,

    // 操作方法 - 玩家跟踪
    handlePlayerAdd: aggregated.handlePlayerAdd,
    handlePlayerRemove: aggregated.handlePlayerRemove,
    handlePlayerMove: aggregated.handlePlayerMove,

    // 操作方法 - IGN管理
    addPlayerIgn: playerIgn.addPlayerIgn,
    removePlayerIgn: playerIgn.removePlayerIgn,
    updatePlayerIgn: playerIgn.updatePlayerIgn,
    getServerPlayerIgns: playerIgn.getServerPlayerIgns,
    getAllPlayerIgns: playerIgn.getAllPlayerIgns,

    // 操作方法 - 运行时间
    updateRunningTime: uptime.updateRunningTime,
    startRealtimeUptimeTracking: uptime.startRealtimeUptimeTracking,
    stopRealtimeUptimeTracking: uptime.stopRealtimeUptimeTracking,

    // 操作方法 - 聚合操作
    handleFullUpdate: aggregated.handleFullUpdate,
    recalculateAfterPlayerChange: aggregated.recalculateAfterPlayerChange,
    reset: aggregated.reset,
  };
};

/**
 * 推荐的新式Hooks - 按功能分离
 */

// 连接状态相关
export { useConnectionStatus, useLastUpdateTime, useMaintenanceStatus } from './connectionStore';

// 服务器数据相关
export { useAggregateStats, useMinigameStats, useServer, useServers } from './serverDataStore';

// 玩家位置跟踪相关
export { usePlayerLocation, usePlayersInServer, usePlayersLocation } from './playerTrackingStore';

// 玩家IGN数据相关
export {
  useAllPlayerIgns,
  useIsPlayerInServer,
  usePlayerIgn,
  useServerPlayerIgns,
} from './playerIgnStore';

// 运行时间相关
export { useIsUptimeTracking, useRunningTime } from './uptimeStore';

// 聚合Store相关
export { useAggregatedStoreState } from './aggregatedStore';

/**
 * 主要的serverStore兼容Hook
 * 为了向后兼容，重新导出为useServerStore
 */
export const useServerStore = useServerStoreCompat as ServerStoreCompatType;

/**
 * 清理函数
 * 应用卸载时调用以确保资源清理
 */
export { cleanupUptimeTracking } from './uptimeStore';
