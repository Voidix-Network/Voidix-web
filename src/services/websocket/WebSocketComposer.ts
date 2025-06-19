import type { WebSocketConfig } from '@/types';
import { WEBSOCKET_CONFIG } from '@/constants';
import {
  WebSocketEventEmitter,
  ReconnectStrategy,
  ConnectionManager,
  MaintenanceHandler,
  MessageRouter,
  EventCoordinator,
} from './index';
import type { WebSocketEventMap } from './types';

/**
 * WebSocket组合器
 * 轻量级的组合工具，组装各个模块并提供统一的API
 * 替代原来的重量级WebSocketService，现在只有组装和协调职责
 */
export class WebSocketComposer {
  private eventEmitter: WebSocketEventEmitter;
  private reconnectStrategy: ReconnectStrategy;
  private connectionManager: ConnectionManager;
  private maintenanceHandler: MaintenanceHandler;
  private messageRouter: MessageRouter;
  private eventCoordinator: EventCoordinator;
  private config: WebSocketConfig;

  constructor(config?: Partial<WebSocketConfig>) {
    this.config = { ...WEBSOCKET_CONFIG, ...config };

    // 初始化所有模块
    this.eventEmitter = new WebSocketEventEmitter();
    this.reconnectStrategy = new ReconnectStrategy({
      maxReconnectAttempts: this.config.maxReconnectAttempts,
      reconnectIntervals: this.config.reconnectIntervals,
    });
    this.connectionManager = new ConnectionManager(this.config);
    this.maintenanceHandler = new MaintenanceHandler();
    this.messageRouter = new MessageRouter(this.eventEmitter, this.maintenanceHandler);
    this.eventCoordinator = new EventCoordinator(this.eventEmitter, this.reconnectStrategy, {
      disableReconnect: this.config.disableReconnect,
    });

    // 设置模块间的协调
    this.setupModuleCoordination();
  }

  /**
   * 设置模块协调
   */
  private setupModuleCoordination(): void {
    // 设置连接事件协调
    this.eventCoordinator.setupConnectionEvents(this.connectionManager);

    // 设置维护事件协调
    this.eventCoordinator.setupMaintenanceEvents(this.maintenanceHandler);

    // 设置重连事件协调
    this.eventCoordinator.setupReconnectEvents(() => this.connect());
  }

  /**
   * 建立WebSocket连接
   */
  async connect(): Promise<void> {
    try {
      const ws = await this.connectionManager.connect();

      // 设置消息处理器 - 委托给MessageRouter
      ws.onmessage = event => {
        this.messageRouter.handleMessage(event);
      };

      console.log('[WebSocketComposer] 连接建立成功');
    } catch (error) {
      console.error('[WebSocketComposer] 连接失败:', error);
      throw error;
    }
  }

  /**
   * 断开WebSocket连接
   */
  disconnect(): void {
    this.connectionManager.disconnect();
  }

  /**
   * 强制停止所有活动（用于测试清理）
   */
  forceStop(): void {
    this.connectionManager.forceClose();
    this.maintenanceHandler.cleanup();
    this.reconnectStrategy.reset();
    this.eventCoordinator.cleanup();
    this.eventEmitter.clear();
    console.log('[WebSocketComposer] 强制停止完成');
  }

  /**
   * 事件监听器管理
   */
  on<T = any>(event: string, handler: (data: T) => void): void {
    this.eventEmitter.on(event as keyof WebSocketEventMap, handler);
  }

  off(event: string, handler: Function): void {
    this.eventEmitter.off(event as keyof WebSocketEventMap, handler);
  }

  /**
   * 获取状态信息
   */
  get readyState(): number {
    return this.connectionManager.readyState;
  }

  get isConnected(): boolean {
    return this.connectionManager.isConnected;
  }

  get currentReconnectAttempts(): number {
    return this.reconnectStrategy.getCurrentAttempts();
  }

  /**
   * 模块访问器（供高级用户使用）
   */
  get modules() {
    return {
      eventEmitter: this.eventEmitter,
      connectionManager: this.connectionManager,
      maintenanceHandler: this.maintenanceHandler,
      messageRouter: this.messageRouter,
      eventCoordinator: this.eventCoordinator,
      reconnectStrategy: this.reconnectStrategy,
    };
  }
}

// 向后兼容性别名
export const WebSocketService = WebSocketComposer;
