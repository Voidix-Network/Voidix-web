/**
 * WebSocket模块入口文件
 * 重新导出所有分离的模块和类型定义
 * Phase 3: 完全模块化架构
 */

// 核心模块 (Phase 1)
export { WebSocketEventEmitter } from './EventEmitter';
export { WebSocketMessageParser } from './MessageParser';
export { ReconnectStrategy } from './ReconnectStrategy';

// 高级模块 (Phase 2)
export { ConnectionManager } from './ConnectionManager';
export { MaintenanceHandler } from './MaintenanceHandler';

// 协调模块 (Phase 3)
export { MessageRouter } from './MessageRouter';
export { EventCoordinator } from './EventCoordinator';
export { WebSocketComposer, WebSocketService } from './WebSocketComposer';

// 类型定义
export type {
  EventListener,
  ReconnectProgress,
  ReconnectEventData,
  ConnectionFailedEventData,
  DisconnectedEventData,
  BasePlayerEventData,
  PlayerAddEventData,
  PlayerRemoveEventData,
  PlayerMoveEventData,
  PlayerUpdateEventData,
  MaintenanceUpdateEventData,
  ServerUpdateEventData,
  FullUpdateEventData,
  WebSocketEventMap,
  ParseResult,
  MessageDebugInfo,
  ReconnectDebugInfo,
  ConnectionStateChangeData,
  MaintenanceState,
  MaintenanceStateChangeData,
} from './types';

export { ConnectionState } from './types';
