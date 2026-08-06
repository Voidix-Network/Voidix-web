import type {
  AggregateStats,
  ConnectionStatus,
  PlayerIgnInfo,
  ServerData,
  ServerInfo,
  ServerPlayerIgns,
} from '@/types';

/**
 * 连接状态相关类型
 */
export interface ConnectionState {
  connectionStatus: ConnectionStatus;
  lastUpdateTime: Date | null;
  isMaintenance: boolean;
  maintenanceStartTime: string | null;
  forceShowMaintenance: boolean;
}

export interface ConnectionActions {
  updateConnectionStatus: (status: ConnectionStatus) => void;
  updateMaintenanceStatus: (
    isMaintenance: boolean,
    startTime?: string | null,
    force?: boolean
  ) => void;
  updateLastUpdateTime: () => void;
}

/**
 * 服务器数据相关类型
 */
export interface ServerDataState {
  servers: Record<string, ServerInfo>;
  aggregateStats: AggregateStats;
}

export interface ServerDataActions {
  updateServer: (serverId: string, serverData: Partial<ServerInfo>) => void;
  updateServerFromData: (serverId: string, data: ServerData) => void;
  updateMultipleServers: (servers: Record<string, ServerData>) => void;
  updateTotalPlayers: (totalPlayers: string) => void;
  calculateAggregateStats: () => void;
  getMinigameAggregateStats: () => {
    onlineCount: number;
    isOnline: boolean;
    allPresent: boolean;
  };
  reset: () => void;
}

/**
 * 玩家位置跟踪相关类型
 */
export interface PlayerTrackingState {
  playersLocation: Record<string, string>; // playerId: serverId
}

export interface PlayerTrackingActions {
  handlePlayerAdd: (playerId: string, serverId: string) => void;
  handlePlayerRemove: (playerId: string) => void;
  handlePlayerMove: (playerId: string, fromServer: string, toServer: string) => void;
  getPlayerLocation: (playerId: string) => string | undefined;
  clearPlayerLocation: (playerId: string) => void;
  clearMultiplePlayerLocations: (playerIds: string[]) => void;
  getPlayersInServer: (serverId: string) => string[];
  getTotalOnlinePlayers: () => number;
  reset: () => void;
}

/**
 * 玩家IGN数据相关类型
 */
export interface PlayerIgnState {
  playerIgns: Record<string, PlayerIgnInfo>; // uuid: PlayerIgnInfo
  serverPlayerIgns: ServerPlayerIgns; // serverId: PlayerIgnInfo[]
}

export interface PlayerIgnActions {
  addPlayerIgn: (uuid: string, ign: string, serverId: string) => void;
  removePlayerIgn: (uuid: string) => void;
  updatePlayerIgn: (uuid: string, updates: Partial<PlayerIgnInfo>) => void;
  getServerPlayerIgns: (serverId: string) => PlayerIgnInfo[];
  getAllPlayerIgns: () => PlayerIgnInfo[];
  reset: () => void;
}

/**
 * 运行时间管理相关类型
 */
export interface UptimeState {
  runningTime: number | null;
  totalRunningTime: number | null;
  initialRunningTimeSeconds: number | null;
  initialTotalRunningTimeSeconds: number | null;
  lastUptimeUpdateTimestamp: number | null;
}

export interface UptimeActions {
  updateRunningTime: (runningTime: number, totalRunningTime: number) => void;
  startRealtimeUptimeTracking: () => void;
  stopRealtimeUptimeTracking: () => void;
  reset: () => void;
}

/**
 * 公告系统相关类型 - 已移除（新协议不支持公告系统）
 */

/**
 * 全量更新数据类型 - 已移除（新协议采用客户端聚合建模）
 */

/**
 * Store 依赖注入类型
 */
export interface StoreContext {
  connectionStore: ConnectionState & ConnectionActions;
  serverDataStore: ServerDataState & ServerDataActions;
  playerTrackingStore: PlayerTrackingState & PlayerTrackingActions;
  playerIgnStore: PlayerIgnState & PlayerIgnActions;
  uptimeStore: UptimeState & UptimeActions;
}
