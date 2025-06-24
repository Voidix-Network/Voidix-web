/**
 * MessageRouter模块测试
 * 测试WebSocket消息路由和处理逻辑
 */

import { WebSocketEventEmitter } from '@/services/websocket/EventEmitter';
import { MaintenanceHandler } from '@/services/websocket/MaintenanceHandler';
import { MessageRouter } from '@/services/websocket/MessageRouter';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('MessageRouter', () => {
  let messageRouter: MessageRouter;
  let eventEmitter: WebSocketEventEmitter;
  let maintenanceHandler: MaintenanceHandler;

  beforeEach(() => {
    eventEmitter = new WebSocketEventEmitter();
    maintenanceHandler = new MaintenanceHandler();
    messageRouter = new MessageRouter(eventEmitter, maintenanceHandler);

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('消息解析和路由', () => {
    it('应该正确处理有效的JSON消息', () => {
      const mockEmit = vi.spyOn(eventEmitter, 'emit');
      const messageData = {
        type: 'full',
        servers: {},
        players: { online: '0' },
        protocol_version: 1, // 添加协议版本
      };
      const event = new MessageEvent('message', {
        data: JSON.stringify(messageData),
      });

      messageRouter.handleMessage(event);

      expect(mockEmit).toHaveBeenCalledWith('fullUpdate', expect.any(Object));
    });

    it('应该处理无效的JSON消息', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');
      const event = new MessageEvent('message', {
        data: 'invalid json',
      });

      messageRouter.handleMessage(event);

      // 第一个错误来自MessageParser
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[MessageParser] 消息解析失败:',
        expect.any(Error),
        'Raw data:',
        'invalid json'
      );

      // 第二个错误来自MessageRouter
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[MessageRouter] 消息解析失败:',
        expect.stringContaining('消息解析失败:')
      );
    });

    it('应该处理未知消息类型', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn');
      const messageData = { type: 'unknown_type', data: 'test' };
      const event = new MessageEvent('message', {
        data: JSON.stringify(messageData),
      });

      messageRouter.handleMessage(event);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[MessageRouter] 未知消息类型:',
        'unknown_type',
        messageData
      );
    });
  });

  describe('fullUpdate消息处理', () => {
    it('应该正确处理完整的fullUpdate消息', () => {
      const mockEmit = vi.spyOn(eventEmitter, 'emit');
      const messageData = {
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
        protocol_version: 1, // 添加协议版本
      };
      const event = new MessageEvent('message', {
        data: JSON.stringify(messageData),
      });

      messageRouter.handleMessage(event);

      expect(mockEmit).toHaveBeenCalledWith('fullUpdate', {
        servers: messageData.servers,
        players: messageData.players,
        runningTime: 3600,
        totalRunningTime: 7200,
        isMaintenance: false,
        maintenanceStartTime: null,
      });
    });

    it('应该处理缺少字段的fullUpdate消息', () => {
      const mockEmit = vi.spyOn(eventEmitter, 'emit');
      const messageData = {
        type: 'full',
        servers: {}, // 提供空的servers对象以通过验证
        protocol_version: 1, // 添加协议版本
        // 缺少players字段
      };
      const event = new MessageEvent('message', {
        data: JSON.stringify(messageData),
      });

      messageRouter.handleMessage(event);

      expect(mockEmit).toHaveBeenCalledWith('fullUpdate', {
        servers: {},
        players: { online: '0', currentPlayers: {} },
        runningTime: undefined,
        totalRunningTime: undefined,
        isMaintenance: false,
        maintenanceStartTime: null,
      });
    });
  });

  describe('玩家更新消息处理', () => {
    it('应该处理玩家上线消息', () => {
      const mockEmit = vi.spyOn(eventEmitter, 'emit');
      const messageData = {
        type: 'players_update_add',
        player: {
          uuid: 'test-uuid',
          currentServer: 'survival',
        },
        totalOnlinePlayers: 10,
      };
      const event = new MessageEvent('message', {
        data: JSON.stringify(messageData),
      });

      messageRouter.handleMessage(event);

      expect(mockEmit).toHaveBeenCalledWith('playerAdd', {
        playerId: 'test-uuid',
        serverId: 'survival',
        playerInfo: messageData.player,
        player: messageData.player,
      });

      expect(mockEmit).toHaveBeenCalledWith('playerUpdate', {
        totalOnlinePlayers: '10',
        type: 'players_update_add',
      });
    });

    it('应该处理玩家下线消息', () => {
      const mockEmit = vi.spyOn(eventEmitter, 'emit');
      const messageData = {
        type: 'players_update_remove',
        player: {
          uuid: 'test-uuid',
        },
      };
      const event = new MessageEvent('message', {
        data: JSON.stringify(messageData),
      });

      messageRouter.handleMessage(event);

      expect(mockEmit).toHaveBeenCalledWith('playerRemove', {
        playerId: 'test-uuid',
        playerInfo: messageData.player,
        player: messageData.player,
      });

      expect(mockEmit).toHaveBeenCalledWith('playerUpdate', {
        totalOnlinePlayers: null,
        type: 'players_update_remove',
        player: messageData.player,
      });
    });
  });

  describe('服务器更新消息处理', () => {
    it('应该处理简化格式的服务器更新', () => {
      const mockEmit = vi.spyOn(eventEmitter, 'emit');
      const messageData = {
        type: 'server_update',
        servers: {
          survival: 10,
          creative: 5,
        },
      };
      const event = new MessageEvent('message', {
        data: JSON.stringify(messageData),
      });

      messageRouter.handleMessage(event);

      expect(mockEmit).toHaveBeenCalledWith('serverUpdate', {
        servers: {
          survival: { online: 10, isOnline: true },
          creative: { online: 5, isOnline: true },
        },
      });
    });

    it('应该处理包含玩家移动的服务器更新', () => {
      const mockEmit = vi.spyOn(eventEmitter, 'emit');
      const messageData = {
        type: 'server_update',
        player: {
          uuid: 'test-uuid',
          previousServer: 'survival',
          newServer: 'creative',
        },
        servers: {
          survival: 9,
          creative: 6,
        },
      };
      const event = new MessageEvent('message', {
        data: JSON.stringify(messageData),
      });

      messageRouter.handleMessage(event);

      expect(mockEmit).toHaveBeenCalledWith('playerMove', {
        playerId: 'test-uuid',
        fromServer: 'survival',
        toServer: 'creative',
        playerInfo: messageData.player,
      });

      expect(mockEmit).toHaveBeenCalledWith('serverUpdate', expect.any(Object));
    });
  });

  describe('维护状态消息处理', () => {
    it('应该处理维护状态更新消息', () => {
      const mockHandle = vi.spyOn(maintenanceHandler, 'handleMaintenanceMessage');
      const messageData = {
        type: 'maintenance_status_update',
        status: true,
        maintenanceStartTime: '2025-06-14T00:00:00Z',
      };
      const event = new MessageEvent('message', {
        data: JSON.stringify(messageData),
      });

      messageRouter.handleMessage(event);

      expect(mockHandle).toHaveBeenCalledWith({
        status: true,
        maintenanceStartTime: '2025-06-14T00:00:00Z',
      });
    });
  });

  describe('公告系统消息处理', () => {
    it('应该记录但不处理公告系统消息', () => {
      const consoleLogSpy = vi.spyOn(console, 'log');
      const messageData = {
        type: 'notice_update_add_respond',
        data: 'test notice',
      };
      const event = new MessageEvent('message', {
        data: JSON.stringify(messageData),
      });

      messageRouter.handleMessage(event);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[MessageRouter] 处理公告更新消息:',
        'notice_update_add_respond',
        messageData
      );
    });
  });
});
