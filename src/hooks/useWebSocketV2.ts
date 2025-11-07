import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const WS_URL = 'wss://api.voidix.top:10203';
const RECONNECT_DELAY = 3000;
const META_UPDATE_INTERVAL = 30000;

interface ServerInfo {
  name: string;
  online: boolean;
  players_count: number;
  players?: Array<{ name: string; uuid: string }>;
  ping?: {
    version: string;
    protocol: number;
    players: { online: number; max: number };
  };
  error?: string;
}

interface ServerTreeNode {
  id: string;
  name: string;
  type: 'root' | 'category' | 'server';
  children?: ServerTreeNode[];
}

interface AggregateStats {
  totalPlayers: number;
  onlineServers: number;
  totalServers: number;
}

interface RuntimeInfo {
  current_uptime_seconds: number;
  current_uptime_formatted: string;
  total_uptime_seconds: number;
  total_uptime_formatted: string;
}

interface PlayerEventData {
  name: string;
  uuid: string;
  last_server?: string;
  new_server?: string;
}

type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'failed';

interface ProxyStats {
  total_players: number;
  max_players: number;
  total_servers: number;
  servers_with_players: number;
  players_on_servers: number;
}

interface WebSocketContextType {
  connectionStatus: ConnectionStatus;
  servers: Record<string, ServerInfo>;
  serverTree: ServerTreeNode | null;
  aggregateStats: AggregateStats;
  runtimeInfo: RuntimeInfo | null;
  proxyStats: ProxyStats | null;
  isMaintenance: boolean;
  runningTime: number | null;
  totalRunningTime: number | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [servers, setServers] = useState<Record<string, ServerInfo>>({});
  const [serverTree, setServerTree] = useState<ServerTreeNode | null>(null);
  const [aggregateStats, setAggregateStats] = useState<AggregateStats>({
    totalPlayers: 0,
    onlineServers: 0,
    totalServers: 0,
  });
  const [runtimeInfo, setRuntimeInfo] = useState<RuntimeInfo | null>(null);
  const [proxyStats, setProxyStats] = useState<ProxyStats | null>(null); // 移动到组件内部
  const [isMaintenance, setIsMaintenance] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const metaUpdateIntervalRef = useRef<NodeJS.Timeout>();
  const echoCounterRef = useRef(0);
  const reconnectAttemptsRef = useRef(0);

  const generateEcho = () => `echo_${Date.now()}_${echoCounterRef.current++}`;

  const sendMessage = useCallback((type: string, data: any = {}) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = {
        type,
        echo: generateEcho(),
        ...data,
      };
      console.log('发送消息:', message);
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const updateServerPlayers = useCallback((serverName: string, player: { name: string; uuid: string }, action: 'add' | 'remove') => {
    setServers(prev => {
      const updated = { ...prev };
      const server = updated[serverName];

      if (!server) return prev;

      const currentPlayers = server.players || [];
      let newPlayers: Array<{ name: string; uuid: string }>;
      let newCount: number;

      if (action === 'add') {
        if (currentPlayers.some(p => p.uuid === player.uuid)) {
          return prev;
        }
        newPlayers = [...currentPlayers, player];
        newCount = (server.players_count || 0) + 1;
      } else {
        newPlayers = currentPlayers.filter(p => p.uuid !== player.uuid);
        newCount = Math.max(0, (server.players_count || 0) - 1);
      }

      updated[serverName] = {
        ...server,
        players: newPlayers,
        players_count: newCount,
      };

      return updated;
    });
  }, []);

  const calculateAggregateStats = useCallback((serversData: Record<string, ServerInfo>) => {
    const serverList = Object.values(serversData);
    const totalPlayers = serverList.reduce((sum, s) => sum + (s.players_count || 0), 0);
    const onlineServers = serverList.filter(s => s.online).length;
    const totalServers = serverList.length;

    setAggregateStats({ totalPlayers, onlineServers, totalServers });
  }, []);

  const handleServerStatusResponse = useCallback((data: any) => {
    if (data.servers) {
      const serversMap: Record<string, ServerInfo> = {};
      data.servers.forEach((server: any) => {
        serversMap[server.name] = {
          name: server.name,
          online: server.online ?? false,
          players_count: server.players_count ?? 0,
          players: server.players,
          ping: server.ping,
          error: server.error,
        };
      });
      setServers(serversMap);
      calculateAggregateStats(serversMap);
    }
  }, [calculateAggregateStats]);

  const handleServerTreeResponse = useCallback((data: any) => {
    if (data.data) {
      setServerTree(data.data);
    }
  }, []);

  const handleMetaInfoResponse = useCallback((data: any) => {
    if (data.runtime) {
      setRuntimeInfo(data.runtime);
    }
    if (data.proxy) {
      setProxyStats(data.proxy);
      setAggregateStats(prev => ({
        ...prev,
        totalPlayers: data.proxy.total_players || prev.totalPlayers,
      }));
    }
  }, []);

  const handlePlayerEvent = useCallback((eventType: string, data: PlayerEventData) => {
    const { name, uuid, last_server, new_server } = data;
    const player = { name, uuid };

    console.log(`处理事件: ${eventType}`, data);

    switch (eventType) {
      case 'player_join':
        console.log(`Player ${name} joined the network`);
        break;

      case 'player_quit':
        setServers(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(serverName => {
            const server = updated[serverName];
            const currentPlayers = server.players || [];
            const playerIndex = currentPlayers.findIndex(p => p.uuid === uuid);

            if (playerIndex !== -1) {
              updated[serverName] = {
                ...server,
                players: currentPlayers.filter(p => p.uuid !== uuid),
                players_count: Math.max(0, (server.players_count || 0) - 1),
              };
            }
          });
          return updated;
        });
        break;

      case 'player_switch_server':
        if (last_server) {
          updateServerPlayers(last_server, player, 'remove');
        }
        if (new_server) {
          updateServerPlayers(new_server, player, 'add');
        }
        break;

      default:
        console.warn('Unknown player event type:', eventType);
    }

    setServers(prev => {
      calculateAggregateStats(prev);
      return prev;
    });
  }, [updateServerPlayers, calculateAggregateStats]);

  const handleEventCall = useCallback((data: any) => {
    const { event_id, event_data } = data;

    console.log(`收到事件调用: ${event_id}`, event_data);

    switch (event_id) {
      case 'player_join':
      case 'player_quit':
      case 'player_switch_server':
        handlePlayerEvent(event_id, event_data);
        break;
      case 'maintenance_mode':
        setIsMaintenance(event_data.enabled ?? false);
        break;
      default:
        console.log('Unknown event_id in event_call:', event_id);
    }
  }, [handlePlayerEvent]);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data);
      const { type, ...data } = message;

      console.log('收到 WebSocket 消息:', type, data);

      switch (type) {
        case 'server_status_response':
          handleServerStatusResponse(data);
          break;
        case 'get_server_tree_response':
          handleServerTreeResponse(data);
          break;
        case 'meta_info_response':
          handleMetaInfoResponse(data);
          break;
        case 'event_call':
          handleEventCall(data);
          break;
        default:
          console.log('Unknown message type:', type);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }, [
    handleServerStatusResponse,
    handleServerTreeResponse,
    handleMetaInfoResponse,
    handlePlayerEvent,
    handleEventCall
  ]);

  const startMetaUpdate = useCallback(() => {
    if (metaUpdateIntervalRef.current) {
      clearInterval(metaUpdateIntervalRef.current);
    }
    metaUpdateIntervalRef.current = setInterval(() => {
      sendMessage('get_meta_info', {
        action: 'get_all',
        include_runtime: true,
        include_proxy_stats: true, // 改为 true 以获取代理统计
      });
    }, META_UPDATE_INTERVAL);
  }, [sendMessage]);

  const stopMetaUpdate = useCallback(() => {
    if (metaUpdateIntervalRef.current) {
      clearInterval(metaUpdateIntervalRef.current);
      metaUpdateIntervalRef.current = undefined;
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;

        startMetaUpdate();

        sendMessage('get_server_tree');
        sendMessage('get_server_status', {
          action: 'get_all',
          use_cache: false,
          include_players: true,
          include_ping: true,
        });
        sendMessage('get_meta_info', {
          action: 'get_all',
          include_runtime: true,
          include_proxy_stats: true,
        });

        sendMessage('subscribe_event', {
          action: 'batch_subscribe',
          event_ids: ['player_join', 'player_quit', 'player_switch_server'],
        });
      };

      ws.onmessage = handleMessage;

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('failed');
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        stopMetaUpdate();

        if (connectionStatus !== 'failed') {
          setConnectionStatus('reconnecting');
          reconnectAttemptsRef.current++;

          const delay = Math.min(RECONNECT_DELAY * reconnectAttemptsRef.current, 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          setConnectionStatus('disconnected');
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setConnectionStatus('failed');
    }
  }, [connectionStatus, sendMessage, handleMessage, startMetaUpdate, stopMetaUpdate]);

  useEffect(() => {
    connect();

    return () => {
      stopMetaUpdate();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  const value: WebSocketContextType = {
    connectionStatus,
    servers,
    serverTree,
    aggregateStats,
    runtimeInfo,
    proxyStats,
    isMaintenance,
    runningTime: runtimeInfo?.current_uptime_seconds ?? null,
    totalRunningTime: runtimeInfo?.total_uptime_seconds ?? null,
  };

  return React.createElement(
    WebSocketContext.Provider,
    { value },
    children
  );
};

export const useWebSocketV2 = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketV2 must be used within a WebSocketProvider');
  }
  return context;
};

// 保持向后兼容
export const useWebSocket = useWebSocketV2;
