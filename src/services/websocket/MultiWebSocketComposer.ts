import { MULTI_WEBSOCKET_CONFIG } from '@/constants';
import {
  EventCoordinator,
  MaintenanceHandler,
  ReconnectStrategy,
  WebSocketEventEmitter,
} from './index';
import { MultiConnectionManager, type MultiConnectionConfig } from './MultiConnectionManager';
import { MultiMessageRouter } from './MultiMessageRouter';
import { OmniCoreRequestBuilder } from './OmniCoreRequestBuilder';
import type { WebSocketEventMap } from './types';

export class MultiWebSocketComposer {
  private static instance: MultiWebSocketComposer | null = null;

  private eventEmitter: WebSocketEventEmitter;
  private reconnectStrategy: ReconnectStrategy;
  private multiConnectionManager: MultiConnectionManager;
  private maintenanceHandler: MaintenanceHandler;
  private multiMessageRouter: MultiMessageRouter;
  private eventCoordinator: EventCoordinator;
  private config: MultiConnectionConfig;
  private lastOverallConnectionState: string = 'disconnected';
  private stateCheckTimeout: NodeJS.Timeout | null = null;

  constructor(config?: Partial<MultiConnectionConfig>) {
    this.config = {
      minigames: {
        ...MULTI_WEBSOCKET_CONFIG.minigames,
        reconnectIntervals: [...MULTI_WEBSOCKET_CONFIG.minigames.reconnectIntervals],
        ...config?.minigames,
      },
      survival: {
        ...MULTI_WEBSOCKET_CONFIG.survival,
        reconnectIntervals: [...MULTI_WEBSOCKET_CONFIG.survival.reconnectIntervals],
        ...config?.survival,
      },
    };

    this.eventEmitter = new WebSocketEventEmitter();
    this.reconnectStrategy = new ReconnectStrategy({
      maxReconnectAttempts: this.config.minigames.maxReconnectAttempts,
      reconnectIntervals: [...this.config.minigames.reconnectIntervals],
    });
    this.maintenanceHandler = new MaintenanceHandler();
    this.multiConnectionManager = new MultiConnectionManager(this.eventEmitter, this.config);
    this.multiMessageRouter = new MultiMessageRouter(this.eventEmitter);
    this.eventCoordinator = new EventCoordinator(this.eventEmitter, this.reconnectStrategy, {
      disableReconnect: this.config.minigames.disableReconnect,
    });

    this.setupMessageHandling();
    this.setupNoticeEventBridge();
  }

  static getInstance(config?: Partial<MultiConnectionConfig>): MultiWebSocketComposer {
    if (!MultiWebSocketComposer.instance) {
      console.log('[MultiWebSocketComposer] 创建新的多连接单例实例');
      MultiWebSocketComposer.instance = new MultiWebSocketComposer(config);
    } else {
      console.log('[MultiWebSocketComposer] 返回现有的多连接单例实例');
      if (config) {
        MultiWebSocketComposer.instance.updateConfig(config);
      }
    }
    return MultiWebSocketComposer.instance;
  }

  static destroyInstance(): void {
    if (MultiWebSocketComposer.instance) {
      console.warn(
        '[MultiWebSocketComposer] destroyInstance调用已被禁用，以防止在生产中意外销毁。'
      );
    }
  }

  private updateConfig(newConfig: Partial<MultiConnectionConfig>): void {
    if (newConfig.minigames) {
      this.config.minigames = { ...this.config.minigames, ...newConfig.minigames };
      this.multiConnectionManager.updateConfig('minigames', newConfig.minigames);
    }
    if (newConfig.survival) {
      this.config.survival = { ...this.config.survival, ...newConfig.survival };
      this.multiConnectionManager.updateConfig('survival', newConfig.survival);
    }
  }

  private setupMessageHandling(): void {
    this.eventEmitter.on('message', messageData => {
      this.multiMessageRouter.handleMessage(messageData);
    });

    this.eventEmitter.on('connectionStateChange', data => {
      console.log(`[MultiWebSocketComposer] ${data.connectionName} 连接状态变化:`, data);

      // 防抖检查整体连接状态变化
      this.debouncedCheckConnectionState();

      // 如果连接已建立，发送初始化请求
      if (data.currentState === 'connected') {
        this.initializeConnection(data.connectionName as 'minigames' | 'survival');
      }
    });
  }

  private debouncedCheckConnectionState(): void {
    if (this.stateCheckTimeout) {
      clearTimeout(this.stateCheckTimeout);
    }

    this.stateCheckTimeout = setTimeout(() => {
      this.checkAndEmitOverallConnectionState();
    }, 100); // 100ms 防抖延迟
  }

  private checkAndEmitOverallConnectionState(): void {
    const connectionInfo = this.multiConnectionManager.getConnectionInfo();
    const hasActiveConnection = Object.values(connectionInfo).some(conn => conn.isConnected);
    const hasConnectingConnection = Object.values(connectionInfo).some(
      conn => conn.readyState === WebSocket.CONNECTING
    );

    let currentOverallState: string;

    if (hasActiveConnection) {
      currentOverallState = 'connected';
    } else if (hasConnectingConnection) {
      currentOverallState = 'reconnecting';
    } else {
      currentOverallState = 'disconnected';
    }

    // 只有当整体状态真正发生变化时才发出事件
    if (currentOverallState !== this.lastOverallConnectionState) {
      console.log(
        `[MultiWebSocketComposer] 整体连接状态变化: ${this.lastOverallConnectionState} -> ${currentOverallState}`
      );

      if (currentOverallState === 'connected') {
        this.eventEmitter.emit('connected', {
          connectionName: 'multi',
          timestamp: Date.now(),
        });
      } else if (currentOverallState === 'reconnecting') {
        this.eventEmitter.emit('reconnecting', {
          attempt: 1,
          delay: 1000,
          maxAttempts: 5,
          connectionName: 'multi',
          timestamp: Date.now(),
        });
      } else if (currentOverallState === 'disconnected') {
        this.eventEmitter.emit('disconnected', {
          code: 1000,
          reason: 'All connections closed',
          timestamp: Date.now(),
        });
      }

      this.lastOverallConnectionState = currentOverallState;
    }
  }

  private setupNoticeEventBridge(): void {
    this.eventEmitter.on('noticeReturn', data => {
      console.log('[MultiWebSocketComposer] 桥接公告返回事件:', data);
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('noticeReturn', { detail: data });
        window.dispatchEvent(event);
      }
    });

    this.eventEmitter.on('noticeError', data => {
      console.log('[MultiWebSocketComposer] 桥接公告错误事件:', data);
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('noticeError', { detail: data });
        window.dispatchEvent(event);
      }
    });

    this.eventEmitter.on('noticeUpdate', data => {
      console.log('[MultiWebSocketComposer] 桥接公告更新事件:', data);
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('noticeUpdate', { detail: data });
        window.dispatchEvent(event);
      }
    });
  }

  async connect(): Promise<void> {
    if (typeof window !== 'undefined' && window.PRERENDER_MODE) {
      console.info('[MultiWebSocketComposer] 预渲染模式，跳过WebSocket连接');
      return;
    }

    try {
      // 设置初始状态
      this.lastOverallConnectionState = 'reconnecting';
      this.eventEmitter.emit('reconnecting', {
        attempt: 1,
        delay: 1000,
        maxAttempts: 5,
        connectionName: 'multi',
        timestamp: Date.now(),
      });

      await this.multiConnectionManager.connectAll();

      if (typeof window !== 'undefined') {
        window.voidixWebSocket = {
          send: (data: string) => this.send('minigames', data),
          readyState: this.readyState,
        };
      }

      console.info('[MultiWebSocketComposer] 多连接建立成功');

      // 检查并发出最终状态
      this.debouncedCheckConnectionState();
    } catch (error) {
      console.error('[MultiWebSocketComposer] 连接失败:', error);
      this.eventEmitter.emit('error', error);
      throw error;
    }
  }

  async connectSingle(connectionName: 'minigames' | 'survival'): Promise<void> {
    if (typeof window !== 'undefined' && window.PRERENDER_MODE) {
      console.info('[MultiWebSocketComposer] 预渲染模式，跳过WebSocket连接');
      return;
    }

    try {
      await this.multiConnectionManager.connect(connectionName);
      console.info(`[MultiWebSocketComposer] ${connectionName} 连接建立成功`);

      // 检查并发出整体状态变化
      this.debouncedCheckConnectionState();
    } catch (error) {
      console.error(`[MultiWebSocketComposer] ${connectionName} 连接失败:`, error);
      throw error;
    }
  }

  send(connectionName: 'minigames' | 'survival', data: string): void {
    try {
      this.multiConnectionManager.send(connectionName, data);
    } catch (error) {
      console.error(`[MultiWebSocketComposer] 向 ${connectionName} 发送消息失败:`, error);
      throw error;
    }
  }

  disconnect(connectionName?: 'minigames' | 'survival'): void {
    console.info(`[MultiWebSocketComposer] 断开连接: ${connectionName || '全部'}`);

    if (typeof window !== 'undefined' && !connectionName) {
      window.voidixWebSocket = undefined;
    }

    this.multiConnectionManager.disconnect(connectionName);

    // 检查并发出状态变化
    this.debouncedCheckConnectionState();
  }

  cleanup(): void {
    if (this.stateCheckTimeout) {
      clearTimeout(this.stateCheckTimeout);
      this.stateCheckTimeout = null;
    }

    this.multiConnectionManager.cleanup();
    this.maintenanceHandler.cleanup();
    this.eventCoordinator.cleanup();
    this.eventEmitter.clear();
    console.log('[MultiWebSocketComposer] 资源清理完成');
  }

  forceStop(): void {
    this.multiConnectionManager.forceClose();
    this.maintenanceHandler.cleanup();
    this.reconnectStrategy.reset();
    this.eventCoordinator.cleanup();
    this.eventEmitter.clear();
    console.log('[MultiWebSocketComposer] 强制停止完成');
  }

  on<T = any>(event: string, handler: (data: T) => void): void {
    this.eventEmitter.on(event as keyof WebSocketEventMap, handler);
  }

  off(event: string, handler: Function): void {
    this.eventEmitter.off(event as keyof WebSocketEventMap, handler);
  }

  get readyState(): number {
    const minigamesConnection = this.multiConnectionManager.getConnection('minigames');
    return minigamesConnection?.readyState ?? WebSocket.CLOSED;
  }

  get isConnected(): boolean {
    return this.multiConnectionManager.isAnyConnected;
  }

  get isAllConnected(): boolean {
    return this.multiConnectionManager.isAllConnected;
  }

  get connectedCount(): number {
    return this.multiConnectionManager.connectedCount;
  }

  get currentReconnectAttempts(): number {
    return this.reconnectStrategy.getCurrentAttempts();
  }

  getConnectionInfo() {
    return this.multiConnectionManager.getConnectionInfo();
  }

  isConnectionConnected(connectionName: 'minigames' | 'survival'): boolean {
    const connection = this.multiConnectionManager.getConnection(connectionName);
    return connection?.isConnected ?? false;
  }

  get modules() {
    return {
      eventEmitter: this.eventEmitter,
      multiConnectionManager: this.multiConnectionManager,
      maintenanceHandler: this.maintenanceHandler,
      multiMessageRouter: this.multiMessageRouter,
      eventCoordinator: this.eventCoordinator,
      reconnectStrategy: this.reconnectStrategy,
    };
  }

  /**
   * 初始化连接 - 发送 OmniCore API 请求
   */
  private initializeConnection(connectionName: 'minigames' | 'survival'): void {
    console.log(`[MultiWebSocketComposer] 初始化 ${connectionName} 连接，发送 OmniCore API 请求`);

    // 延迟发送请求，确保 WebSocket 完全就绪
    setTimeout(() => {
      try {
        // 1. 订阅玩家事件（实时推送）
        const subscribeRequest = OmniCoreRequestBuilder.batchSubscribeEvents(
          ['player_join', 'player_quit', 'player_switch_server'],
          {
            rate_limit_ms: 500, // 500ms 频率限制
          }
        );

        console.log(
          `[MultiWebSocketComposer] ${connectionName} 发送订阅请求:`,
          subscribeRequest
        );
        this.send(connectionName, subscribeRequest);

        // 2. 请求初始服务器状态（只请求一次）
        const statusRequest = OmniCoreRequestBuilder.getAllServerStatus({
          use_cache: false,
          include_players: true,
          include_ping: true,
        });

        console.log(
          `[MultiWebSocketComposer] ${connectionName} 发送初始服务器状态请求:`,
          statusRequest
        );
        this.send(connectionName, statusRequest);

        // 3. 请求元信息（运行时间等）
        const metaInfoRequest = OmniCoreRequestBuilder.getMetaInfoAll({
          use_cache: false,
          include_runtime: true,
          include_proxy_stats: true,
        });

        console.log(
          `[MultiWebSocketComposer] ${connectionName} 发送元信息请求:`,
          metaInfoRequest
        );
        this.send(connectionName, metaInfoRequest);

        // 注意：不再设置轮询，依赖事件订阅实时更新
        console.log(`[MultiWebSocketComposer] ${connectionName} 初始化完成，依赖事件订阅实时更新`);
      } catch (error) {
        console.error(
          `[MultiWebSocketComposer] ${connectionName} 初始化请求失败:`,
          error
        );
      }
    }, 100); // 100ms 延迟
  }

}

export const MultiWebSocketService = Object.assign(MultiWebSocketComposer, {
  getInstance: MultiWebSocketComposer.getInstance.bind(MultiWebSocketComposer),
  destroyInstance: MultiWebSocketComposer.destroyInstance.bind(MultiWebSocketComposer),
});
