import type { ConnectionManager } from './ConnectionManager';
import { ConnectionState } from './ConnectionManager';
import type { WebSocketEventEmitter } from './EventEmitter';
import type { MaintenanceHandler } from './MaintenanceHandler';
import type { ReconnectStrategy } from './ReconnectStrategy';

/**
 * 事件协调器
 * 专门负责各个WebSocket模块之间的事件协调和桥接
 * 从WebSocketService中分离出来的事件协调逻辑
 */
export class EventCoordinator {
  private eventEmitter: WebSocketEventEmitter;
  private reconnectStrategy: ReconnectStrategy;
  private isReconnectEnabled: boolean;

  constructor(
    eventEmitter: WebSocketEventEmitter,
    reconnectStrategy: ReconnectStrategy,
    options: { disableReconnect?: boolean } = {}
  ) {
    this.eventEmitter = eventEmitter;
    this.reconnectStrategy = reconnectStrategy;
    this.isReconnectEnabled = !options.disableReconnect;
  }

  /**
   * 设置连接相关事件处理
   */
  setupConnectionEvents(connectionManager: ConnectionManager): void {
    // 监听连接状态变化
    connectionManager.onStateChange(data => {
      console.debug('[EventCoordinator] 连接状态变化:', data.currentState);
      this.resetOnNewConnection(data.currentState);
    });

    // 协议版本不匹配事件
    this.eventEmitter.on('protocolVersionMismatch', data => {
      console.error('[EventCoordinator] 协议版本不匹配，断开连接:', data);

      // 立即断开连接
      connectionManager.disconnect();

      // 可以选择显示用户友好的错误消息
      if (typeof window !== 'undefined') {
        const errorEvent = new CustomEvent('protocolVersionError', {
          detail: {
            message: `协议版本不兼容，请刷新页面或联系管理员`,
            serverVersion: data.serverVersion,
            clientVersion: data.clientVersion,
          },
        });
        window.dispatchEvent(errorEvent);
      }
    });

    console.debug('[EventCoordinator] 连接事件处理器已设置');
  }

  /**
   * 设置MaintenanceHandler的事件桥接
   */
  setupMaintenanceEvents(maintenanceHandler: MaintenanceHandler): void {
    maintenanceHandler.onStateChange(data => {
      console.log('[EventCoordinator] 维护状态变化:', data.currentState);

      this.eventEmitter.emit('maintenanceUpdate', {
        isMaintenance: data.currentState.isMaintenance,
        maintenanceStartTime: data.currentState.maintenanceStartTime,
        forceShowMaintenance: data.currentState.forceShowMaintenance,
      });
    });
  }

  /**
   * 设置重连逻辑的事件处理
   */
  setupReconnectEvents(connectFunction: () => Promise<void>): void {
    // 存储连接函数以供重连使用
    this.connectFunction = connectFunction;
  }

  private connectFunction?: () => Promise<void>;

  /**
   * 处理连接成功
   */
  private handleConnectionSuccess(): void {
    this.reconnectStrategy.reset();
    this.eventEmitter.emit('connected');
  }

  /**
   * 处理连接丢失
   */
  private handleConnectionLost(): void {
    this.eventEmitter.emit('disconnected', { code: 1000, reason: 'Normal closure' });

    if (this.isReconnectEnabled) {
      // 添加小延迟以避免立即重连
      setTimeout(() => this.handleReconnect(), 100);
    }
  }

  /**
   * 处理连接错误
   */
  private handleConnectionError(): void {
    this.eventEmitter.emit('error', new Event('Connection failed'));

    if (this.isReconnectEnabled) {
      this.handleReconnect();
    }
  }

  /**
   * 处理重连逻辑
   */
  private async handleReconnect(): Promise<void> {
    if (!this.isReconnectEnabled || !this.connectFunction) {
      console.log('[EventCoordinator] 重连已禁用或连接函数未设置');
      return;
    }

    if (!this.reconnectStrategy.shouldReconnect()) {
      console.log('[EventCoordinator] 达到最大重连次数，停止重连');
      this.eventEmitter.emit('connectionFailed', {
        maxAttempts: this.reconnectStrategy.getMaxAttempts(),
        totalAttempts: this.reconnectStrategy.getCurrentAttempts(),
      });
      return;
    }

    this.reconnectStrategy.incrementAttempts();
    const nextDelay = this.reconnectStrategy.getNextDelay();
    const currentAttempt = this.reconnectStrategy.getCurrentAttempts();
    const maxAttempts = this.reconnectStrategy.getMaxAttempts();

    console.log(
      `[EventCoordinator] 重连尝试 ${currentAttempt}/${maxAttempts}，${nextDelay / 1000}秒后重试`
    );

    this.eventEmitter.emit('reconnecting', {
      attempt: currentAttempt,
      delay: nextDelay,
      maxAttempts,
    });

    setTimeout(() => {
      if (this.connectFunction) {
        this.connectFunction().catch(error => {
          console.error('[EventCoordinator] 重连失败:', error);
        });
      }
    }, nextDelay);
  }

  /**
   * 禁用重连
   */
  disableReconnect(): void {
    this.isReconnectEnabled = false;
  }

  /**
   * 启用重连
   */
  enableReconnect(): void {
    this.isReconnectEnabled = true;
  }

  /**
   * 获取重连状态
   */
  isReconnectDisabled(): boolean {
    return !this.isReconnectEnabled;
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.connectFunction = undefined;
    this.isReconnectEnabled = false;
  }

  private resetOnNewConnection(status: string): void {
    if (status === ConnectionState.CONNECTED) {
      this.handleConnectionSuccess();
    } else if (status === ConnectionState.DISCONNECTED) {
      this.handleConnectionLost();
    } else if (status === ConnectionState.FAILED) {
      this.handleConnectionError();
    }
  }
}
