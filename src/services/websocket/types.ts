/**
 * WebSocket模块的内部类型定义
 * 包含各个分离模块使用的接口和类型
 */

/**
 * 事件监听器函数类型
 */
export type EventListener<T = any> = (data: T) => void;

/**
 * 重连进度信息
 */
export interface ReconnectProgress {
  current: number;
  max: number;
  percentage: number;
  nextDelay: number;
  canReconnect: boolean;
}

/**
 * 重连事件数据
 */
export interface ReconnectEventData {
  attempt: number;
  delay: number;
  maxAttempts: number;
}

/**
 * 连接失败事件数据
 */
export interface ConnectionFailedEventData {
  maxAttempts: number;
  totalAttempts: number;
}

/**
 * 断开连接事件数据
 */
export interface DisconnectedEventData {
  code: number;
  reason: string;
}

/**
 * 玩家事件数据基础接口
 */
export interface BasePlayerEventData {
  playerId: string;
  playerInfo?: any;
  player?: any; // 兼容性字段
}

/**
 * 玩家上线事件数据
 */
export interface PlayerAddEventData extends BasePlayerEventData {
  serverId: string;
}

/**
 * 玩家下线事件数据
 */
export interface PlayerRemoveEventData extends BasePlayerEventData {}

/**
 * 玩家移动事件数据
 */
export interface PlayerMoveEventData extends BasePlayerEventData {
  fromServer: string;
  toServer: string;
}

/**
 * 玩家更新事件数据
 */
export interface PlayerUpdateEventData {
  totalOnlinePlayers: string | null;
  type: string;
  player?: any;
}

/**
 * 维护状态更新事件数据
 */
export interface MaintenanceUpdateEventData {
  isMaintenance: boolean;
  maintenanceStartTime: string | null;
  forceShowMaintenance: boolean;
}

/**
 * 服务器更新事件数据
 */
export interface ServerUpdateEventData {
  servers: Record<string, any>;
}

/**
 * 完整更新事件数据
 */
export interface FullUpdateEventData {
  servers: Record<string, any>;
  players: {
    online: string;
    currentPlayers: Record<string, any>;
  };
  runningTime?: string | number;
  totalRunningTime?: string | number;
  isMaintenance: boolean;
  maintenanceStartTime: string | null;
}

/**
 * WebSocket事件类型映射
 */
export interface WebSocketEventMap {
  connected: void;
  disconnected: DisconnectedEventData;
  error: Event;
  reconnecting: ReconnectEventData;
  connectionFailed: ConnectionFailedEventData;
  fullUpdate: FullUpdateEventData;
  maintenanceUpdate: MaintenanceUpdateEventData;
  playerUpdate: PlayerUpdateEventData;
  serverUpdate: ServerUpdateEventData;
  playerAdd: PlayerAddEventData;
  playerRemove: PlayerRemoveEventData;
  playerMove: PlayerMoveEventData;
  noticeReturn: NoticeReturnEventData;
  noticeError: NoticeErrorEventData;
  noticeUpdate: NoticeUpdateEventData;
}

/**
 * 消息解析结果
 */
export interface ParseResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 消息调试信息
 */
export interface MessageDebugInfo {
  type: string;
  hasServers: boolean;
  hasPlayers: boolean;
  hasCurrentPlayers: boolean;
  playerInfo: any;
  serverCount: number;
  timestamp: string;
}

/**
 * 重连策略调试信息
 */
export interface ReconnectDebugInfo {
  currentAttempts: number;
  maxAttempts: number;
  isMaxReached: boolean;
  canReconnect: boolean;
  nextDelay: number;
  config: any;
  progress: ReconnectProgress;
  estimatedTotalTime: number;
}

/**
 * 连接状态枚举
 */
export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  FAILED = 'failed',
}

/**
 * 连接状态变化事件数据
 */
export interface ConnectionStateChangeData {
  previousState: ConnectionState;
  currentState: ConnectionState;
  timestamp: number;
}

/**
 * 维护状态信息
 */
export interface MaintenanceState {
  isMaintenance: boolean;
  maintenanceStartTime: string | null;
  forceShowMaintenance: boolean;
}

/**
 * 维护状态变化事件数据
 */
export interface MaintenanceStateChangeData {
  previousState: MaintenanceState;
  currentState: MaintenanceState;
  timestamp: number;
  source: 'message' | 'force' | 'reset';
}

/**
 * 公告返回事件数据
 */
export interface NoticeReturnEventData {
  notices: Record<string, any>;
  error_msg?: string;
  page?: number;
  counts?: number;
  notice_total_count?: number; // 公告总数，用于精确计算总页数
}

/**
 * 公告错误事件数据
 */
export interface NoticeErrorEventData {
  error: string;
}

/**
 * 公告更新事件数据
 */
export interface NoticeUpdateEventData {
  type: 'notice_update_add_respond' | 'notice_update_remove_respond';
  data: any;
}

/**
 * WebSocket配置类型
 */
export interface WebSocketConfig {
  url: string;
  maxReconnectAttempts: number;
  reconnectIntervals: number[];
  disableReconnect: boolean;
  connectionTimeout: number;
  // 协议版本支持
  SUPPORTED_PROTOCOL_VERSION: number;
}
