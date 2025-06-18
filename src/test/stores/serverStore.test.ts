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

      // Mock console.warn to capture expected warning messages
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

      // 更新断言以匹配新的警告消息
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('服务器'));

      // Restore console.warn
      consoleWarnSpy.mockRestore();
    });

    it('应该使用备用策略查找丢失的玩家位置', () => {
      const { handlePlayerRemove, addPlayerIgn } = useServerStore.getState();
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // 1. 添加玩家IGN数据但不添加位置记录（模拟不一致状态）
      addPlayerIgn('lost-player-uuid', 'lost-player', 'survival');

      // 2. 确保 playersLocation 中没有该玩家记录
      const initialState = useServerStore.getState();
      expect(initialState.playersLocation['lost-player-uuid']).toBeUndefined();
      expect(initialState.playerIgns['lost-player-uuid']).toBeDefined();

      // 3. 尝试移除玩家，应该触发备用查找策略
      handlePlayerRemove('lost-player-uuid');

      // 4. 验证使用了备用策略并成功处理
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('位置记录不存在'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('从IGN数据找到玩家'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('修复玩家'));

      // 5. 验证服务器玩家数正确减少
      const finalState = useServerStore.getState();
      expect(finalState.servers.survival.players).toBe(4); // 5 - 1
      expect(finalState.playersLocation['lost-player-uuid']).toBeUndefined();

      consoleLogSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it('应该检测并处理重复的玩家上线', () => {
      const { handlePlayerAdd } = useServerStore.getState();
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // 第一次上线
      handlePlayerAdd('duplicate-player', 'survival');
      expect(useServerStore.getState().servers.survival.players).toBe(6);

      // 重复上线到同一服务器
      handlePlayerAdd('duplicate-player', 'survival');

      // 应该跳过处理并记录警告
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('重复上线'));
      expect(useServerStore.getState().servers.survival.players).toBe(6); // 不应该再次增加

      consoleWarnSpy.mockRestore();
    });

    it('应该将重复上线到不同服务器识别为移动', () => {
      const { handlePlayerAdd } = useServerStore.getState();
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Mock handlePlayerMove to verify it's called
      const movespy = vi.spyOn(useServerStore.getState(), 'handlePlayerMove');

      // 第一次上线到survival
      handlePlayerAdd('moving-player', 'survival');
      expect(useServerStore.getState().servers.survival.players).toBe(6);

      // "上线"到不同服务器，应该被识别为移动
      handlePlayerAdd('moving-player', 'creative');

      // 应该调用移动处理逻辑
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('移动到'));
      expect(movespy).toHaveBeenCalledWith('moving-player', 'survival', 'creative');

      consoleLogSpy.mockRestore();
      movespy.mockRestore();
    });

    it('应该正确处理位置记录不一致的移动操作', () => {
      const { handlePlayerMove, handlePlayerAdd } = useServerStore.getState();
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // 先让玩家上线到survival
      handlePlayerAdd('inconsistent-player', 'survival');

      // 手动修改位置记录造成不一致
      useServerStore.setState(state => ({
        ...state,
        playersLocation: {
          ...state.playersLocation,
          'inconsistent-player': 'creative', // 实际在creative，但要移动命令说从survival
        },
      }));

      // 尝试从survival移动到lobby1，但实际玩家在creative
      handlePlayerMove('inconsistent-player', 'survival', 'lobby1');

      // 应该检测到不一致并使用实际位置
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('位置记录不一致'));

      // 最终玩家应该在lobby1
      const state = useServerStore.getState();
      expect(state.playersLocation['inconsistent-player']).toBe('lobby1');

      consoleWarnSpy.mockRestore();
    });

    describe('增强的容错处理', () => {
      it('应该处理重复的玩家上线', () => {
        const { handlePlayerAdd } = useServerStore.getState();
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        // 第一次上线
        handlePlayerAdd('player1', 'survival');
        const initialPlayers = useServerStore.getState().servers.survival.players;

        // 重复上线到同一服务器
        handlePlayerAdd('player1', 'survival');

        const state = useServerStore.getState();
        expect(state.servers.survival.players).toBe(initialPlayers); // 不应该增加
        expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('重复上线'));

        consoleWarnSpy.mockRestore();
      });

      it('应该将重复上线作为移动处理', () => {
        const { handlePlayerAdd } = useServerStore.getState();
        const handlePlayerMoveSpy = vi.spyOn(useServerStore.getState(), 'handlePlayerMove');

        // 先上线到survival
        handlePlayerAdd('player1', 'survival');
        expect(useServerStore.getState().servers.survival.players).toBe(6);

        // 再次上线到creative（应该被处理为移动）
        handlePlayerAdd('player1', 'creative');

        expect(handlePlayerMoveSpy).toHaveBeenCalledWith('player1', 'survival', 'creative');

        handlePlayerMoveSpy.mockRestore();
      });

      it('应该从IGN数据中恢复丢失的位置记录', () => {
        const { handlePlayerAdd, addPlayerIgn, handlePlayerRemove } = useServerStore.getState();
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        // 先正常上线并添加IGN数据
        handlePlayerAdd('player1', 'survival');
        addPlayerIgn('player1', 'TestPlayer', 'survival');

        // 模拟位置记录丢失
        useServerStore.setState(state => ({
          ...state,
          playersLocation: {}, // 清空位置记录
        }));

        // 尝试下线，应该从IGN数据中恢复位置
        handlePlayerRemove('player1');

        const state = useServerStore.getState();
        expect(state.servers.survival.players).toBe(5); // 应该正确减少
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('从IGN数据找到'));

        consoleLogSpy.mockRestore();
      });

      it('应该从服务器IGN列表中恢复位置记录', () => {
        const { handlePlayerRemove } = useServerStore.getState();
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        // 直接添加IGN数据到serverPlayerIgns（模拟复杂的数据状态）
        const playerIgnInfo = {
          uuid: 'player1',
          ign: 'TestPlayer',
          serverId: 'survival',
          joinTime: new Date(),
          lastSeen: new Date(),
        };

        useServerStore.setState(state => ({
          ...state,
          serverPlayerIgns: {
            ...state.serverPlayerIgns,
            survival: [playerIgnInfo],
          },
          // 不在playerIgns中记录，只在serverPlayerIgns中
        }));

        // 尝试下线，应该从serverPlayerIgns中找到位置
        handlePlayerRemove('player1');

        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('从服务器IGN列表找到'));

        consoleLogSpy.mockRestore();
      });

      it('应该处理完全找不到位置的情况', () => {
        const { handlePlayerRemove } = useServerStore.getState();
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        // 尝试移除一个从未存在的玩家
        handlePlayerRemove('ghost-player');

        expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('无法确定其位置'));
        // 第6次调用包含诊断信息
        expect(consoleWarnSpy).toHaveBeenNthCalledWith(
          6,
          expect.stringContaining('当前状态诊断:'),
          expect.any(Object)
        );

        consoleWarnSpy.mockRestore();
      });

      it('应该修复不一致的位置记录', () => {
        const { handlePlayerRemove } = useServerStore.getState();
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        // 创建不一致的状态：IGN数据存在但位置记录缺失
        const playerIgnInfo = {
          uuid: 'player1',
          ign: 'TestPlayer',
          serverId: 'survival',
          joinTime: new Date(),
          lastSeen: new Date(),
        };

        useServerStore.setState(state => ({
          ...state,
          playerIgns: { player1: playerIgnInfo },
          // playersLocation 为空，模拟不一致状态
        }));

        // 下线时应该修复位置记录
        handlePlayerRemove('player1');

        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('已修复玩家'));

        consoleLogSpy.mockRestore();
      });

      it('应该处理移动时的位置记录不一致', () => {
        const { handlePlayerAdd, handlePlayerMove } = useServerStore.getState();
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const handlePlayerMoveSpy = vi.spyOn(useServerStore.getState(), 'handlePlayerMove');

        // 玩家上线到survival
        handlePlayerAdd('player1', 'survival');

        // 手动修改位置记录，模拟不一致状态
        useServerStore.setState(state => ({
          ...state,
          playersLocation: { player1: 'creative' }, // 实际在creative
        }));

        // 尝试从survival移动到lobby1，应该检测到不一致并修正
        handlePlayerMove('player1', 'survival', 'lobby1');

        expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('位置记录不一致'));
        expect(handlePlayerMoveSpy).toHaveBeenCalledWith('player1', 'creative', 'lobby1');

        consoleWarnSpy.mockRestore();
        handlePlayerMoveSpy.mockRestore();
      });
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
