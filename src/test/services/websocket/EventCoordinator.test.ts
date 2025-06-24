/**
 * EventCoordinator模块测试
 * 测试WebSocket模块间事件协调逻辑
 */

import { ConnectionManager } from '@/services/websocket/ConnectionManager';
import { EventCoordinator } from '@/services/websocket/EventCoordinator';
import { WebSocketEventEmitter } from '@/services/websocket/EventEmitter';
import { MaintenanceHandler } from '@/services/websocket/MaintenanceHandler';
import { ReconnectStrategy } from '@/services/websocket/ReconnectStrategy';
import { ConnectionState } from '@/services/websocket/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('EventCoordinator', () => {
  let eventCoordinator: EventCoordinator;
  let eventEmitter: WebSocketEventEmitter;
  let reconnectStrategy: ReconnectStrategy;
  let connectionManager: ConnectionManager;
  let maintenanceHandler: MaintenanceHandler;

  beforeEach(() => {
    eventEmitter = new WebSocketEventEmitter();
    reconnectStrategy = new ReconnectStrategy({
      maxReconnectAttempts: 3,
      reconnectIntervals: [1000, 2000, 3000],
    });
    connectionManager = new ConnectionManager({
      url: 'ws://localhost:8080',
      connectionTimeout: 5000,
      disableReconnect: false,
      maxReconnectAttempts: 3,
      reconnectIntervals: [1000, 2000, 3000],
      SUPPORTED_PROTOCOL_VERSION: 1,
    });
    maintenanceHandler = new MaintenanceHandler();
    eventCoordinator = new EventCoordinator(eventEmitter, reconnectStrategy);

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('连接事件协调', () => {
    it('应该正确处理连接成功事件', () => {
      const mockEmit = vi.spyOn(eventEmitter, 'emit');
      const mockReset = vi.spyOn(reconnectStrategy, 'reset');

      eventCoordinator.setupConnectionEvents(connectionManager);

      // 模拟连接状态变化
      connectionManager.simulateStateChange(ConnectionState.CONNECTED);

      expect(mockReset).toHaveBeenCalled();
      expect(mockEmit).toHaveBeenCalledWith('connected');
    });

    it('应该正确处理连接断开事件', () => {
      const mockEmit = vi.spyOn(eventEmitter, 'emit');
      const mockConnect = vi.fn().mockResolvedValue(undefined);

      eventCoordinator.setupConnectionEvents(connectionManager);
      eventCoordinator.setupReconnectEvents(mockConnect);

      // 直接调用私有方法模拟断开事件
      const stateChangeData = {
        previousState: ConnectionState.CONNECTED,
        currentState: ConnectionState.DISCONNECTED,
        timestamp: Date.now(),
      };

      // 获取已注册的监听器并手动触发
      const listeners = (connectionManager as any).stateChangeListeners;
      if (listeners && listeners.length > 0) {
        listeners[0](stateChangeData);
      }

      expect(mockEmit).toHaveBeenCalledWith('disconnected', {
        code: 1000,
        reason: 'Normal closure',
      });

      // 验证重连逻辑启动（延迟100ms）
      vi.advanceTimersByTime(200);
      expect(reconnectStrategy.getCurrentAttempts()).toBeGreaterThanOrEqual(1);
    });

    it('应该正确处理连接失败事件', () => {
      const mockEmit = vi.spyOn(eventEmitter, 'emit');
      const mockConnect = vi.fn().mockResolvedValue(undefined);

      eventCoordinator.setupConnectionEvents(connectionManager);
      eventCoordinator.setupReconnectEvents(mockConnect);

      // 模拟连接状态变化
      connectionManager.simulateStateChange(ConnectionState.FAILED);

      expect(mockEmit).toHaveBeenCalledWith('error', expect.any(Event));

      // 验证重连逻辑启动
      expect(reconnectStrategy.getCurrentAttempts()).toBeGreaterThanOrEqual(1);
    });
  });

  describe('维护事件协调', () => {
    it('应该正确协调维护状态变化事件', () => {
      const mockEmit = vi.spyOn(eventEmitter, 'emit');

      eventCoordinator.setupMaintenanceEvents(maintenanceHandler);

      // 模拟维护状态变化
      maintenanceHandler.handleMaintenanceMessage({
        status: true,
        maintenanceStartTime: '2025-06-14T00:00:00Z',
      });

      expect(mockEmit).toHaveBeenCalledWith('maintenanceUpdate', {
        isMaintenance: true,
        maintenanceStartTime: '2025-06-14T00:00:00Z',
        forceShowMaintenance: true,
      });
    });
  });

  describe('重连逻辑协调', () => {
    it('应该正确处理重连逻辑', () => {
      const mockConnect = vi.fn().mockResolvedValue(undefined);
      const mockEmit = vi.spyOn(eventEmitter, 'emit');

      eventCoordinator.setupReconnectEvents(mockConnect);
      eventCoordinator.setupConnectionEvents(connectionManager);

      // 模拟连接失败触发重连
      const stateChangeData = {
        previousState: ConnectionState.CONNECTED,
        currentState: ConnectionState.FAILED,
        timestamp: Date.now(),
      };

      const listeners = (connectionManager as any).stateChangeListeners;
      if (listeners && listeners.length > 0) {
        listeners[0](stateChangeData);
      }

      // error事件应该先触发
      expect(mockEmit).toHaveBeenCalledWith('error', expect.any(Event));

      // 等待重连逻辑
      vi.advanceTimersByTime(2000);

      // 验证重连事件
      expect(mockEmit).toHaveBeenCalledWith('reconnecting', {
        attempt: 1,
        delay: expect.any(Number),
        maxAttempts: 3,
      });

      // 验证重连函数被调用
      expect(mockConnect).toHaveBeenCalled();
    });

    it('应该在达到最大重连次数时停止重连', () => {
      const mockConnect = vi.fn().mockResolvedValue(undefined);
      const mockEmit = vi.spyOn(eventEmitter, 'emit');

      // 预先设置重连次数到接近上限
      for (let i = 0; i < 3; i++) {
        reconnectStrategy.incrementAttempts();
      }

      eventCoordinator.setupReconnectEvents(mockConnect);
      eventCoordinator.setupConnectionEvents(connectionManager);

      // 模拟最后一次重连失败
      const stateChangeData = {
        previousState: ConnectionState.CONNECTING,
        currentState: ConnectionState.FAILED,
        timestamp: Date.now(),
      };

      const listeners = (connectionManager as any).stateChangeListeners;
      if (listeners && listeners.length > 0) {
        listeners[0](stateChangeData);
      }

      // 等待重连逻辑处理
      vi.advanceTimersByTime(1000);

      // 验证最终的connectionFailed事件
      expect(mockEmit).toHaveBeenCalledWith('connectionFailed', {
        maxAttempts: 3,
        totalAttempts: 3,
      });
    });

    it('应该在禁用重连时不进行重连', () => {
      const eventCoordinatorDisabled = new EventCoordinator(eventEmitter, reconnectStrategy, {
        disableReconnect: true,
      });

      const mockConnect = vi.fn().mockResolvedValue(undefined);
      const consoleLogSpy = vi.spyOn(console, 'log');
      const mockEmit = vi.spyOn(eventEmitter, 'emit');

      eventCoordinatorDisabled.setupReconnectEvents(mockConnect);
      eventCoordinatorDisabled.setupConnectionEvents(connectionManager);

      // 模拟连接失败以触发重连逻辑
      connectionManager.simulateStateChange(ConnectionState.FAILED);

      // 验证状态变化被记录
      expect(consoleLogSpy).toHaveBeenCalledWith('[EventCoordinator] 连接状态变化:', 'failed');

      // 验证error事件被触发
      expect(mockEmit).toHaveBeenCalledWith('error', expect.any(Event));

      // 验证重连函数未被调用（因为重连被禁用）
      expect(mockConnect).not.toHaveBeenCalled();

      // 验证没有重连相关的事件被触发
      expect(mockEmit).not.toHaveBeenCalledWith('reconnecting', expect.any(Object));
    });
  });

  describe('重连控制', () => {
    it('应该能够动态禁用和启用重连', () => {
      expect(eventCoordinator.isReconnectDisabled()).toBe(false);

      eventCoordinator.disableReconnect();
      expect(eventCoordinator.isReconnectDisabled()).toBe(true);

      eventCoordinator.enableReconnect();
      expect(eventCoordinator.isReconnectDisabled()).toBe(false);
    });
  });

  describe('资源清理', () => {
    it('应该正确清理资源', () => {
      const mockConnect = vi.fn().mockResolvedValue(undefined);

      eventCoordinator.setupReconnectEvents(mockConnect);
      eventCoordinator.cleanup();

      expect(eventCoordinator.isReconnectDisabled()).toBe(true);

      // 验证连接函数被清除
      eventCoordinator.setupConnectionEvents(connectionManager);
      connectionManager.simulateStateChange(ConnectionState.FAILED);

      // 等待可能的重连逻辑
      vi.advanceTimersByTime(1000);
      expect(mockConnect).not.toHaveBeenCalled();
    });
  });
});
