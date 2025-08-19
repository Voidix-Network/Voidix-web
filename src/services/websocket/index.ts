/**
 * WebSocket模块入口文件
 * 重新导出所有分离的模块和类型定义
 * Phase 3: 完全模块化架构
 */

// 核心模块导出
export { ConnectionManager, ConnectionState } from './ConnectionManager';
export { EventCoordinator } from './EventCoordinator';
export { WebSocketEventEmitter } from './EventEmitter';
export { MaintenanceHandler } from './MaintenanceHandler';
export { WebSocketMessageParser } from './MessageParser';
export { MessageRouter } from './MessageRouter';
export { ReconnectStrategy } from './ReconnectStrategy';

// 单连接WebSocket组合器（原有）
export { WebSocketComposer, WebSocketService } from './WebSocketComposer';

// 多连接WebSocket组合器（新增）
export { MultiConnectionManager, type MultiConnectionConfig } from './MultiConnectionManager';
export { MultiMessageRouter } from './MultiMessageRouter';
export { MultiWebSocketComposer, MultiWebSocketService } from './MultiWebSocketComposer';

// 类型定义导出
export type * from './types';
