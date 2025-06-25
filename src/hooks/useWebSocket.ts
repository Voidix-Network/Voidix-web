import { WebSocketService } from '@/services/websocket';
import { useServerStore } from '@/stores';
import type { ConnectionStatus } from '@/types';
import { useCallback, useEffect, useRef } from 'react';

/**
 * useWebSocket Hook配置选项
 */
interface UseWebSocketOptions {
  autoConnect?: boolean; // 是否自动连接
  onConnected?: () => void; // 连接成功回调
  onDisconnected?: (data: { code: number; reason: string }) => void; // 断开连接回调
  onError?: (error: Event) => void; // 错误回调
  onReconnecting?: (data: { attempt: number; delay: number; maxAttempts: number }) => void; // 重连回调
  onConnectionFailed?: (data: { maxAttempts: number; totalAttempts: number }) => void; // 连接失败回调
}

/**
 * useWebSocket Hook返回值
 */
interface UseWebSocketReturn {
  connectionStatus: ConnectionStatus;
  isConnected: boolean;
  reconnectAttempts: number;
  connect: () => Promise<void>;
  disconnect: () => void;
  service: InstanceType<typeof WebSocketService> | null;
}

/**
 * useWebSocket Hook
 * 将WebSocket服务与React生命周期集成
 * 提供自动连接、状态同步、错误处理等功能
 */
export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    autoConnect = true,
    onConnected,
    onDisconnected,
    onError,
    onReconnecting,
    onConnectionFailed,
  } = options;

  const serviceRef = useRef<InstanceType<typeof WebSocketService> | null>(null);

  let store;
  try {
    store = useServerStore();
  } catch (error) {
    console.error('[useWebSocket] Store获取失败:', error);
    store = null;
  }

  // 安全检查：确保store存在且包含必要方法
  if (!store) {
    console.error('[useWebSocket] Store未初始化');
    return {
      connectionStatus: 'disconnected',
      isConnected: false,
      reconnectAttempts: 0,
      connect: async () => {
        console.warn('[useWebSocket] Store未初始化，无法连接');
      },
      disconnect: () => {
        console.warn('[useWebSocket] Store未初始化，无法断开');
      },
      service: null,
    };
  }

  // 安全地获取store方法，提供默认值
  const connectionStatus = store.connectionStatus || 'disconnected';
  const updateConnectionStatus =
    store.updateConnectionStatus ||
    (() => {
      console.warn('[useWebSocket] updateConnectionStatus方法不可用');
    });
  const handleFullUpdate =
    store.handleFullUpdate ||
    (() => {
      console.warn('[useWebSocket] handleFullUpdate方法不可用');
    });
  const updateMaintenanceStatus =
    store.updateMaintenanceStatus ||
    (() => {
      console.warn('[useWebSocket] updateMaintenanceStatus方法不可用');
    });
  const updateTotalPlayers =
    store.updateTotalPlayers ||
    (() => {
      console.warn('[useWebSocket] updateTotalPlayers方法不可用');
    });
  const updateMultipleServers =
    store.updateMultipleServers ||
    (() => {
      console.warn('[useWebSocket] updateMultipleServers方法不可用');
    });
  const handlePlayerAdd =
    store.handlePlayerAdd ||
    (() => {
      console.warn('[useWebSocket] handlePlayerAdd方法不可用');
    });
  const handlePlayerRemove =
    store.handlePlayerRemove ||
    (() => {
      console.warn('[useWebSocket] handlePlayerRemove方法不可用');
    });
  const handlePlayerMove =
    store.handlePlayerMove ||
    (() => {
      console.warn('[useWebSocket] handlePlayerMove方法不可用');
    });
  const addPlayerIgn =
    store.addPlayerIgn ||
    (() => {
      console.warn('[useWebSocket] addPlayerIgn方法不可用');
    });
  const removePlayerIgn =
    store.removePlayerIgn ||
    (() => {
      console.warn('[useWebSocket] removePlayerIgn方法不可用');
    });
  const updatePlayerIgn =
    store.updatePlayerIgn ||
    (() => {
      console.warn('[useWebSocket] updatePlayerIgn方法不可用');
    });

  /**
   * 初始化WebSocket服务
   * 🔒 使用单例模式防止重复连接
   */
  const initializeService = useCallback(() => {
    if (serviceRef.current) {
      return serviceRef.current;
    }

    // 使用单例模式获取 WebSocket 服务实例
    const service = WebSocketService.getInstance();

    // 注册事件监听器
    service.on('connected', () => {
      console.log('[useWebSocket] WebSocket连接成功');
      updateConnectionStatus('connected');
      onConnected?.();
    });

    service.on('disconnected', (data: { code: number; reason: string }) => {
      console.log('[useWebSocket] WebSocket连接断开:', data);
      updateConnectionStatus('disconnected');
      onDisconnected?.(data);
    });

    service.on('error', (error: Event) => {
      console.error('[useWebSocket] WebSocket错误:', error);
      onError?.(error);
    });

    service.on('reconnecting', (data: { attempt: number; delay: number; maxAttempts: number }) => {
      console.log('[useWebSocket] WebSocket重连中...', data);
      updateConnectionStatus('reconnecting');
      onReconnecting?.(data);
    });

    service.on('connectionFailed', (data: { maxAttempts: number; totalAttempts: number }) => {
      console.log('[useWebSocket] WebSocket连接失败:', data);
      updateConnectionStatus('failed');
      onConnectionFailed?.(data);
    });

    // 注册业务消息处理器
    service.on('fullUpdate', (data: any) => {
      console.log('[useWebSocket] 收到完整状态更新:', data);
      handleFullUpdate(data);
    });

    service.on(
      'maintenanceUpdate',
      (data: {
        isMaintenance: boolean;
        maintenanceStartTime: string | null;
        forceShowMaintenance: boolean;
      }) => {
        console.log('[useWebSocket] 收到维护状态更新:', data);
        updateMaintenanceStatus(
          data.isMaintenance,
          data.maintenanceStartTime,
          data.forceShowMaintenance
        );
      }
    );
    service.on(
      'playerUpdate',
      (data: { totalOnlinePlayers: string | null; type: string; player?: any }) => {
        console.log('[useWebSocket] 收到玩家数量更新:', data);

        if (data.totalOnlinePlayers !== null) {
          // 有明确的总数，直接更新
          updateTotalPlayers(data.totalOnlinePlayers);
        } else {
          // 没有总数，触发重新计算（通过更新聚合统计）
          console.log('[useWebSocket] 玩家数量变化，重新计算聚合统计');
          // 这里可以考虑添加一个专门的重新计算方法
        }
      }
    );
    service.on('serverUpdate', (data: { servers: Record<string, any> }) => {
      console.log('[useWebSocket] 收到服务器状态更新:', data);
      updateMultipleServers(data.servers);
    }); // 玩家跟踪事件监听器
    service.on(
      'playerAdd',
      (data: {
        playerId: string;
        serverId: string;
        playerInfo: any;
        player?: { uuid: string; username?: string; ign?: string };
      }) => {
        console.log('[useWebSocket] 玩家上线 - 完整数据:', JSON.stringify(data, null, 2));
        console.log('[useWebSocket] 玩家上线 - 数据字段检查:', {
          hasPlayer: !!data.player,
          hasUuid: data.player?.uuid,
          hasUsername: data.player?.username,
          hasIgn: data.player?.ign,
          playerId: data.playerId,
          serverId: data.serverId,
          playerInfoKeys: data.playerInfo ? Object.keys(data.playerInfo) : 'undefined',
          playerKeys: data.player ? Object.keys(data.player) : 'undefined',
        });

        // 处理基础的玩家位置追踪
        handlePlayerAdd(data.playerId, data.serverId); // 处理IGN数据 - 优先从playerInfo获取，fallback到player字段
        const playerData = data.playerInfo || data.player;
        if (playerData && playerData.uuid) {
          const ign = playerData.ign || playerData.username || data.playerId;
          console.log('[useWebSocket] 保存玩家IGN数据:', {
            uuid: playerData.uuid,
            ign: ign,
            serverId: data.serverId,
          });
          addPlayerIgn(playerData.uuid, ign, data.serverId);
        } else {
          console.warn('[useWebSocket] 玩家上线事件缺少必要字段，无法保存IGN数据:', {
            missingPlayerInfo: !data.playerInfo,
            missingPlayer: !data.player,
            missingUuid: !playerData?.uuid,
            availableData: data,
          });
        }
      }
    );
    service.on(
      'playerRemove',
      (data: { playerId: string; playerInfo: any; player?: { uuid: string } }) => {
        console.log('[useWebSocket] 玩家下线 - 完整数据:', JSON.stringify(data, null, 2));
        console.log('[useWebSocket] 玩家下线 - 数据字段检查:', {
          hasPlayer: !!data.player,
          hasUuid: data.player?.uuid,
          playerId: data.playerId,
          playerInfoKeys: data.playerInfo ? Object.keys(data.playerInfo) : 'undefined',
          playerKeys: data.player ? Object.keys(data.player) : 'undefined',
        });

        // 处理基础的玩家位置追踪
        handlePlayerRemove(data.playerId); // 移除IGN数据 - 优先从playerInfo获取，fallback到player字段
        const playerData = data.playerInfo || data.player;
        if (playerData && playerData.uuid) {
          console.log('[useWebSocket] 移除玩家IGN数据:', playerData.uuid);
          removePlayerIgn(playerData.uuid);
        } else {
          console.warn('[useWebSocket] 玩家下线事件缺少uuid字段，无法移除IGN数据:', {
            missingPlayerInfo: !data.playerInfo,
            missingPlayer: !data.player,
            missingUuid: !playerData?.uuid,
            availableData: data,
          });
        }
      }
    );
    service.on(
      'playerMove',
      (data: {
        playerId: string;
        fromServer: string;
        toServer: string;
        playerInfo: any;
        player?: { uuid: string };
      }) => {
        console.log('[useWebSocket] 玩家移动 - 完整数据:', JSON.stringify(data, null, 2));
        console.log('[useWebSocket] 玩家移动 - 数据字段检查:', {
          hasPlayer: !!data.player,
          hasUuid: data.player?.uuid,
          playerId: data.playerId,
          fromServer: data.fromServer,
          toServer: data.toServer,
          playerInfoKeys: data.playerInfo ? Object.keys(data.playerInfo) : 'undefined',
          playerKeys: data.player ? Object.keys(data.player) : 'undefined',
        });

        // 处理基础的玩家位置追踪
        handlePlayerMove(data.playerId, data.fromServer, data.toServer); // 更新IGN数据中的服务器位置 - 优先从playerInfo获取，fallback到player字段
        const playerData = data.playerInfo || data.player;
        if (playerData && playerData.uuid) {
          console.log('[useWebSocket] 更新玩家IGN服务器位置:', {
            uuid: playerData.uuid,
            fromServer: data.fromServer,
            toServer: data.toServer,
          });
          updatePlayerIgn(playerData.uuid, { serverId: data.toServer });
        } else {
          console.warn('[useWebSocket] 玩家移动事件缺少uuid字段，无法更新IGN数据:', {
            missingPlayerInfo: !data.playerInfo,
            missingPlayer: !data.player,
            missingUuid: !playerData?.uuid,
            availableData: data,
          });
        }
      }
    );

    serviceRef.current = service;
    return service;
  }, [
    updateConnectionStatus,
    handleFullUpdate,
    updateMaintenanceStatus,
    updateTotalPlayers,
    updateMultipleServers,
    handlePlayerAdd,
    handlePlayerRemove,
    handlePlayerMove,
    addPlayerIgn,
    removePlayerIgn,
    updatePlayerIgn,
    onConnected,
    onDisconnected,
    onError,
    onReconnecting,
    onConnectionFailed,
  ]);   /**
   * 连接WebSocket
   */
  const connect = useCallback(async () => {
    // 🚀 预渲染模式检测：跳过WebSocket连接
    if (typeof window !== 'undefined' && window.PRERENDER_MODE) {
      console.log('[useWebSocket] 预渲染模式，跳过WebSocket连接');
      return;
    }

    try {
      const service = initializeService();
      updateConnectionStatus('reconnecting'); // 设置为重连中状态（表示连接中）
      await service.connect();
    } catch (error) {
      console.error('[useWebSocket] 连接失败:', error);
      updateConnectionStatus('failed');
      throw error;
    }
  }, [initializeService, updateConnectionStatus]);

  /**
   * 断开WebSocket连接
   */
  const disconnect = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.disconnect();
    }
    updateConnectionStatus('disconnected');
  }, [updateConnectionStatus]);   /**
   * 组件挂载时的副作用
   */
  useEffect(() => {
    let isCleanedUp = false;

    // 🚀 预渲染模式检测：跳过自动连接
    if (typeof window !== 'undefined' && window.PRERENDER_MODE) {
      console.log('[useWebSocket] 预渲染模式，跳过自动连接');
      return;
    }

    if (autoConnect) {
      // 添加小延迟以避免React Strict Mode的快速重连
      const timeoutId = setTimeout(() => {
        if (!isCleanedUp) {
          connect().catch(error => {
            console.error('[useWebSocket] 自动连接失败:', error);
          });
        }
      }, 100);

      // 清理函数
      return () => {
        isCleanedUp = true;
        clearTimeout(timeoutId);

        // 🔒 使用单例模式时，只断开连接，不清理服务实例
        // 这样可以避免React.StrictMode下的重复创建问题
        if (serviceRef.current) {
          serviceRef.current.disconnect();
          // 注意：不设置 serviceRef.current = null，保持对单例的引用
        }
        // 重置状态但保留数据
        // reset();
      };
    }

    // 只有手动连接模式才需要清理
    return () => {
      if (serviceRef.current) {
        serviceRef.current.disconnect();
        // 🔒 使用单例模式时，保持对单例的引用
        // serviceRef.current = null;
      }
    };
  }, [autoConnect]); // 移除connect依赖，避免重复连接

  /**
   * 页面可见性变化处理
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // 页面隐藏时不主动断开连接，让WebSocket自然处理
        console.log('[useWebSocket] 页面隐藏');
      } else {
        // 页面可见时检查连接状态
        console.log('[useWebSocket] 页面可见');
        if (serviceRef.current && !serviceRef.current.isConnected) {
          console.log('[useWebSocket] 页面可见时发现连接断开，尝试重连');
          connect().catch(error => {
            console.error('[useWebSocket] 页面可见时重连失败:', error);
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [connect]);

  // 监听协议版本错误
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleProtocolVersionError = (event: CustomEvent) => {
      const { message } = event.detail;

      console.error('[useWebSocket] 协议版本错误:', event.detail);

      // 设置错误状态
      updateConnectionStatus('disconnected');

      // 可以选择显示alert或toast通知
      if (window.confirm(`${message}\n\n是否刷新页面？`)) {
        window.location.reload();
      }
    };

    window.addEventListener('protocolVersionError', handleProtocolVersionError as EventListener);

    return () => {
      window.removeEventListener(
        'protocolVersionError',
        handleProtocolVersionError as EventListener
      );
    };
  }, [updateConnectionStatus]);

  return {
    connectionStatus,
    isConnected: serviceRef.current?.isConnected ?? false,
    reconnectAttempts: serviceRef.current?.currentReconnectAttempts ?? 0,
    connect,
    disconnect,
    service: serviceRef.current,
  };
}

/**
 * 简化的WebSocket状态Hook
 * 只返回连接状态，不处理连接逻辑
 */
export function useWebSocketStatus() {
  let store;
  try {
    store = useServerStore();
  } catch (error) {
    console.error('[useWebSocketStatus] Store获取失败:', error);
    store = null;
  }

  // 安全检查：确保store存在
  if (!store) {
    console.error('[useWebSocketStatus] Store未初始化');
    return {
      connectionStatus: 'disconnected' as ConnectionStatus,
      servers: {},
      aggregateStats: { totalPlayers: 0, onlineServers: 0, totalUptime: 0 },
      isMaintenance: false,
      runningTime: 0,
      totalRunningTime: 0,
    };
  }

  return {
    connectionStatus: store.connectionStatus || 'disconnected',
    servers: store.servers || {},
    aggregateStats: store.aggregateStats || { totalPlayers: 0, onlineServers: 0, totalUptime: 0 },
    isMaintenance: store.isMaintenance || false,
    runningTime: store.runningTime || 0,
    totalRunningTime: store.totalRunningTime || 0,
  };
}
