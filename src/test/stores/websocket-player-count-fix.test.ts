import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAggregatedStore } from '@/stores/aggregatedStore';
import { usePlayerTrackingStore } from '@/stores/playerTrackingStore';
import { usePlayerIgnStore } from '@/stores/playerIgnStore';
import { useServerDataStore } from '@/stores/serverDataStore';

// Mock子stores
vi.mock('@/stores/connectionStore', () => ({
  useConnectionStore: {
    getState: vi.fn(() => ({
      updateMaintenanceStatus: vi.fn(),
      updateLastUpdateTime: vi.fn(),
      updateConnectionStatus: vi.fn(),
      forceShowMaintenance: false,
    })),
  },
}));

vi.mock('@/stores/uptimeStore', () => ({
  useUptimeStore: {
    getState: vi.fn(() => ({
      updateRunningTime: vi.fn(),
      startRealtimeUptimeTracking: vi.fn(),
      stopRealtimeUptimeTracking: vi.fn(),
      reset: vi.fn(),
    })),
  },
}));

describe('WebSocket玩家计数重复问题修复', () => {
  beforeEach(() => {
    // 重置所有stores状态
    useAggregatedStore.getState().reset();
    usePlayerTrackingStore.getState().reset();
    usePlayerIgnStore.getState().reset();
    useServerDataStore.getState().reset();
  });

  it('应该处理IGN信息和位置跟踪，不重复计算服务器玩家数', () => {
    const aggregatedStore = useAggregatedStore.getState();
    const playerTrackingStore = usePlayerTrackingStore.getState();
    const playerIgnStore = usePlayerIgnStore.getState();

    // 模拟fullUpdate数据（包含完整的服务器和玩家信息）
    const fullUpdateData = {
      servers: {
        lobby1: {
          online: 1, // WebSocket中的实际玩家数量
          isOnline: true,
        },
      },
      players: {
        online: '1',
        currentPlayers: {
          ASKLL: {
            uuid: '614646d1-bd70-378c-ab99-6e9a4eb14f29',
            ign: 'ASKLL',
            currentServer: 'lobby1',
          },
        },
      },
      runningTime: '402381',
      totalRunningTime: '2011116',
      isMaintenance: false,
      maintenanceStartTime: null,
    };

    // 获取初始状态
    const initialPlayerTrackingCount = Object.keys(playerTrackingStore.playersLocation).length;
    const initialIgnCount = Object.keys(playerIgnStore.playerIgns).length;

    // 处理fullUpdate
    aggregatedStore.handleFullUpdate(fullUpdateData);

    // 需要获取更新后的状态
    const updatedServerDataStore = useServerDataStore.getState();
    const updatedPlayerTrackingStore = usePlayerTrackingStore.getState();
    const updatedPlayerIgnStore = usePlayerIgnStore.getState();

    // 验证服务器玩家数来源于WebSocket数据
    const server = updatedServerDataStore.servers['lobby1'];
    expect(server).toBeDefined();
    expect(server.players).toBe(1); // 应该等于WebSocket中的online数量

    // 验证玩家追踪和IGN数据被正确处理
    const finalPlayerTrackingCount = Object.keys(updatedPlayerTrackingStore.playersLocation).length;
    const finalIgnCount = Object.keys(updatedPlayerIgnStore.playerIgns).length;
    expect(finalPlayerTrackingCount).toBe(initialPlayerTrackingCount + 1);
    expect(finalIgnCount).toBe(initialIgnCount + 1);

    // 验证玩家数据的一致性
    expect(updatedPlayerTrackingStore.playersLocation['614646d1-bd70-378c-ab99-6e9a4eb14f29']).toBe(
      'lobby1'
    );
    expect(updatedPlayerIgnStore.playerIgns['614646d1-bd70-378c-ab99-6e9a4eb14f29']).toBeDefined();
    expect(updatedPlayerIgnStore.playerIgns['614646d1-bd70-378c-ab99-6e9a4eb14f29'].ign).toBe(
      'ASKLL'
    );
    expect(updatedPlayerIgnStore.playerIgns['614646d1-bd70-378c-ab99-6e9a4eb14f29'].serverId).toBe(
      'lobby1'
    );
  });

  it('应该处理重复的fullUpdate而不增加玩家计数', () => {
    const aggregatedStore = useAggregatedStore.getState();

    const fullUpdateData = {
      servers: {
        lobby1: {
          online: 1,
          isOnline: true,
        },
      },
      players: {
        online: '1',
        currentPlayers: {
          ASKLL: {
            uuid: '614646d1-bd70-378c-ab99-6e9a4eb14f29',
            ign: 'ASKLL',
            currentServer: 'lobby1',
          },
        },
      },
      runningTime: '402381',
      totalRunningTime: '2011116',
      isMaintenance: false,
      maintenanceStartTime: null,
    };

    // 第一次处理
    aggregatedStore.handleFullUpdate(fullUpdateData);
    const firstPassPlayerTrackingStore = usePlayerTrackingStore.getState();
    const firstPassTotalPlayers = Object.keys(firstPassPlayerTrackingStore.playersLocation).length;

    // 第二次处理相同数据（模拟重复消息）
    aggregatedStore.handleFullUpdate(fullUpdateData);
    const secondPassPlayerTrackingStore = usePlayerTrackingStore.getState();
    const secondPassTotalPlayers = Object.keys(
      secondPassPlayerTrackingStore.playersLocation
    ).length;

    // 断言：第二次处理不应该增加计数（playerTrackingStore会处理重复）
    expect(secondPassTotalPlayers).toBe(firstPassTotalPlayers);
  });

  it('应该正确处理多个玩家的fullUpdate', () => {
    const aggregatedStore = useAggregatedStore.getState();

    const fullUpdateData = {
      servers: {
        lobby1: {
          online: 1,
          isOnline: true,
        },
        survival: {
          online: 1,
          isOnline: true,
        },
      },
      players: {
        online: '2',
        currentPlayers: {
          ASKLL: {
            uuid: '614646d1-bd70-378c-ab99-6e9a4eb14f29',
            ign: 'ASKLL',
            currentServer: 'lobby1',
          },
          Player2: {
            uuid: '714646d1-bd70-378c-ab99-6e9a4eb14f30',
            ign: 'Player2',
            currentServer: 'survival',
          },
        },
      },
      runningTime: '402381',
      totalRunningTime: '2011116',
      isMaintenance: false,
      maintenanceStartTime: null,
    };

    // 处理fullUpdate
    aggregatedStore.handleFullUpdate(fullUpdateData);

    // 获取更新后的状态
    const updatedPlayerTrackingStore = usePlayerTrackingStore.getState();
    const updatedPlayerIgnStore = usePlayerIgnStore.getState();

    // 验证结果：专注于玩家追踪数据的一致性
    expect(Object.keys(updatedPlayerTrackingStore.playersLocation)).toHaveLength(2);
    expect(Object.keys(updatedPlayerIgnStore.playerIgns)).toHaveLength(2);

    // 验证玩家位置
    expect(updatedPlayerTrackingStore.playersLocation['614646d1-bd70-378c-ab99-6e9a4eb14f29']).toBe(
      'lobby1'
    );
    expect(updatedPlayerTrackingStore.playersLocation['714646d1-bd70-378c-ab99-6e9a4eb14f30']).toBe(
      'survival'
    );
  });

  it('应该正确处理空的currentPlayers数据', () => {
    const aggregatedStore = useAggregatedStore.getState();

    const fullUpdateData = {
      servers: {
        lobby1: {
          online: 0,
          isOnline: true,
        },
      },
      players: {
        online: '0',
        currentPlayers: {},
      },
      runningTime: '402381',
      totalRunningTime: '2011116',
      isMaintenance: false,
      maintenanceStartTime: null,
    };

    // 处理fullUpdate
    aggregatedStore.handleFullUpdate(fullUpdateData);

    // 获取更新后的状态
    const updatedPlayerTrackingStore = usePlayerTrackingStore.getState();

    // 验证没有玩家被添加
    expect(Object.keys(updatedPlayerTrackingStore.playersLocation)).toHaveLength(0);
  });
});
