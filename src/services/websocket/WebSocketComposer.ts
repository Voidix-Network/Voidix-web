import { WEBSOCKET_CONFIG } from '@/constants';
import type { WebSocketConfig } from '@/types';
import {
  ConnectionManager,
  EventCoordinator,
  MaintenanceHandler,
  MessageRouter,
  ReconnectStrategy,
  WebSocketEventEmitter,
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

    // 设置公告事件桥接
    this.setupNoticeEventBridge();
  }

  /**
   * 设置公告事件桥接
   * 将内部事件转换为DOM事件供组件监听
   */
  private setupNoticeEventBridge(): void {
    // 监听公告返回事件
    this.eventEmitter.on('noticeReturn', data => {
      console.log('[WebSocketComposer] 桥接公告返回事件:', data);
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('noticeReturn', { detail: data });
        window.dispatchEvent(event);
      }
    });

    // 监听公告错误事件
    this.eventEmitter.on('noticeError', data => {
      console.log('[WebSocketComposer] 桥接公告错误事件:', data);
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('noticeError', { detail: data });
        window.dispatchEvent(event);
      }
    });

    // 监听公告更新事件
    this.eventEmitter.on('noticeUpdate', data => {
      console.log('[WebSocketComposer] 桥接公告更新事件:', data);
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('noticeUpdate', { detail: data });
        window.dispatchEvent(event);
      }
    });
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

      // 设置全局WebSocket变量供公告store使用
      if (typeof window !== 'undefined') {
        window.voidixWebSocket = {
          send: (data: string) => this.send(data),
          readyState: this.readyState,
        };
      }

      console.log('[WebSocketComposer] 连接建立成功');
    } catch (error) {
      console.error('[WebSocketComposer] 连接失败:', error);
      throw error;
    }
  }

  /**
   * 发送WebSocket消息
   */
  send(data: string): void {
    try {
      if (this.connectionManager.isConnected && this.connectionManager.webSocket) {
        this.connectionManager.webSocket.send(data);
        console.log('[WebSocketComposer] 发送消息:', data);
      } else {
        console.warn('[WebSocketComposer] WebSocket未连接，无法发送消息');
        throw new Error('WebSocket未连接');
      }
    } catch (error) {
      console.error('[WebSocketComposer] 发送消息失败:', error);
      throw error;
    }
  }

  /**
   * 断开WebSocket连接
   */
  disconnect(): void {
    // 清理全局变量
    if (typeof window !== 'undefined') {
      window.voidixWebSocket = undefined;
    }
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
