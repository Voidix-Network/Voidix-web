import { MULTI_WEBSOCKET_CONFIG } from '@/constants';
import type { WebSocketConfig } from '@/types';
import { ConnectionManager } from './ConnectionManager';
import type { WebSocketEventEmitter } from './EventEmitter';

export interface MultiConnectionConfig {
  minigames: WebSocketConfig;
  survival: WebSocketConfig;
}

export interface ConnectionInfo {
  name: string;
  manager: ConnectionManager;
  isConnected: boolean;
  readyState: number;
}

export class MultiConnectionManager {
  private connections: Map<string, ConnectionManager> = new Map();
  private eventEmitter: WebSocketEventEmitter;
  private config: MultiConnectionConfig;

  constructor(eventEmitter: WebSocketEventEmitter, config?: Partial<MultiConnectionConfig>) {
    this.eventEmitter = eventEmitter;
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

    this.initializeConnections();
  }

  private initializeConnections(): void {
    Object.entries(this.config).forEach(([name, config]) => {
      const manager = new ConnectionManager(config);

      manager.onStateChange(data => {
        console.log(`[MultiConnectionManager] ${name} 连接状态变化:`, data);
        this.eventEmitter.emit('connectionStateChange', {
          connectionName: name,
          ...data,
        });
      });

      this.connections.set(name, manager);
    });
  }

  async connectAll(): Promise<void> {
    const connectionPromises = Array.from(this.connections.entries()).map(
      async ([name, manager]) => {
        try {
          console.log(`[MultiConnectionManager] 尝试连接 ${name}...`);
          const ws = await manager.safeConnect();

          ws.onmessage = event => {
            this.eventEmitter.emit('message', {
              connectionName: name,
              data: event.data,
              source: name,
            });
          };

          console.log(`[MultiConnectionManager] ${name} 连接成功`);
          return { name, success: true };
        } catch (error) {
          console.error(`[MultiConnectionManager] ${name} 连接失败:`, error);
          return { name, success: false, error };
        }
      }
    );

    const results = await Promise.allSettled(connectionPromises);

    results.forEach((result, index) => {
      const connectionName = Array.from(this.connections.keys())[index];
      if (result.status === 'fulfilled') {
        const { success, error } = result.value;
        if (!success) {
          console.error(`[MultiConnectionManager] ${connectionName} 连接失败:`, error);
        }
      } else {
        console.error(`[MultiConnectionManager] ${connectionName} 连接异常:`, result.reason);
      }
    });
  }

  async connect(connectionName: string): Promise<WebSocket> {
    const manager = this.connections.get(connectionName);
    if (!manager) {
      throw new Error(`连接 ${connectionName} 不存在`);
    }

    try {
      const ws = await manager.safeConnect();

      ws.onmessage = event => {
        this.eventEmitter.emit('message', {
          connectionName,
          data: event.data,
          source: connectionName,
        });
      };

      return ws;
    } catch (error) {
      console.error(`[MultiConnectionManager] ${connectionName} 连接失败:`, error);
      throw error;
    }
  }

  disconnect(connectionName?: string): void {
    if (connectionName) {
      const manager = this.connections.get(connectionName);
      if (manager) {
        manager.disconnect();
        console.log(`[MultiConnectionManager] ${connectionName} 连接已断开`);
      }
    } else {
      this.connections.forEach((manager, name) => {
        manager.disconnect();
        console.log(`[MultiConnectionManager] ${name} 连接已断开`);
      });
    }
  }

  forceClose(): void {
    this.connections.forEach((manager, name) => {
      manager.forceClose();
      console.log(`[MultiConnectionManager] ${name} 连接已强制关闭`);
    });
  }

  send(connectionName: string, data: string): void {
    const manager = this.connections.get(connectionName);
    if (!manager) {
      throw new Error(`连接 ${connectionName} 不存在`);
    }

    if (manager.isConnected && manager.webSocket) {
      manager.webSocket.send(data);
      console.log(`[MultiConnectionManager] 向 ${connectionName} 发送消息:`, data);
    } else {
      console.warn(`[MultiConnectionManager] ${connectionName} 未连接，无法发送消息`);
      throw new Error(`${connectionName} 未连接`);
    }
  }

  getConnectionInfo(): Record<string, ConnectionInfo> {
    const info: Record<string, ConnectionInfo> = {};

    this.connections.forEach((manager, name) => {
      info[name] = {
        name,
        manager,
        isConnected: manager.isConnected,
        readyState: manager.readyState,
      };
    });

    return info;
  }

  getConnection(connectionName: string): ConnectionManager | undefined {
    return this.connections.get(connectionName);
  }

  get isAnyConnected(): boolean {
    return Array.from(this.connections.values()).some(manager => manager.isConnected);
  }

  get isAllConnected(): boolean {
    return Array.from(this.connections.values()).every(manager => manager.isConnected);
  }

  get connectedCount(): number {
    return Array.from(this.connections.values()).filter(manager => manager.isConnected).length;
  }

  updateConfig(connectionName: string, newConfig: Partial<WebSocketConfig>): void {
    const manager = this.connections.get(connectionName);
    if (manager) {
      manager.updateConfig(newConfig);
      console.log(`[MultiConnectionManager] ${connectionName} 配置已更新`);
    }
  }

  cleanup(): void {
    this.connections.forEach((manager, name) => {
      manager.cleanup();
      console.log(`[MultiConnectionManager] ${name} 资源清理完成`);
    });
    this.connections.clear();
  }
}
