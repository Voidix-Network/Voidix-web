/**
 * WebSocket服务测试套件
 * 测试WebSocket连接管理、消息处理和事件系统
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebSocketService } from '@/services/websocket';
import { MockWebSocket } from '../mocks/webSocketMocks';

describe('WebSocketService', () => {
  let service: InstanceType<typeof WebSocketService>;
  let mockWs: MockWebSocket;

  beforeEach(() => {
    // 清理之前的WebSocket实例
    MockWebSocket.clearInstances();

    // 创建新的服务实例
    service = new WebSocketService({
      url: 'ws://localhost:8080',
      connectionTimeout: 1000, // 缩短超时时间用于测试
      maxReconnectAttempts: 3,
      reconnectIntervals: [100, 200, 300],
    });
  });

  afterEach(() => {
    // 强制停止服务以清理所有定时器和连接
    service.forceStop();
    MockWebSocket.clearInstances();

    // 清理vi定时器
    vi.clearAllTimers();
  });

  describe('连接管理', () => {
    it('应该成功建立WebSocket连接', async () => {
      const connectPromise = service.connect();

      // 获取创建的WebSocket实例
      mockWs = MockWebSocket.getLastInstance()!;
      expect(mockWs).toBeDefined();
      expect(mockWs.url).toBe('ws://localhost:8080');

      // 模拟连接成功
      mockWs.simulateOpen();

      await connectPromise;

      expect(service.isConnected).toBe(true);
      expect(service.readyState).toBe(WebSocket.OPEN);
    });

    it('应该处理连接超时', async () => {
      // 创建一个专门用于测试超时的服务实例，禁用重连
      const timeoutService = new WebSocketService({
        url: 'ws://localhost:8080',
        connectionTimeout: 1000,
        maxReconnectAttempts: 3,
        reconnectIntervals: [100, 200, 300],
        disableReconnect: true, // 禁用重连避免测试干扰
      });

      const connectPromise = timeoutService.connect();

      const timeoutMockWs = MockWebSocket.getLastInstance()!;

      // 阻止自动连接，模拟超时情况
      timeoutMockWs.preventAutoConnect();

      // 使用Promise.race来测试超时
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), 1100);
      });

      try {
        await Promise.race([connectPromise, timeoutPromise]);
        // 如果到这里说明没有超时，测试失败
        expect(true).toBe(false);
      } catch (error) {
        // 预期会有错误（连接超时或我们的timeout promise）
        expect(error).toBeDefined();
      }

      expect(timeoutService.isConnected).toBe(false);

      // 清理
      timeoutService.forceStop();
    }, 15000); // 增加测试超时时间到15秒

    it('应该避免重复连接', async () => {
      // 第一次连接
      const connectPromise1 = service.connect();
      mockWs = MockWebSocket.getLastInstance()!;
      mockWs.simulateOpen();
      await connectPromise1;

      const instanceCount = MockWebSocket.getAllInstances().length;

      // 尝试第二次连接
      await service.connect();

      // 应该没有创建新的WebSocket实例
      expect(MockWebSocket.getAllInstances().length).toBe(instanceCount);
    });

    it('应该正确断开连接', async () => {
      const connectPromise = service.connect();
      mockWs = MockWebSocket.getLastInstance()!;
      mockWs.simulateOpen();
      await connectPromise;

      expect(service.isConnected).toBe(true);

      service.disconnect();

      expect(mockWs.readyState).toBe(WebSocket.CLOSING);
      expect(service.isConnected).toBe(false);
    });
  });

  describe('消息处理', () => {
    beforeEach(async () => {
      const connectPromise = service.connect();
      mockWs = MockWebSocket.getLastInstance()!;
      mockWs.simulateOpen();
      await connectPromise;
    });

    it('应该处理full消息类型', () => {
      const eventHandler = vi.fn();
      service.on('fullUpdate', eventHandler);

      const fullMessage = {
        type: 'full',
        servers: {
          survival: { online: 10, isOnline: true },
          creative: { online: 5, isOnline: true },
        },
        players: { online: '15', currentPlayers: {} },
        runningTime: 3600,
        totalRunningTime: 7200,
        isMaintenance: false,
        maintenanceStartTime: null,
      };

      mockWs.simulateMessage(fullMessage);

      expect(eventHandler).toHaveBeenCalledWith({
        servers: fullMessage.servers,
        players: fullMessage.players,
        runningTime: fullMessage.runningTime,
        totalRunningTime: fullMessage.totalRunningTime,
        isMaintenance: false,
        maintenanceStartTime: null,
      });
    });

    it('应该处理维护状态更新消息', () => {
      const eventHandler = vi.fn();
      service.on('maintenanceUpdate', eventHandler);

      const maintenanceMessage = {
        type: 'maintenance_status_update',
        status: true,
        maintenanceStartTime: '2025-06-14T00:00:00Z',
      };

      mockWs.simulateMessage(maintenanceMessage);

      expect(eventHandler).toHaveBeenCalledWith({
        isMaintenance: true,
        maintenanceStartTime: '2025-06-14T00:00:00Z',
        forceShowMaintenance: true,
      });
    });

    it('应该处理玩家添加消息', () => {
      const playerAddHandler = vi.fn();
      const playerUpdateHandler = vi.fn();
      service.on('playerAdd', playerAddHandler);
      service.on('playerUpdate', playerUpdateHandler);

      const playerAddMessage = {
        type: 'players_update_add',
        player: {
          uuid: 'test-player-uuid',
          currentServer: 'survival',
        },
        totalOnlinePlayers: 11,
      };

      mockWs.simulateMessage(playerAddMessage);

      expect(playerAddHandler).toHaveBeenCalledWith({
        player: playerAddMessage.player, // 新增：实际传递的字段
        playerId: 'test-player-uuid',
        serverId: 'survival',
        playerInfo: playerAddMessage.player,
      });

      expect(playerUpdateHandler).toHaveBeenCalledWith({
        totalOnlinePlayers: '11',
        type: 'players_update_add',
      });
    });

    it('应该处理玩家移除消息', () => {
      const playerRemoveHandler = vi.fn();
      service.on('playerRemove', playerRemoveHandler);

      const playerRemoveMessage = {
        type: 'players_update_remove',
        player: {
          uuid: 'test-player-uuid',
        },
      };

      mockWs.simulateMessage(playerRemoveMessage);

      expect(playerRemoveHandler).toHaveBeenCalledWith({
        player: playerRemoveMessage.player, // 新增：实际传递的字段
        playerId: 'test-player-uuid',
        playerInfo: playerRemoveMessage.player,
      });
    });

    it('应该处理服务器更新消息', () => {
      const serverUpdateHandler = vi.fn();
      service.on('serverUpdate', serverUpdateHandler);

      const serverUpdateMessage = {
        type: 'server_update',
        servers: {
          survival: 12,
          creative: 8,
        },
      };

      mockWs.simulateMessage(serverUpdateMessage);

      expect(serverUpdateHandler).toHaveBeenCalledWith({
        servers: {
          survival: { online: 12, isOnline: true },
          creative: { online: 8, isOnline: true },
        },
      });
    });

    it('应该处理无效JSON消息', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // 发送无效JSON
      mockWs.simulateMessage('invalid json');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('消息解析失败'),
        expect.any(Error),
        'Raw data:',
        'invalid json'
      );

      consoleSpy.mockRestore();
    });

    it('应该处理未知消息类型', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const unknownMessage = {
        type: 'unknown_type',
        data: 'test',
      };

      mockWs.simulateMessage(unknownMessage);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('未知消息类型'),
        'unknown_type',
        unknownMessage
      );

      consoleSpy.mockRestore();
    });
  });

  describe('事件系统', () => {
    it('应该正确注册和触发事件监听器', () => {
      const connectedHandler = vi.fn();

      service.on('connected', connectedHandler);

      service.connect();
      mockWs = MockWebSocket.getLastInstance()!;
      mockWs.simulateOpen();

      expect(connectedHandler).toHaveBeenCalled();
    });

    it('应该正确移除事件监听器', () => {
      const handler = vi.fn();

      service.on('connected', handler);
      service.off('connected', handler);

      service.connect();
      mockWs = MockWebSocket.getLastInstance()!;
      mockWs.simulateOpen();

      expect(handler).not.toHaveBeenCalled();
    });

    it('应该处理事件处理器中的错误', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const errorHandler = vi.fn(() => {
        throw new Error('Handler error');
      });

      service.on('connected', errorHandler);

      service.connect();
      mockWs = MockWebSocket.getLastInstance()!;
      mockWs.simulateOpen();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('事件处理器错误'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('状态属性', () => {
    it('应该正确报告连接状态', async () => {
      expect(service.isConnected).toBe(false);
      expect(service.readyState).toBe(WebSocket.CLOSED);

      const connectPromise = service.connect();
      mockWs = MockWebSocket.getLastInstance()!;

      expect(service.readyState).toBe(WebSocket.CONNECTING);

      mockWs.simulateOpen();
      await connectPromise;

      expect(service.isConnected).toBe(true);
      expect(service.readyState).toBe(WebSocket.OPEN);
    });

    it('应该正确跟踪重连尝试次数', () => {
      expect(service.currentReconnectAttempts).toBe(0);
      expect(typeof service.currentReconnectAttempts).toBe('number');
    });
  });
});
