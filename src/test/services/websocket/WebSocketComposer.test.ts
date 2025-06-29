/**
 * WebSocketComposer模块测试
 * 测试WebSocket组合器的功能和模块协调
 */

import { WebSocketComposer } from '@/services/websocket/WebSocketComposer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MockWebSocket, initializeWebSocketMocks } from '../../mocks/webSocketMocks';

// 初始化WebSocket模拟
initializeWebSocketMocks();

describe('WebSocketComposer', () => {
  let composer: WebSocketComposer;
  let mockWs: MockWebSocket;

  beforeEach(() => {
    composer = new WebSocketComposer({
      url: 'ws://localhost:8080',
      connectionTimeout: 1000,
      disableReconnect: false,
    });

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock timers
    vi.useFakeTimers();

    // Clear WebSocket instances
    MockWebSocket.clearInstances();
  });

  afterEach(() => {
    composer.forceStop();
    MockWebSocket.clearInstances();
    vi.useRealTimers();
  });

  describe('模块组装和初始化', () => {
    it('应该正确初始化所有模块', () => {
      expect(composer.modules.eventEmitter).toBeDefined();
      expect(composer.modules.connectionManager).toBeDefined();
      expect(composer.modules.maintenanceHandler).toBeDefined();
      expect(composer.modules.messageRouter).toBeDefined();
      expect(composer.modules.eventCoordinator).toBeDefined();
      expect(composer.modules.reconnectStrategy).toBeDefined();
    });

    it('应该正确设置模块间协调', () => {
      // 验证连接状态
      expect(composer.isConnected).toBe(false);
      expect(composer.readyState).toBe(MockWebSocket.CLOSED);
      expect(composer.currentReconnectAttempts).toBe(0);
    });
  });

  describe('连接管理', () => {
    it('应该能够建立WebSocket连接', async () => {
      const connectPromise = composer.connect();

      // 等待WebSocket实例创建
      vi.advanceTimersByTime(50);

      mockWs = MockWebSocket.getLastInstance()!;
      expect(mockWs).toBeDefined();

      // 模拟连接成功
      mockWs.simulateOpen();

      await connectPromise;

      expect(composer.isConnected).toBe(true);
      expect(composer.readyState).toBe(MockWebSocket.OPEN);
    });

    it('应该能够断开WebSocket连接', async () => {
      // 先建立连接
      const connectPromise = composer.connect();
      vi.advanceTimersByTime(50);

      mockWs = MockWebSocket.getLastInstance()!;
      mockWs.simulateOpen();

      await connectPromise;
      expect(composer.isConnected).toBe(true);

      // 断开连接
      composer.disconnect();

      expect(composer.isConnected).toBe(false);
    });

    it('应该正确处理连接失败', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');

      const connectPromise = composer.connect();

      // 不推进时间，直接获取WebSocket实例
      mockWs = MockWebSocket.getLastInstance()!;
      mockWs.preventAutoConnect();

      // 确保在状态还是CONNECTING时触发错误
      expect(mockWs.readyState).toBe(MockWebSocket.CONNECTING);

      // 立即触发错误
      mockWs.simulateError();

      await expect(connectPromise).rejects.toThrow('WebSocket connection error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ConnectionManager] 连接错误:',
        expect.any(Event)
      );
    });
  });

  describe('事件处理', () => {
    it('应该正确处理连接事件', async () => {
      const onConnected = vi.fn();
      const onDisconnected = vi.fn();

      composer.on('connected', onConnected);
      composer.on('disconnected', onDisconnected);

      // 建立连接
      const connectPromise = composer.connect();
      vi.advanceTimersByTime(50);

      mockWs = MockWebSocket.getLastInstance()!;
      mockWs.simulateOpen();

      await connectPromise;
      expect(onConnected).toHaveBeenCalled();

      // 断开连接
      mockWs.simulateClose(1000, 'Normal closure');

      expect(onDisconnected).toHaveBeenCalledWith({
        code: 1000,
        reason: 'Normal closure',
      });
    });

    it('应该正确处理错误事件', async () => {
      const onError = vi.fn();

      composer.on('error', onError);

      // 建立连接
      const connectPromise = composer.connect();
      vi.advanceTimersByTime(50);

      mockWs = MockWebSocket.getLastInstance()!;
      mockWs.simulateOpen();

      await connectPromise;

      // 模拟错误
      mockWs.simulateError();

      expect(onError).toHaveBeenCalledWith(expect.any(Event));
    });

    it('应该正确处理重连事件', async () => {
      const onReconnecting = vi.fn();
      const onConnectionFailed = vi.fn();

      composer.on('reconnecting', onReconnecting);
      composer.on('connectionFailed', onConnectionFailed);

      // 建立连接
      const connectPromise = composer.connect();
      vi.advanceTimersByTime(50);

      mockWs = MockWebSocket.getLastInstance()!;
      mockWs.simulateOpen();

      await connectPromise;

      // 模拟连接失败触发重连
      mockWs.simulateClose(1006, 'Connection lost');

      // 等待重连逻辑启动
      vi.advanceTimersByTime(200);

      expect(onReconnecting).toHaveBeenCalledWith({
        attempt: 1,
        delay: expect.any(Number),
        maxAttempts: expect.any(Number),
      });
    });
  });

  describe('消息处理', () => {
    it('应该正确处理WebSocket消息', async () => {
      const onFullUpdate = vi.fn();

      composer.on('fullUpdate', onFullUpdate);

      // 建立连接
      const connectPromise = composer.connect();
      vi.advanceTimersByTime(50);

      mockWs = MockWebSocket.getLastInstance()!;
      mockWs.simulateOpen();

      await connectPromise;

      // 发送消息
      const messageData = {
        type: 'full',
        servers: {
          survival: { online: 10, isOnline: true },
        },
        players: { online: '10', currentPlayers: {} },
        runningTime: 3600,
        isMaintenance: false,
        protocol_version: 2,
      };

      mockWs.simulateMessage(messageData);

      expect(onFullUpdate).toHaveBeenCalledWith({
        servers: messageData.servers,
        players: messageData.players,
        runningTime: 3600,
        totalRunningTime: undefined,
        isMaintenance: false,
        maintenanceStartTime: null,
      });
    });

    it('应该正确处理玩家更新消息', async () => {
      const onPlayerAdd = vi.fn();
      const onPlayerUpdate = vi.fn();

      composer.on('playerAdd', onPlayerAdd);
      composer.on('playerUpdate', onPlayerUpdate);

      // 建立连接
      const connectPromise = composer.connect();
      vi.advanceTimersByTime(50);

      mockWs = MockWebSocket.getLastInstance()!;
      mockWs.simulateOpen();

      await connectPromise;

      // 发送玩家上线消息
      const messageData = {
        type: 'players_update_add',
        player: {
          uuid: 'test-uuid',
          currentServer: 'survival',
        },
        totalOnlinePlayers: 11,
      };

      mockWs.simulateMessage(messageData);

      expect(onPlayerAdd).toHaveBeenCalledWith({
        playerId: 'test-uuid',
        serverId: 'survival',
        playerInfo: messageData.player,
        player: messageData.player,
      });

      expect(onPlayerUpdate).toHaveBeenCalledWith({
        totalOnlinePlayers: '11',
        type: 'players_update_add',
      });
    });
  });

  describe('事件监听器管理', () => {
    it('应该能够添加和移除事件监听器', () => {
      const handler = vi.fn();

      composer.on('connected', handler);
      composer.off('connected', handler);

      // 触发事件，验证监听器已移除
      composer.modules.eventEmitter.emit('connected');

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('强制停止', () => {
    it('应该能够强制停止所有活动', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log');

      // 建立连接
      const connectPromise = composer.connect();
      vi.advanceTimersByTime(50);

      mockWs = MockWebSocket.getLastInstance()!;
      mockWs.simulateOpen();

      await connectPromise;
      expect(composer.isConnected).toBe(true);

      // 强制停止
      composer.forceStop();

      expect(composer.isConnected).toBe(false);
      expect(composer.currentReconnectAttempts).toBe(0);
      expect(consoleLogSpy).toHaveBeenCalledWith('[WebSocketComposer] 强制停止完成');
    });
  });

  describe('向后兼容性', () => {
    it('WebSocketService应该是WebSocketComposer的别名', async () => {
      const { WebSocketService } = await import('@/services/websocket');

      expect(WebSocketService).toBe(WebSocketComposer);

      const service = new WebSocketService();
      expect(service).toBeInstanceOf(WebSocketComposer);
    });
  });
});
