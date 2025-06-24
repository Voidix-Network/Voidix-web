import { WebSocketMessageParser } from '@/services/websocket/MessageParser';
import type { WebSocketMessage } from '@/types';
import { describe, expect, it } from 'vitest';

describe('WebSocketMessageParser', () => {
  describe('消息解析', () => {
    it('应该能够解析有效的JSON消息', () => {
      const validMessage = { type: 'full', servers: {}, data: 'hello' };
      const rawData = JSON.stringify(validMessage);

      const result = WebSocketMessageParser.parse(rawData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validMessage);
    });

    it('应该在解析无效JSON时返回错误', () => {
      const invalidJson = '{ invalid json }';

      const result = WebSocketMessageParser.parse(invalidJson);
      expect(result.success).toBe(false);
      expect(result.error).toContain('消息解析失败');
    });

    it('应该在消息验证失败时返回错误', () => {
      const invalidMessage = { invalid: 'message' }; // 缺少type字段
      const rawData = JSON.stringify(invalidMessage);

      const result = WebSocketMessageParser.parse(rawData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('消息格式验证失败');
    });
  });

  describe('消息验证', () => {
    it('应该验证消息必须有type字段', () => {
      expect(WebSocketMessageParser.validate({})).toBe(false);
      expect(WebSocketMessageParser.validate({ type: 'test' })).toBe(true);
    });

    it('应该验证full消息格式', () => {
      const validFull = { type: 'full', servers: {} };
      const validFullWithPlayers = { type: 'full', players: {} };
      const invalidFull = { type: 'full' };

      expect(WebSocketMessageParser.validate(validFull)).toBe(true);
      expect(WebSocketMessageParser.validate(validFullWithPlayers)).toBe(true);
      expect(WebSocketMessageParser.validate(invalidFull)).toBe(false);
    });

    it('应该验证维护状态消息格式', () => {
      const validMaintenance = { type: 'maintenance_status_update', status: true };
      const invalidMaintenance = { type: 'maintenance_status_update' };

      expect(WebSocketMessageParser.validate(validMaintenance)).toBe(true);
      expect(WebSocketMessageParser.validate(invalidMaintenance)).toBe(false);
    });

    it('应该验证玩家更新消息格式', () => {
      const validPlayerAdd = { type: 'players_update_add', player: { uuid: '123' } };
      const validPlayerRemove = { type: 'players_update_remove', player: { uuid: '123' } };
      const invalidPlayer = { type: 'players_update_add' };

      expect(WebSocketMessageParser.validate(validPlayerAdd)).toBe(true);
      expect(WebSocketMessageParser.validate(validPlayerRemove)).toBe(true);
      expect(WebSocketMessageParser.validate(invalidPlayer)).toBe(false);
    });

    it('应该验证服务器更新消息格式', () => {
      const validServer = { type: 'server_update', servers: {} };
      const invalidServer = { type: 'server_update' };

      expect(WebSocketMessageParser.validate(validServer)).toBe(true);
      expect(WebSocketMessageParser.validate(invalidServer)).toBe(false);
    });

    it('应该接受未知类型的消息（只要有type字段）', () => {
      const unknownType = { type: 'notice_return', data: 'anything' };

      expect(WebSocketMessageParser.validate(unknownType)).toBe(true);
    });
  });

  describe('服务器数据标准化', () => {
    it('应该标准化简化格式的服务器数据', () => {
      const simpleFormat = { server1: 10, server2: 5 };
      const normalized = WebSocketMessageParser.normalizeServerData(simpleFormat);

      expect(normalized).toEqual({
        server1: { online: 10, isOnline: true },
        server2: { online: 5, isOnline: true },
      });
    });

    it('应该保持完整格式的服务器数据', () => {
      const fullFormat = {
        server1: { online: 10, isOnline: true, uptime: 3600 },
        server2: { online: 5, isOnline: false },
      };
      const normalized = WebSocketMessageParser.normalizeServerData(fullFormat);

      expect(normalized).toEqual(fullFormat);
    });

    it('应该处理混合格式的服务器数据', () => {
      const mixedFormat = {
        server1: 10, // 简化格式
        server2: { online: 5, isOnline: false }, // 完整格式
      };
      const normalized = WebSocketMessageParser.normalizeServerData(mixedFormat);

      expect(normalized).toEqual({
        server1: { online: 10, isOnline: true },
        server2: { online: 5, isOnline: false },
      });
    });

    it('应该跳过无效的服务器数据', () => {
      const invalidFormat = {
        server1: 10, // 有效
        server2: null, // 无效
        server3: 'invalid', // 无效
        server4: { online: 5 }, // 有效
      };
      const normalized = WebSocketMessageParser.normalizeServerData(invalidFormat);

      expect(normalized).toEqual({
        server1: { online: 10, isOnline: true },
        server4: { online: 5 },
      });
    });

    it('应该处理空或无效输入', () => {
      expect(WebSocketMessageParser.normalizeServerData(null)).toEqual({});
      expect(WebSocketMessageParser.normalizeServerData(undefined)).toEqual({});
      expect(WebSocketMessageParser.normalizeServerData('invalid')).toEqual({});
      expect(WebSocketMessageParser.normalizeServerData({})).toEqual({});
    });
  });

  describe('数据提取功能', () => {
    it('应该正确提取玩家信息', () => {
      const message = {
        type: 'players_update_add',
        player: { uuid: '123', name: 'test' },
      } as WebSocketMessage;
      const playerInfo = WebSocketMessageParser.extractPlayerInfo(message);

      expect(playerInfo).toEqual({ uuid: '123', name: 'test' });
    });

    it('在没有玩家信息时应该返回null', () => {
      const message = { type: 'maintenance_status_update' } as WebSocketMessage;
      const playerInfo = WebSocketMessageParser.extractPlayerInfo(message);

      expect(playerInfo).toBeNull();
    });

    it('应该正确检查是否包含玩家数据', () => {
      const withPlayerData = {
        type: 'full',
        players: { max: 100, online: '5', currentPlayers: { player1: {} } },
      } as WebSocketMessage;
      const withoutPlayerData = {
        type: 'full',
        players: { max: 100, online: '0', currentPlayers: {} },
      } as WebSocketMessage;
      const emptyPlayerData = {
        type: 'full',
        players: { max: 100, online: '0', currentPlayers: {} },
      } as WebSocketMessage;

      expect(WebSocketMessageParser.hasPlayerData(withPlayerData)).toBe(true);
      expect(WebSocketMessageParser.hasPlayerData(withoutPlayerData)).toBe(false);
      expect(WebSocketMessageParser.hasPlayerData(emptyPlayerData)).toBe(false);
    });

    it('应该正确提取服务器数据', () => {
      const message = {
        type: 'server_update',
        servers: { server1: { online: 10, isOnline: true } },
      } as WebSocketMessage;
      const serverData = WebSocketMessageParser.extractServerData(message);

      expect(serverData).toEqual({
        server1: { online: 10, isOnline: true },
      });
    });

    it('在没有服务器数据时应该返回null', () => {
      const message = { type: 'maintenance_status_update' } as WebSocketMessage;
      const serverData = WebSocketMessageParser.extractServerData(message);

      expect(serverData).toBeNull();
    });
  });

  describe('调试功能', () => {
    it('应该生成正确的调试信息', () => {
      const message = {
        type: 'full',
        servers: {
          server1: { online: 10, isOnline: true },
          server2: { online: 5, isOnline: true },
        },
        players: { max: 100, online: '5', currentPlayers: { player1: {} } },
        player: { uuid: '123' },
      } as WebSocketMessage;

      const debugInfo = WebSocketMessageParser.getDebugInfo(message);

      expect(debugInfo).toMatchObject({
        type: 'full',
        hasServers: true,
        hasPlayers: true,
        hasCurrentPlayers: true,
        playerInfo: { uuid: '123' },
        serverCount: 2,
      });
      expect(debugInfo.timestamp).toBeDefined();
      expect(typeof debugInfo.timestamp).toBe('string');
    });

    it('应该处理最小消息的调试信息', () => {
      const message = { type: 'maintenance_status_update' } as WebSocketMessage;
      const debugInfo = WebSocketMessageParser.getDebugInfo(message);

      expect(debugInfo).toMatchObject({
        type: 'maintenance_status_update',
        hasServers: false,
        hasPlayers: false,
        hasCurrentPlayers: false,
        playerInfo: null,
        serverCount: 0,
      });
    });
  });
});
