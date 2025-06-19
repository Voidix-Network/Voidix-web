import { ConnectionManager, ConnectionState } from '@/services/websocket/ConnectionManager';
import type { ConnectionStateChangeData } from '@/services/websocket/types';
import type { WebSocketConfig } from '@/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  url: string;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    // 模拟异步连接
    setTimeout(() => {
      if (this.readyState === MockWebSocket.CONNECTING) {
        this.readyState = MockWebSocket.OPEN;
        this.onopen?.(new Event('open'));
      }
    }, 10);
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.(new CloseEvent('close', { code: 1000, reason: 'Normal closure' }));
  }

  // 模拟连接错误
  simulateError() {
    this.readyState = MockWebSocket.CLOSED;
    this.onerror?.(new Event('error'));
  }

  // 模拟连接超时
  simulateTimeout() {
    this.readyState = MockWebSocket.CONNECTING;
    // 保持连接状态不变，让超时机制触发
  }
}

// 设置全局 WebSocket mock
global.WebSocket = MockWebSocket as any;

describe('ConnectionManager', () => {
  let connectionManager: ConnectionManager;
  let config: WebSocketConfig;
  let stateChanges: ConnectionStateChangeData[];

  beforeEach(() => {
    config = {
      url: 'ws://localhost:8080',
      connectionTimeout: 100, // 短超时用于测试
      maxReconnectAttempts: 5,
      reconnectIntervals: [1000, 2000, 3000, 5000, 10000],
      disableReconnect: false,
    };

    connectionManager = new ConnectionManager(config);
    stateChanges = [];

    // 监听状态变化
    connectionManager.onStateChange(data => {
      stateChanges.push(data);
    });

    vi.clearAllTimers();
  });

  afterEach(() => {
    connectionManager.forceClose();
    vi.clearAllTimers();
  });

  describe('初始状态', () => {
    it('应该以DISCONNECTED状态开始', () => {
      expect(connectionManager.connectionState).toBe(ConnectionState.DISCONNECTED);
      expect(connectionManager.isConnected).toBe(false);
      expect(connectionManager.isConnecting).toBe(false);
      expect(connectionManager.webSocket).toBeNull();
    });

    it('应该返回正确的配置', () => {
      expect(connectionManager.connectionConfig).toEqual(config);
    });
  });

  describe('连接管理', () => {
    it('应该成功建立连接', async () => {
      const connectPromise = connectionManager.connect();

      expect(connectionManager.connectionState).toBe(ConnectionState.CONNECTING);
      expect(connectionManager.isConnecting).toBe(true);

      const ws = await connectPromise;

      expect(ws).toBeDefined();
      expect(connectionManager.connectionState).toBe(ConnectionState.CONNECTED);
      expect(connectionManager.isConnected).toBe(true);
      expect(connectionManager.webSocket).toBe(ws);
    });

    it('应该避免重复连接', async () => {
      await connectionManager.connect();

      const secondConnect = await connectionManager.connect();
      expect(secondConnect).toBe(connectionManager.webSocket);
    });

    it('应该正确断开连接', async () => {
      await connectionManager.connect();

      connectionManager.disconnect();

      expect(connectionManager.connectionState).toBe(ConnectionState.DISCONNECTED);
      expect(connectionManager.isConnected).toBe(false);
      expect(connectionManager.webSocket).toBeNull();
    });
  });

  describe('状态管理', () => {
    it('应该正确跟踪状态变化', async () => {
      await connectionManager.connect();
      connectionManager.disconnect();

      expect(stateChanges).toHaveLength(3);
      expect(stateChanges[0].currentState).toBe(ConnectionState.CONNECTING);
      expect(stateChanges[1].currentState).toBe(ConnectionState.CONNECTED);
      expect(stateChanges[2].currentState).toBe(ConnectionState.DISCONNECTED);
    });

    it('应该设置重连状态', () => {
      connectionManager.setReconnecting();

      expect(connectionManager.connectionState).toBe(ConnectionState.RECONNECTING);
      expect(connectionManager.isReconnecting).toBe(true);
    });
  });

  describe('配置管理', () => {
    it('应该支持配置更新', () => {
      const newConfig = { url: 'ws://example.com:8081' };

      connectionManager.updateConfig(newConfig);

      expect(connectionManager.connectionConfig.url).toBe('ws://example.com:8081');
      expect(connectionManager.connectionConfig.connectionTimeout).toBe(config.connectionTimeout);
    });
  });

  describe('强制关闭', () => {
    it('应该清理所有资源', async () => {
      await connectionManager.connect();

      const listener = vi.fn();
      connectionManager.onStateChange(listener);

      connectionManager.forceClose();

      expect(connectionManager.connectionState).toBe(ConnectionState.DISCONNECTED);
      expect(connectionManager.webSocket).toBeNull();

      // 状态变化后不应该再触发监听器
      connectionManager.setReconnecting();
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('readyState 属性', () => {
    it('应该返回正确的 readyState', () => {
      expect(connectionManager.readyState).toBe(WebSocket.CLOSED);
    });

    it('连接后应该返回 OPEN 状态', async () => {
      await connectionManager.connect();
      expect(connectionManager.readyState).toBe(WebSocket.OPEN);
    });
  });
});
