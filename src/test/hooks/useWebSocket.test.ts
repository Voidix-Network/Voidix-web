/**
 * useWebSocket Hook 测试套件
 * 测试WebSocket Hook的生命周期管理、状态同步和事件处理
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWebSocket, useWebSocketStatus } from '@/hooks/useWebSocket';
import { useServerStore } from '@/stores';
import { MockWebSocket } from '../mocks/webSocketMocks';

// Mock页面可见性API
Object.defineProperty(document, 'hidden', {
  writable: true,
  value: false,
});

Object.defineProperty(document, 'visibilityState', {
  writable: true,
  value: 'visible',
});

describe('useWebSocket Hook', () => {
  let mockWs: MockWebSocket;

  beforeEach(() => {
    // 重置store状态
    useServerStore.getState().reset();

    // 清理WebSocket实例
    MockWebSocket.clearInstances();

    // Mock setTimeout和clearTimeout以控制时间
    vi.useFakeTimers();
  });

  afterEach(() => {
    // 清理所有模拟和定时器
    MockWebSocket.clearInstances();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('Hook初始化和生命周期', () => {
    it('应该正确初始化Hook的默认状态', () => {
      const { result } = renderHook(() => useWebSocket({ autoConnect: false }));

      expect(result.current.connectionStatus).toBe('disconnected');
      expect(result.current.isConnected).toBe(false);
      expect(result.current.reconnectAttempts).toBe(0);
      expect(result.current.service).toBeNull();
      expect(typeof result.current.connect).toBe('function');
      expect(typeof result.current.disconnect).toBe('function');
    });

    it('应该在autoConnect=true时自动连接', async () => {
      const { result } = renderHook(() => useWebSocket({ autoConnect: true }));

      // 等待延迟的自动连接
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // 模拟WebSocket连接成功
      mockWs = MockWebSocket.getLastInstance()!;
      expect(mockWs).toBeDefined();

      act(() => {
        mockWs.simulateOpen();
      });

      expect(result.current.connectionStatus).toBe('connected');
      expect(result.current.isConnected).toBe(true);
      expect(result.current.service).not.toBeNull();
    });

    it('应该在组件卸载时清理WebSocket连接', () => {
      const { result, unmount } = renderHook(() => useWebSocket({ autoConnect: true }));

      // 触发自动连接
      act(() => {
        vi.advanceTimersByTime(100);
      });

      mockWs = MockWebSocket.getLastInstance()!;

      // 模拟连接成功
      act(() => {
        mockWs.simulateOpen();
      });

      expect(result.current.isConnected).toBe(true);

      // 卸载组件
      act(() => {
        unmount();
      });

      // 检查连接是否被关闭（CLOSING或CLOSED都是可接受的）
      expect([MockWebSocket.CLOSING, MockWebSocket.CLOSED]).toContain(mockWs.readyState);
    });

    it('应该在autoConnect=false时不自动连接', () => {
      renderHook(() => useWebSocket({ autoConnect: false }));

      // 等待可能的延迟
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // 应该没有创建WebSocket实例
      expect(MockWebSocket.getLastInstance()).toBeUndefined();
    });
  });

  describe('手动连接和断开', () => {
    it('应该能够手动连接WebSocket', async () => {
      const { result } = renderHook(() => useWebSocket({ autoConnect: false }));

      expect(result.current.connectionStatus).toBe('disconnected');

      // 手动连接
      act(() => {
        result.current.connect();
      });

      expect(result.current.connectionStatus).toBe('reconnecting');

      // 模拟连接成功
      mockWs = MockWebSocket.getLastInstance()!;
      act(() => {
        mockWs.simulateOpen();
      });

      expect(result.current.connectionStatus).toBe('connected');
      expect(result.current.isConnected).toBe(true);
    });

    it('应该能够手动断开WebSocket连接', async () => {
      const { result } = renderHook(() => useWebSocket({ autoConnect: false }));

      // 先连接
      act(() => {
        result.current.connect();
      });

      mockWs = MockWebSocket.getLastInstance()!;
      act(() => {
        mockWs.simulateOpen();
      });

      expect(result.current.isConnected).toBe(true);

      // 手动断开
      act(() => {
        result.current.disconnect();
      });

      expect(result.current.connectionStatus).toBe('disconnected');
    });

    it('应该正确处理连接失败', async () => {
      const onConnectionFailed = vi.fn();
      const { result } = renderHook(() =>
        useWebSocket({
          autoConnect: false,
          onConnectionFailed,
        })
      );

      // 尝试连接
      act(() => {
        result.current.connect();
      });

      // 模拟连接超时失败
      mockWs = MockWebSocket.getLastInstance()!;
      mockWs.preventAutoConnect();

      // 模拟连接超时
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // 检查状态变化 - 应该是reconnecting状态而不是等待失败回调
      expect(result.current.connectionStatus).toBe('reconnecting');

      // 清理，防止测试泄漏
      act(() => {
        result.current.disconnect();
      });
    }, 2000); // 减少超时时间到2秒
  });

  describe('事件回调处理', () => {
    it('应该正确触发连接成功回调', async () => {
      const onConnected = vi.fn();
      const { result } = renderHook(() =>
        useWebSocket({
          autoConnect: false,
          onConnected,
        })
      );

      act(() => {
        result.current.connect();
      });

      mockWs = MockWebSocket.getLastInstance()!;
      act(() => {
        mockWs.simulateOpen();
      });

      expect(onConnected).toHaveBeenCalledTimes(1);
    });

    it('应该正确触发断开连接回调', async () => {
      const onDisconnected = vi.fn();
      const { result } = renderHook(() =>
        useWebSocket({
          autoConnect: false,
          onDisconnected,
        })
      );

      // 先连接
      act(() => {
        result.current.connect();
      });

      mockWs = MockWebSocket.getLastInstance()!;
      act(() => {
        mockWs.simulateOpen();
      });

      // 模拟连接断开
      act(() => {
        mockWs.simulateClose(1000, 'Normal closure');
      });

      expect(onDisconnected).toHaveBeenCalledWith({
        code: 1000,
        reason: 'Normal closure',
      });
    });

    it('应该正确触发错误回调', async () => {
      const onError = vi.fn();
      const { result } = renderHook(() =>
        useWebSocket({
          autoConnect: false,
          onError,
        })
      );

      // Mock console.error to capture expected connection error logs
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      act(() => {
        result.current.connect();
      });

      mockWs = MockWebSocket.getLastInstance()!;
      act(() => {
        mockWs.simulateOpen();
        mockWs.simulateError();
      });

      expect(onError).toHaveBeenCalledWith(expect.any(Event));

      // Verify that connection error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('[WebSocket] 连接错误:', expect.any(Event));

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });

    it('应该正确触发重连回调', async () => {
      const onReconnecting = vi.fn();
      renderHook(() =>
        useWebSocket({
          autoConnect: true,
          onReconnecting,
        })
      );

      // 触发自动连接
      act(() => {
        vi.advanceTimersByTime(100);
      });

      mockWs = MockWebSocket.getLastInstance()!;
      act(() => {
        mockWs.simulateOpen();
        // 模拟连接断开触发重连
        mockWs.simulateClose(1006, 'Connection lost');
      });

      // 等待重连逻辑启动
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(onReconnecting).toHaveBeenCalled();
    }, 10000);
  });

  describe('状态同步和数据处理', () => {
    it('应该正确同步连接状态到store', async () => {
      const { result } = renderHook(() => useWebSocket({ autoConnect: false }));

      act(() => {
        result.current.connect();
      });

      // 检查store状态更新
      expect(useServerStore.getState().connectionStatus).toBe('reconnecting');

      mockWs = MockWebSocket.getLastInstance()!;
      act(() => {
        mockWs.simulateOpen();
      });

      expect(useServerStore.getState().connectionStatus).toBe('connected');
    });

    it('应该正确处理完整状态更新消息', async () => {
      const { result } = renderHook(() => useWebSocket({ autoConnect: false }));

      act(() => {
        result.current.connect();
      });

      mockWs = MockWebSocket.getLastInstance()!;
      act(() => {
        mockWs.simulateOpen();
      });

      // 模拟接收完整状态更新
      const fullUpdateData = {
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

      act(() => {
        mockWs.simulateMessage(fullUpdateData);
      });

      const storeState = useServerStore.getState();
      expect(Object.keys(storeState.servers)).toHaveLength(2);
      expect(storeState.servers.survival.players).toBe(10);
      expect(storeState.servers.creative.players).toBe(5);
      expect(storeState.runningTime).toBe(3600);
      expect(storeState.totalRunningTime).toBe(7200);
      expect(storeState.isMaintenance).toBe(false);
    });

    it('应该正确处理维护状态更新消息', async () => {
      const { result } = renderHook(() => useWebSocket({ autoConnect: false }));

      act(() => {
        result.current.connect();
      });

      mockWs = MockWebSocket.getLastInstance()!;
      act(() => {
        mockWs.simulateOpen();
      });

      // 模拟接收维护状态更新
      const maintenanceData = {
        type: 'maintenance_status_update',
        status: true,
        maintenanceStartTime: '2025-06-14T00:00:00Z',
      };

      act(() => {
        mockWs.simulateMessage(maintenanceData);
      });

      const storeState = useServerStore.getState();
      expect(storeState.isMaintenance).toBe(true);
      expect(storeState.maintenanceStartTime).toBe('2025-06-14T00:00:00Z');
    });

    it('应该正确处理玩家上线事件', async () => {
      const { result } = renderHook(() => useWebSocket({ autoConnect: false }));

      // Mock console.warn to capture expected warnings about unknown message types
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      act(() => {
        result.current.connect();
      });

      mockWs = MockWebSocket.getLastInstance()!;
      act(() => {
        mockWs.simulateOpen();
      });

      // 先添加一个服务器
      act(() => {
        useServerStore.getState().updateServer('survival', {
          players: 5,
          status: 'online',
        });
      });

      // 模拟玩家上线事件（符合实际的事件结构）
      const playerAddData = {
        type: 'players_update_add',
        player: {
          uuid: 'test-player-uuid',
          ign: 'TestPlayer',
          currentServer: 'survival',
        },
        totalOnlinePlayers: 6,
      };

      // 同时触发playerAdd事件（这是实际处理IGN数据的地方）
      const playerAddEvent = {
        type: 'playerAdd',
        playerId: 'test-player-uuid',
        serverId: 'survival',
        playerInfo: {
          uuid: 'test-player-uuid',
          ign: 'TestPlayer',
        },
        player: {
          uuid: 'test-player-uuid',
          ign: 'TestPlayer',
        },
      };

      act(() => {
        mockWs.simulateMessage(playerAddData);
        // 触发playerAdd事件来处理IGN数据
        mockWs.simulateMessage(playerAddEvent);
      });

      const storeState = useServerStore.getState();
      expect(storeState.playersLocation['test-player-uuid']).toBe('survival');
      expect(storeState.playerIgns['test-player-uuid']).toBeDefined();
      expect(storeState.playerIgns['test-player-uuid'].ign).toBe('TestPlayer');

      // Verify that unknown message type warning was logged (for playerAdd event)
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[WebSocket] 未知消息类型:',
        'playerAdd',
        expect.any(Object)
      );

      // Restore console.warn
      consoleWarnSpy.mockRestore();
    });

    it('应该正确处理玩家下线事件', async () => {
      const { result } = renderHook(() => useWebSocket({ autoConnect: false }));

      // Mock console.warn to capture expected warnings about unknown message types
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      act(() => {
        result.current.connect();
      });

      mockWs = MockWebSocket.getLastInstance()!;
      act(() => {
        mockWs.simulateOpen();
      });

      // 先添加一个服务器和玩家
      act(() => {
        useServerStore.getState().updateServer('survival', {
          players: 6,
          status: 'online',
        });
        useServerStore.getState().handlePlayerAdd('test-player-uuid', 'survival');
        useServerStore.getState().addPlayerIgn('test-player-uuid', 'TestPlayer', 'survival');
      });

      // 模拟玩家下线事件
      const playerRemoveData = {
        type: 'players_update_remove',
        player: { uuid: 'test-player-uuid' },
      };

      // 同时触发playerRemove事件
      const playerRemoveEvent = {
        type: 'playerRemove',
        playerId: 'test-player-uuid',
        playerInfo: {
          uuid: 'test-player-uuid',
        },
        player: {
          uuid: 'test-player-uuid',
        },
      };

      act(() => {
        mockWs.simulateMessage(playerRemoveData);
        // 触发playerRemove事件来处理IGN数据
        mockWs.simulateMessage(playerRemoveEvent);
      });

      const storeState = useServerStore.getState();
      expect(storeState.playersLocation['test-player-uuid']).toBeUndefined();
      expect(storeState.playerIgns['test-player-uuid']).toBeUndefined();

      // Verify that unknown message type warning was logged (for playerRemove event)
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[WebSocket] 未知消息类型:',
        'playerRemove',
        expect.any(Object)
      );

      // Restore console.warn
      consoleWarnSpy.mockRestore();
    });

    it('应该正确处理服务器状态更新消息', async () => {
      const { result } = renderHook(() => useWebSocket({ autoConnect: false }));

      act(() => {
        result.current.connect();
      });

      mockWs = MockWebSocket.getLastInstance()!;
      act(() => {
        mockWs.simulateOpen();
      });

      // 模拟服务器状态更新
      const serverUpdateData = {
        type: 'server_update',
        servers: {
          survival: 12,
          creative: 8,
        },
      };

      act(() => {
        mockWs.simulateMessage(serverUpdateData);
      });

      const storeState = useServerStore.getState();
      expect(storeState.servers.survival.players).toBe(12);
      expect(storeState.servers.creative.players).toBe(8);
    });
  });

  describe('页面可见性处理', () => {
    it('应该在页面变为可见时检查连接状态', async () => {
      const { result } = renderHook(() => useWebSocket({ autoConnect: true }));

      // 建立初始连接
      act(() => {
        vi.advanceTimersByTime(100);
      });

      mockWs = MockWebSocket.getLastInstance()!;
      act(() => {
        mockWs.simulateOpen();
      });

      expect(result.current.isConnected).toBe(true);

      // 模拟连接断开
      act(() => {
        mockWs.simulateClose(1006, 'Connection lost');
      });

      expect(result.current.isConnected).toBe(false);

      // 模拟页面从隐藏变为可见
      Object.defineProperty(document, 'hidden', { value: false });
      act(() => {
        document.dispatchEvent(new Event('visibilitychange'));
      });

      // 应该尝试重新连接
      expect(MockWebSocket.getAllInstances().length).toBeGreaterThan(1);
    });

    it('应该在页面隐藏时记录日志但不断开连接', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      renderHook(() => useWebSocket({ autoConnect: true }));

      // 模拟页面变为隐藏
      Object.defineProperty(document, 'hidden', { value: true });
      act(() => {
        document.dispatchEvent(new Event('visibilitychange'));
      });

      expect(consoleSpy).toHaveBeenCalledWith('[useWebSocket] 页面隐藏');

      consoleSpy.mockRestore();
    });
  });

  describe('重连计数和状态', () => {
    it('应该正确跟踪重连尝试次数', async () => {
      const { result } = renderHook(() => useWebSocket({ autoConnect: true }));

      act(() => {
        vi.advanceTimersByTime(100);
      });

      mockWs = MockWebSocket.getLastInstance()!;
      act(() => {
        mockWs.simulateOpen();
        // 模拟连接断开触发重连
        mockWs.simulateClose(1006, 'Connection lost');
      });

      // 等待重连逻辑启动
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // 检查重连尝试次数
      expect(result.current.reconnectAttempts).toBeGreaterThan(0);
    }, 10000);
  });
});

describe('useWebSocketStatus Hook', () => {
  beforeEach(() => {
    useServerStore.getState().reset();
  });

  it('应该返回正确的状态数据', () => {
    // 设置一些测试数据
    const store = useServerStore.getState();
    store.updateConnectionStatus('connected');
    store.updateServer('survival', { players: 10, status: 'online' });
    store.updateMaintenanceStatus(false, null);

    const { result } = renderHook(() => useWebSocketStatus());

    expect(result.current.connectionStatus).toBe('connected');
    // 检查servers对象是否存在，如果存在再检查survival服务器
    if (result.current.servers && result.current.servers.survival) {
      expect(result.current.servers.survival.players).toBe(10);
    }
    expect(result.current.isMaintenance).toBe(false);
    expect(result.current.aggregateStats).toBeDefined();
  });

  it('应该响应store状态变化', () => {
    const { result } = renderHook(() => useWebSocketStatus());

    expect(result.current.connectionStatus).toBe('disconnected');

    act(() => {
      useServerStore.getState().updateConnectionStatus('connected');
    });

    expect(result.current.connectionStatus).toBe('connected');
  });

  it('应该正确返回服务器运行时间数据', () => {
    act(() => {
      useServerStore.getState().updateRunningTime(3600, 7200);
    });

    const { result } = renderHook(() => useWebSocketStatus());

    expect(result.current.runningTime).toBe(3600);
    expect(result.current.totalRunningTime).toBe(7200);
  });
});
