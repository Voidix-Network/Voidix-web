import type { WebSocketConfig } from '@/types';

/**
 * WebSocket连接状态枚举
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
 * WebSocket连接管理器
 * 专门负责WebSocket连接的生命周期管理
 * 包括连接、断开、状态跟踪和超时处理
 */
export class ConnectionManager {
  private ws: WebSocket | null = null;
  private connectionTimeout: NodeJS.Timeout | null = null;
  private state: ConnectionState = ConnectionState.DISCONNECTED;
  private config: WebSocketConfig;
  private stateChangeListeners: Array<(data: ConnectionStateChangeData) => void> = [];

  constructor(config: WebSocketConfig) {
    this.config = config;
    this.setupVisibilityChangeListener();
  }

  /**
   * 销毁实例，清理资源
   */
  cleanup(): void {
    console.log('[ConnectionManager] 正在清理资源...');
    this.forceClose();
    this.removeVisibilityChangeListener();
  }

  /**
   * 建立WebSocket连接
   */
  async connect(): Promise<WebSocket> {
    // 检查当前状态，避免重复连接
    if (this.state === ConnectionState.CONNECTED) {
      console.log('[ConnectionManager] 已连接，跳过重复连接');
      return this.ws!;
    }

    if (this.state === ConnectionState.CONNECTING) {
      console.log('[ConnectionManager] 正在连接中，跳过重复连接');
      throw new Error('Connection already in progress');
    }

    return new Promise((resolve, reject) => {
      this.setState(ConnectionState.CONNECTING);

      try {
        console.log('[ConnectionManager] 尝试连接到:', this.config.url);
        this.ws = new WebSocket(this.config.url);

        // 设置连接超时
        this.setConnectionTimeout(reject);

        // 设置事件处理器
        this.setupWebSocketHandlers(resolve, reject);
      } catch (error) {
        console.error('[ConnectionManager] 连接失败:', error);
        this.setState(ConnectionState.FAILED);
        reject(error);
      }
    });
  }

  /**
   * 断开WebSocket连接
   */
  disconnect(): void {
    this.clearConnectionTimeout();

    if (this.ws) {
      const currentState = this.ws.readyState;

      if (currentState === WebSocket.OPEN || currentState === WebSocket.CONNECTING) {
        console.log('[ConnectionManager] 手动断开连接');
        this.ws.close();
      } else {
        console.log('[ConnectionManager] 连接已关闭，跳过断开操作');
      }

      this.ws = null;
    } else {
      console.log('[ConnectionManager] 无连接实例，跳过断开操作');
    }

    this.setState(ConnectionState.DISCONNECTED);
  }

  /**
   * 强制关闭连接（用于清理）
   */
  forceClose(): void {
    this.clearConnectionTimeout();

    if (this.ws) {
      // 临时移除事件处理器避免触发额外事件
      this.ws.onclose = null;
      this.ws.onerror = null;

      this.ws.close();
      this.ws = null;
    }

    // 直接设置状态不触发事件
    this.state = ConnectionState.DISCONNECTED;
    this.stateChangeListeners = []; // 清空监听器
  }

  /**
   * 设置连接超时处理
   */
  private setConnectionTimeout(reject: (error: Error) => void): void {
    this.clearConnectionTimeout();

    this.connectionTimeout = setTimeout(() => {
      if (this.ws?.readyState !== WebSocket.OPEN) {
        console.log('[ConnectionManager] 连接超时，关闭连接');
        this.ws?.close();
        this.setState(ConnectionState.FAILED);
        reject(new Error('Connection timeout'));
      }
    }, this.config.connectionTimeout);
  }

  /**
   * 清除连接超时
   */
  private clearConnectionTimeout(): void {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
  }

  /**
   * 设置WebSocket事件处理器
   */
  private setupWebSocketHandlers(
    resolve: (ws: WebSocket) => void,
    reject: (error: Error) => void
  ): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.clearConnectionTimeout();
      console.log('[ConnectionManager] 连接成功');
      this.setState(ConnectionState.CONNECTED);
      resolve(this.ws!);
    };

    this.ws.onclose = event => {
      this.clearConnectionTimeout();
      console.log('[ConnectionManager] 连接关闭:', event.code, event.reason);
      this.setState(ConnectionState.DISCONNECTED);
    };

    this.ws.onerror = error => {
      this.clearConnectionTimeout();
      console.error('[ConnectionManager] 连接错误:', error);
      this.setState(ConnectionState.FAILED);
      reject(new Error('WebSocket connection error'));
    };
  }

  /**
   * 设置连接状态
   */
  private setState(newState: ConnectionState): void {
    if (this.state !== newState) {
      const previousState = this.state;
      this.state = newState;

      const changeData: ConnectionStateChangeData = {
        previousState,
        currentState: newState,
        timestamp: Date.now(),
      };

      // 通知所有状态变化监听器
      this.stateChangeListeners.forEach(listener => {
        try {
          listener(changeData);
        } catch (error) {
          console.error('[ConnectionManager] 状态变化监听器错误:', error);
        }
      });
    }
  }

  /**
   * 添加状态变化监听器
   */
  onStateChange(listener: (data: ConnectionStateChangeData) => void): void {
    this.stateChangeListeners.push(listener);
  }

  /**
   * 移除状态变化监听器
   */
  offStateChange(listener: (data: ConnectionStateChangeData) => void): void {
    const index = this.stateChangeListeners.indexOf(listener);
    if (index !== -1) {
      this.stateChangeListeners.splice(index, 1);
    }
  }

  /**
   * 获取当前连接状态
   */
  get connectionState(): ConnectionState {
    return this.state;
  }

  /**
   * 获取WebSocket实例
   */
  get webSocket(): WebSocket | null {
    return this.ws;
  }

  /**
   * 获取当前连接的readyState
   */
  get readyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  /**
   * 检查是否已连接
   */
  get isConnected(): boolean {
    return this.state === ConnectionState.CONNECTED && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * 检查是否正在连接
   */
  get isConnecting(): boolean {
    return this.state === ConnectionState.CONNECTING;
  }

  /**
   * 检查是否正在重连
   */
  get isReconnecting(): boolean {
    return this.state === ConnectionState.RECONNECTING;
  }

  /**
   * 设置为重连状态
   */
  setReconnecting(): void {
    this.setState(ConnectionState.RECONNECTING);
  }

  /**
   * 获取连接配置
   */
  get connectionConfig(): WebSocketConfig {
    return { ...this.config };
  }

  /**
   * 更新连接配置
   */
  updateConfig(newConfig: Partial<WebSocketConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 测试专用：模拟状态变化
   * 仅用于单元测试中模拟状态变化事件
   */
  simulateStateChange(newState: ConnectionState): void {
    if (import.meta.env.NODE_ENV === 'test' || import.meta.env.VITEST) {
      this.setState(newState);
    }
  }

  /**
   * 设置页面可见性变化监听器
   */
  private setupVisibilityChangeListener(): void {
    // 确保在浏览器环境中
    if (typeof document === 'undefined') return;

    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  /**
   * 移除页面可见性变化监听器
   */
  private removeVisibilityChangeListener(): void {
    // 确保在浏览器环境中
    if (typeof document === 'undefined') return;

    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }

  /**
   * 处理页面可见性变化
   */
  private handleVisibilityChange = (): void => {
    // 确保在浏览器环境中
    if (typeof document === 'undefined') return;

    if (document.visibilityState === 'hidden') {
      console.log('[ConnectionManager] 页面隐藏，断开WebSocket连接');
      this.disconnect();
    } else if (document.visibilityState === 'visible') {
      console.log('[ConnectionManager] 页面可见，尝试重新连接');
      // 仅在当前未连接时重新连接
      if (!this.isConnected && !this.isConnecting) {
        this.connect().catch(error => {
          console.error('[ConnectionManager] 页面可见时重新连接失败:', error);
        });
      }
    }
  };
}
