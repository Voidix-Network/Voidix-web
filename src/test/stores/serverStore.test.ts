/**
 * serverStore测试套件
 * 测试Zustand状态管理的核心功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useServerStore } from '@/stores/serverStore';
import type { ServerData } from '@/types';

describe('serverStore', () => {
  beforeEach(() => {
    // 在每个测试前重置store状态
    useServerStore.getState().reset();
  });

  afterEach(() => {
    // 清理定时器和状态
    useServerStore.getState().reset();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('基础状态操作', () => {
    it('应该正确初始化默认状态', () => {
      const state = useServerStore.getState();

      expect(state.servers).toEqual({});
      expect(state.connectionStatus).toBe('disconnected');
      expect(state.aggregateStats).toEqual({
        totalPlayers: 0,
        onlineServers: 0,
        totalUptime: 0,
      });
      expect(state.isMaintenance).toBe(false);
      expect(state.maintenanceStartTime).toBeNull();
      expect(state.forceShowMaintenance).toBe(false);
    });

    it('应该正确更新连接状态', () => {
      const { updateConnectionStatus } = useServerStore.getState();

      updateConnectionStatus('connected');
      expect(useServerStore.getState().connectionStatus).toBe('connected');

      updateConnectionStatus('reconnecting');
      expect(useServerStore.getState().connectionStatus).toBe('reconnecting');

      updateConnectionStatus('failed');
      expect(useServerStore.getState().connectionStatus).toBe('failed');
    });

    it('应该正确更新单个服务器状态', () => {
      const { updateServer } = useServerStore.getState();

      updateServer('survival', {
        players: 10,
        status: 'online',
        isOnline: true,
      });

      const state = useServerStore.getState();
      expect(state.servers.survival).toBeDefined();
      expect(state.servers.survival.players).toBe(10);
      expect(state.servers.survival.status).toBe('online');
      expect(state.servers.survival.isOnline).toBe(true);
      expect(state.lastUpdateTime).toBeInstanceOf(Date);
    });
    it('应该从原始数据正确更新服务器状态', () => {
      const { updateServerFromData } = useServerStore.getState();

      const serverData: ServerData = {
        online: 15,
        isOnline: true,
        uptime: 3600,
      };

      updateServerFromData('creative', serverData);

      const state = useServerStore.getState();
      const server = state.servers.creative;

      expect(server).toBeDefined();
      expect(server.players).toBe(15);
      expect(server.status).toBe('online');
      expect(server.uptime).toBe(3600);
      expect(server.displayName).toBe('creative'); // 修正：SERVER_DISPLAY_NAMES中没有creative定义，所以使用serverId
      expect(server.address).toBe('creative.voidix.net');
    });

    it('应该正确批量更新多个服务器', () => {
      const { updateMultipleServers } = useServerStore.getState();

      const serversData: Record<string, ServerData> = {
        survival: { online: 10, isOnline: true, uptime: 1800 },
        creative: { online: 5, isOnline: true, uptime: 2400 },
        lobby1: { online: 3, isOnline: true, uptime: 3600 },
      };

      updateMultipleServers(serversData);

      const state = useServerStore.getState();
      expect(Object.keys(state.servers)).toHaveLength(3);
      expect(state.servers.survival.players).toBe(10);
      expect(state.servers.creative.players).toBe(5);
      expect(state.servers.lobby1.players).toBe(3);
    });

    it('应该正确处理服务器离线状态', () => {
      const { updateServerFromData } = useServerStore.getState();

      // 测试明确设置为离线
      updateServerFromData('offline-server', {
        online: 0,
        isOnline: false,
      });

      const state = useServerStore.getState();
      const server = state.servers['offline-server'];

      expect(server.status).toBe('offline');
      expect(server.isOnline).toBe(false);
      expect(server.players).toBe(0);
    });

    it('应该智能判断服务器在线状态', () => {
      const { updateServerFromData } = useServerStore.getState();

      // 测试没有isOnline字段但有玩家数量的情况
      updateServerFromData('auto-online', {
        online: 8,
        // 没有isOnline字段
      });

      const state = useServerStore.getState();
      const server = state.servers['auto-online'];

      expect(server.status).toBe('online');
      expect(server.isOnline).toBe(true);
      expect(server.players).toBe(8);
    });
  });

  describe('聚合统计计算', () => {
    it('应该正确计算聚合统计', () => {
      const { updateMultipleServers, calculateAggregateStats } = useServerStore.getState();

      // 添加一些测试服务器数据
      updateMultipleServers({
        survival: { online: 10, isOnline: true, uptime: 3600 },
        creative: { online: 5, isOnline: true, uptime: 2400 },
        lobby1: { online: 3, isOnline: true, uptime: 1800 },
        offline: { online: 0, isOnline: false, uptime: 0 },
      });

      calculateAggregateStats();

      const state = useServerStore.getState();
      expect(state.aggregateStats.totalPlayers).toBe(18); // 10 + 5 + 3
      expect(state.aggregateStats.onlineServers).toBe(3); // 排除offline服务器
      expect(state.aggregateStats.totalUptime).toBe(3600); // 最大uptime
    });

    it('应该排除anticheat_test服务器', () => {
      const { updateMultipleServers, calculateAggregateStats } = useServerStore.getState();

      updateMultipleServers({
        survival: { online: 10, isOnline: true },
        anticheat_test: { online: 50, isOnline: true }, // 应该被排除
        creative: { online: 5, isOnline: true },
      });

      calculateAggregateStats();

      const state = useServerStore.getState();
      expect(state.aggregateStats.totalPlayers).toBe(15); // 只计算 survival + creative
      expect(state.aggregateStats.onlineServers).toBe(2);
    });

    it('应该更新总玩家数', () => {
      const { updateTotalPlayers } = useServerStore.getState();

      updateTotalPlayers('25');

      const state = useServerStore.getState();
      expect(state.aggregateStats.totalPlayers).toBe(25);
      expect(state.lastUpdateTime).toBeInstanceOf(Date);
    });

    it('应该在玩家状态变化后重新计算', () => {
      const { updateServer, recalculateAfterPlayerChange } = useServerStore.getState();
      const calculateSpy = vi.spyOn(useServerStore.getState(), 'calculateAggregateStats');

      updateServer('test-server', { players: 10, status: 'online' });
      recalculateAfterPlayerChange();

      expect(calculateSpy).toHaveBeenCalled();
    });
  });

  describe('维护模式管理', () => {
    it('应该正确更新维护状态', () => {
      const { updateMaintenanceStatus } = useServerStore.getState();

      updateMaintenanceStatus(true, '2025-06-14T00:00:00Z');

      const state = useServerStore.getState();
      expect(state.isMaintenance).toBe(true);
      expect(state.maintenanceStartTime).toBe('2025-06-14T00:00:00Z');
      expect(state.forceShowMaintenance).toBe(false);
      expect(state.lastUpdateTime).toBeInstanceOf(Date);
    });

    it('应该支持强制维护模式', () => {
      const { updateMaintenanceStatus } = useServerStore.getState();

      // 即使传入false，强制模式也应该显示维护
      updateMaintenanceStatus(false, null, true);

      const state = useServerStore.getState();
      expect(state.isMaintenance).toBe(true); // 因为force=true
      expect(state.forceShowMaintenance).toBe(true);
    });
  });

  describe('玩家位置追踪', () => {
    beforeEach(() => {
      // 先添加一些服务器用于测试
      const { updateMultipleServers } = useServerStore.getState();
      updateMultipleServers({
        survival: { online: 5, isOnline: true },
        creative: { online: 3, isOnline: true },
        lobby1: { online: 2, isOnline: true },
      });
    });

    it('应该正确处理玩家上线', () => {
      const { handlePlayerAdd } = useServerStore.getState();

      handlePlayerAdd('player1', 'survival');

      const state = useServerStore.getState();
      expect(state.playersLocation.player1).toBe('survival');
      expect(state.servers.survival.players).toBe(6); // 5 + 1
    });

    it('应该正确处理玩家下线', () => {
      const { handlePlayerAdd, handlePlayerRemove } = useServerStore.getState();

      // 先让玩家上线
      handlePlayerAdd('player1', 'survival');
      expect(useServerStore.getState().servers.survival.players).toBe(6);

      // 然后下线
      handlePlayerRemove('player1');

      const state = useServerStore.getState();
      expect(state.playersLocation.player1).toBeUndefined();
      expect(state.servers.survival.players).toBe(5); // 回到原来的数量
    });

    it('应该正确处理玩家服务器间移动', () => {
      const { handlePlayerAdd, handlePlayerMove } = useServerStore.getState();

      // 先让玩家在survival上线
      handlePlayerAdd('player1', 'survival');
      expect(useServerStore.getState().servers.survival.players).toBe(6);

      // 移动到creative
      handlePlayerMove('player1', 'survival', 'creative');

      const state = useServerStore.getState();
      expect(state.playersLocation.player1).toBe('creative');
      expect(state.servers.survival.players).toBe(5); // 减少1
      expect(state.servers.creative.players).toBe(4); // 增加1
    });

    it('应该防止玩家数低于0', () => {
      const { handlePlayerRemove } = useServerStore.getState();

      // Mock console.warn to capture expected warning messages (not console.error)
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // 尝试从已经为0的服务器移除玩家（先设置一个空服务器）
      const { updateServer } = useServerStore.getState();
      updateServer('empty-server', { players: 0, status: 'online' });

      // 伪造一个玩家位置记录
      useServerStore.setState(state => ({
        ...state,
        playersLocation: { 'phantom-player': 'empty-server' },
      }));

      handlePlayerRemove('phantom-player');

      const state = useServerStore.getState();
      expect(state.servers['empty-server'].players).toBe(0); // 不应该变成负数

      // Verify that the expected warning was logged
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('尝试从服务器'));

      // Restore console.warn
      consoleWarnSpy.mockRestore();
    });
  });

  describe('完整状态更新', () => {
    it('应该正确处理完整状态更新', () => {
      const { handleFullUpdate } = useServerStore.getState();

      const fullData = {
        servers: {
          survival: { online: 15, isOnline: true, uptime: 3600 },
          creative: { online: 8, isOnline: true, uptime: 2400 },
        },
        players: { online: '23', currentPlayers: {} },
        runningTime: 7200,
        totalRunningTime: 144000,
        isMaintenance: false,
        maintenanceStartTime: null,
      };

      handleFullUpdate(fullData);

      const state = useServerStore.getState();
      expect(Object.keys(state.servers)).toHaveLength(2);
      expect(state.aggregateStats.totalPlayers).toBe(23);
      expect(state.runningTime).toBe(7200);
      expect(state.totalRunningTime).toBe(144000);
      expect(state.isMaintenance).toBe(false);
      expect(state.lastUpdateTime).toBeInstanceOf(Date);
    });

    it('应该处理字符串格式的运行时间', () => {
      const { handleFullUpdate } = useServerStore.getState();

      const fullData = {
        servers: {},
        players: { online: '0', currentPlayers: {} },
        runningTime: '3600', // 字符串格式
        totalRunningTime: '72000', // 字符串格式
        isMaintenance: false,
        maintenanceStartTime: null,
      };

      handleFullUpdate(fullData);

      const state = useServerStore.getState();
      expect(state.runningTime).toBe(3600); // 应该转换为数字
      expect(state.totalRunningTime).toBe(72000);
    });
  });

  describe('状态重置', () => {
    it('应该正确重置所有状态', () => {
      const { updateServer, updateConnectionStatus, updateMaintenanceStatus, reset } =
        useServerStore.getState();

      // 先设置一些状态
      updateServer('test', { players: 10, status: 'online' });
      updateConnectionStatus('connected');
      updateMaintenanceStatus(true);

      // 验证状态已更改
      let state = useServerStore.getState();
      expect(Object.keys(state.servers)).toHaveLength(1);
      expect(state.connectionStatus).toBe('connected');
      expect(state.isMaintenance).toBe(true);

      // 重置状态
      reset();

      // 验证状态已重置
      state = useServerStore.getState();
      expect(state.servers).toEqual({});
      expect(state.connectionStatus).toBe('disconnected');
      expect(state.isMaintenance).toBe(false);
      expect(state.aggregateStats).toEqual({
        totalPlayers: 0,
        onlineServers: 0,
        totalUptime: 0,
      });
    });
  });
});
