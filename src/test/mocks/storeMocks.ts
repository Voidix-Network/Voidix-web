/**
 * Store Mock配置
 * 为测试环境提供统一的store mock
 */

import type { AggregateStats, ConnectionStatus, PlayerIgnInfo, ServerInfo } from '@/types';
import { vi } from 'vitest';

// 默认的mock状态
const defaultMockState = {
  // 连接状态
  connectionStatus: 'disconnected' as ConnectionStatus,
  lastUpdateTime: null as Date | null,
  isMaintenance: false,
  maintenanceStartTime: null as string | null,
  forceShowMaintenance: false,

  // 服务器数据
  servers: {} as Record<string, ServerInfo>,
  aggregateStats: {
    totalPlayers: 0,
    onlineServers: 0,
    totalUptime: 0,
  } as AggregateStats,

  // 玩家位置跟踪
  playersLocation: {} as Record<string, string>,

  // 玩家IGN数据
  playerIgns: {} as Record<string, PlayerIgnInfo>,
  serverPlayerIgns: {} as Record<string, PlayerIgnInfo[]>,

  // 运行时间
  runningTime: null as number | null,
  totalRunningTime: null as number | null,
  initialRunningTimeSeconds: null as number | null,
  initialTotalRunningTimeSeconds: null as number | null,
  lastUptimeUpdateTimestamp: null as number | null,
};

// 创建mock函数
export const createMockServerStoreCompat = (overrides: Partial<typeof defaultMockState> = {}) => {
  const state = { ...defaultMockState, ...overrides };

  return {
    ...state,

    // 操作方法 - 连接状态
    updateConnectionStatus: vi.fn((status: ConnectionStatus) => {
      state.connectionStatus = status;
      state.lastUpdateTime = new Date();
    }),
    updateMaintenanceStatus: vi.fn(
      (maintenance: boolean, startTime?: string | null, force?: boolean) => {
        state.isMaintenance = force ? true : maintenance;
        state.maintenanceStartTime = startTime || null;
        state.forceShowMaintenance = force || false;
        state.lastUpdateTime = new Date();
      }
    ),

    // 操作方法 - 服务器数据
    updateServer: vi.fn((serverId: string, updates: Partial<ServerInfo>) => {
      if (!state.servers[serverId]) {
        state.servers[serverId] = {
          id: serverId,
          name: serverId,
          displayName: serverId,
          address: `${serverId}.voidix.net`,
          status: 'offline',
          players: 0,
          maxPlayers: 100,
          uptime: 0,
          totalUptime: 0,
          lastUpdate: new Date(),
          isOnline: false,
        };
      }
      Object.assign(state.servers[serverId], updates);
      state.lastUpdateTime = new Date();
    }),
    updateServerFromData: vi.fn(),
    updateMultipleServers: vi.fn(),
    updateTotalPlayers: vi.fn((total: string | number) => {
      state.aggregateStats.totalPlayers = typeof total === 'string' ? parseInt(total) : total;
      state.lastUpdateTime = new Date();
    }),
    calculateAggregateStats: vi.fn(),
    getMinigameAggregateStats: vi.fn(() => ({ totalPlayers: 0, onlineServers: 0 })),

    // 操作方法 - 玩家跟踪
    handlePlayerAdd: vi.fn((playerId: string, serverId: string) => {
      state.playersLocation[playerId] = serverId;
      if (state.servers[serverId]) {
        state.servers[serverId].players = (state.servers[serverId].players || 0) + 1;
      }
    }),
    handlePlayerRemove: vi.fn((playerId: string) => {
      const serverId = state.playersLocation[playerId];
      if (serverId && state.servers[serverId]) {
        state.servers[serverId].players = Math.max(0, (state.servers[serverId].players || 1) - 1);
      }
      delete state.playersLocation[playerId];
      delete state.playerIgns[playerId];
    }),
    handlePlayerMove: vi.fn((playerId: string, fromServer: string, toServer: string) => {
      // 从原服务器移除
      if (state.servers[fromServer]) {
        state.servers[fromServer].players = Math.max(
          0,
          (state.servers[fromServer].players || 1) - 1
        );
      }
      // 添加到新服务器
      if (state.servers[toServer]) {
        state.servers[toServer].players = (state.servers[toServer].players || 0) + 1;
      }
      state.playersLocation[playerId] = toServer;
    }),

    // 操作方法 - IGN管理
    addPlayerIgn: vi.fn((playerId: string, ign: string, serverId: string) => {
      state.playerIgns[playerId] = {
        uuid: playerId,
        ign,
        serverId,
        joinTime: new Date(),
        lastSeen: new Date(),
      };
    }),
    removePlayerIgn: vi.fn((playerId: string) => {
      delete state.playerIgns[playerId];
    }),
    updatePlayerIgn: vi.fn(),
    getServerPlayerIgns: vi.fn((serverId: string) => {
      return Object.values(state.playerIgns).filter(player => player.serverId === serverId);
    }),
    getAllPlayerIgns: vi.fn(() => Object.values(state.playerIgns)),

    // 操作方法 - 运行时间
    updateRunningTime: vi.fn((running: number, total: number) => {
      state.runningTime = running;
      state.totalRunningTime = total;
    }),
    startRealtimeUptimeTracking: vi.fn(),
    stopRealtimeUptimeTracking: vi.fn(),

    // 操作方法 - 聚合操作
    handleFullUpdate: vi.fn((data: any) => {
      if (data.servers) {
        Object.entries(data.servers).forEach(([serverId, serverData]: [string, any]) => {
          state.servers[serverId] = {
            id: serverId,
            name: serverId,
            displayName: serverId,
            address: `${serverId}.voidix.net`,
            status: serverData.isOnline ? 'online' : 'offline',
            players: serverData.online || 0,
            maxPlayers: 100,
            uptime: serverData.uptime || 0,
            totalUptime: serverData.uptime || 0,
            lastUpdate: new Date(),
            isOnline: serverData.isOnline || false,
          };
        });
      }
      if (data.players?.online) {
        state.aggregateStats.totalPlayers =
          typeof data.players.online === 'string'
            ? parseInt(data.players.online)
            : data.players.online;
      }
      if (data.runningTime !== undefined) {
        state.runningTime =
          typeof data.runningTime === 'string' ? parseInt(data.runningTime) : data.runningTime;
      }
      if (data.totalRunningTime !== undefined) {
        state.totalRunningTime =
          typeof data.totalRunningTime === 'string'
            ? parseInt(data.totalRunningTime)
            : data.totalRunningTime;
      }
      if (data.isMaintenance !== undefined) {
        state.isMaintenance = data.isMaintenance;
      }
      if (data.maintenanceStartTime !== undefined) {
        state.maintenanceStartTime = data.maintenanceStartTime;
      }
      state.lastUpdateTime = new Date();
    }),
    recalculateAfterPlayerChange: vi.fn(),
    reset: vi.fn(() => {
      Object.assign(state, defaultMockState);
      state.servers = {};
      state.playersLocation = {};
      state.playerIgns = {};
      state.serverPlayerIgns = {};
    }),
  };
};

// 默认的mock实例
export const mockServerStoreCompat = createMockServerStoreCompat();

// 简化的hook mocks
export const mockUseServerPlayerIgns = vi.fn(() => []);
export const mockUsePlayerIgnStore = vi.fn(() => ({
  getAllPlayerIgns: vi.fn(() => []),
}));

// WebSocket状态hook mock
export const mockUseWebSocketStatus = vi.fn(() => ({
  connectionStatus: 'connected' as ConnectionStatus,
  isConnected: true,
  isConnecting: false,
  isDisconnected: false,
}));

// 导出所有hooks的默认mocks
export const defaultHookMocks = {
  useServerStoreCompat: () => mockServerStoreCompat,
  useWebSocketStatus: mockUseWebSocketStatus,
  useServerPlayerIgns: mockUseServerPlayerIgns,
  usePlayerIgnStore: mockUsePlayerIgnStore,
};

// NoticeStore Mock
export const createMockNoticeStore = (overrides: any = {}) => {
  const defaultState = {
    notices: {},
    isLoading: false,
    error: null,
    lastFetchTime: Date.now(),
    currentPage: 1,
    hasMore: true,
    totalPages: 1,
    pageSize: 5,
  };

  const state = { ...defaultState, ...overrides };

  return {
    ...state,
    setNotices: vi.fn(),
    addNotice: vi.fn(),
    removeNotice: vi.fn(),
    setLoading: vi.fn(),
    setError: vi.fn(),
    updatePage: vi.fn(),
    setHasMore: vi.fn(),
    reset: vi.fn(),
    requestNotices: vi.fn(),
    handleNoticeResponse: vi.fn(),
    goToPage: vi.fn(),
    nextPage: vi.fn(),
    prevPage: vi.fn(),
    refreshCurrentPage: vi.fn(),
    debugWebSocketStatus: vi.fn(),
  };
};

export const mockNoticeStore = createMockNoticeStore();
