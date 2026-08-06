import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const WS_URL = 'wss://api.voidix.net:10203';
const POLL_INTERVAL = 30000;
const RECONNECT_DELAY = 3000;
const REQUEST_TIMEOUT = 10000;

type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'failed';

interface PlayerEntry {
  name: string;
  uuid: string;
  server: string | null;
}

interface ServerInfo {
  name: string;
  online: boolean;
  players_count: number;
  players?: Array<{ name: string; uuid: string }>;
  version?: { name: string; protocol: number; max: number };
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
  total_uptime_seconds: number;
}

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
  runningTime: number | null;
  totalRunningTime: number | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

function collectServerIds(tree: any[]): string[] {
  const ids: string[] = [];
  const walk = (node: any) => {
    if (node.type === 'SERVER') {
      ids.push(node.id);
    } else if (node.type === 'CATEGORY' && node.children) {
      node.children.forEach(walk);
    }
  };
  tree.forEach(walk);
  return ids;
}

function normalizeTree(rawTree: any[]): ServerTreeNode {
  const walk = (node: any): ServerTreeNode => ({
    id: node.id,
    name: node.friendlyName,
    type: node.type === 'CATEGORY' ? 'category' : 'server',
    children: node.children ? node.children.map(walk) : undefined,
  });
  return {
    id: 'root',
    name: 'root',
    type: 'root',
    children: rawTree.map(walk),
  };
}

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [servers, setServers] = useState<Record<string, ServerInfo>>({});
  const [serverTree, setServerTree] = useState<ServerTreeNode | null>(null);
  const [runtimeInfo, setRuntimeInfo] = useState<RuntimeInfo | null>(null);
  const [aggregateStats, setAggregateStats] = useState<AggregateStats>({
    totalPlayers: 0,
    onlineServers: 0,
    totalServers: 0,
  });
  const [proxyStats, setProxyStats] = useState<ProxyStats | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const idCounterRef = useRef(0);
  const pendingRef = useRef<
    Map<string, { resolve: (v: any) => void; reject: (e: any) => void; timer: NodeJS.Timeout }>
  >(new Map());
  const playersRef = useRef<PlayerEntry[]>([]);
  const serverIdsRef = useRef<string[]>([]);
  const pollTimerRef = useRef<NodeJS.Timeout>();
  const reconnectTimerRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const mountedRef = useRef(true);

  const idGen = useCallback(() => `r${++idCounterRef.current}`, []);

  const sendRequest = useCallback(
    (method: string, params: any = {}): Promise<any> => {
      return new Promise((resolve, reject) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          reject(new Error('WebSocket not connected'));
          return;
        }
        const id = idGen();
        const timer = setTimeout(() => {
          pendingRef.current.delete(id);
          reject(new Error(`Request "${method}" timed out`));
        }, REQUEST_TIMEOUT);
        pendingRef.current.set(id, { resolve, reject, timer });
        wsRef.current.send(JSON.stringify({ id, method, params }));
      });
    },
    [idGen]
  );

  const calcAggregate = useCallback((serversData: Record<string, ServerInfo>) => {
    const list = Object.values(serversData);
    setAggregateStats({
      totalPlayers: list.reduce((s, sv) => s + (sv.players_count || 0), 0),
      onlineServers: list.filter(sv => sv.online).length,
      totalServers: list.length,
    });
  }, []);

  const handlePushEvent = useCallback(
    (msg: any) => {
      const { method, params } = msg;
      switch (method) {
        case 'player.join': {
          const p = params.player;
          playersRef.current = [
            ...playersRef.current,
            { name: p.name, uuid: p.uuid, server: null },
          ];
          break;
        }
        case 'player.quit': {
          const p = params.player;
          playersRef.current = playersRef.current.filter(e => e.uuid !== p.uuid);
          setServers(prev => {
            const next = { ...prev };
            for (const sid of Object.keys(next)) {
              const s = next[sid];
              if (s.players) {
                const filtered = s.players.filter(pl => pl.uuid !== p.uuid);
                if (filtered.length !== s.players.length) {
                  next[sid] = { ...s, players: filtered, players_count: filtered.length };
                }
              }
            }
            return next;
          });
          break;
        }
        case 'player.switch_server': {
          const { player, new_server, previous_server } = params;
          playersRef.current = playersRef.current.map(e =>
            e.uuid === player.uuid ? { ...e, server: new_server } : e
          );
          setServers(prev => {
            const next = { ...prev };
            if (previous_server && next[previous_server]) {
              const s = next[previous_server];
              const filtered = (s.players || []).filter(pl => pl.uuid !== player.uuid);
              next[previous_server] = { ...s, players: filtered, players_count: filtered.length };
            }
            if (new_server && next[new_server]) {
              const s = next[new_server];
              const merged = [...(s.players || []), { name: player.name, uuid: player.uuid }];
              next[new_server] = { ...s, players: merged, players_count: merged.length };
            }
            return next;
          });
          break;
        }
      }
      setServers(prev => {
        calcAggregate(prev);
        return prev;
      });
      setProxyStats(prev =>
        prev
          ? {
              ...prev,
              total_players: playersRef.current.length,
              players_on_servers: playersRef.current.filter(p => p.server !== null).length,
            }
          : prev
      );
    },
    [calcAggregate]
  );

  const refreshData = useCallback(async () => {
    try {
      const [treeResult, runtimesResult, playerListResult] = await Promise.all([
        sendRequest('server.tree', {}),
        sendRequest('proxy.running_times', {}),
        sendRequest('player.list', {}),
      ]);

      const ids = collectServerIds(treeResult);
      serverIdsRef.current = ids;

      const statusAllResult = await sendRequest('server.status_all', {});

      const normalizedTree = normalizeTree(treeResult);

      const playerList: PlayerEntry[] = (playerListResult.players || []).map((p: any) => ({
        name: p.name,
        uuid: p.uuid,
        server: p.server,
      }));
      playersRef.current = playerList;

      const serversMap: Record<string, ServerInfo> = {};
      for (const id of ids) {
        const status = statusAllResult[id];
        const serverPlayers = playerList
          .filter(p => p.server === id)
          .map(p => ({ name: p.name, uuid: p.uuid }));

        if (status) {
          serversMap[id] = {
            name: id,
            online: status.online ?? false,
            players_count: status.players?.online ?? 0,
            players: serverPlayers,
            version: status.version
              ? {
                  name: status.version.name,
                  protocol: status.version.protocol,
                  max: status.players?.max ?? 0,
                }
              : undefined,
          };
        } else {
          serversMap[id] = {
            name: id,
            online: false,
            players_count: 0,
            players: [],
          };
        }
      }

      setServerTree(normalizedTree);
      setServers(serversMap);
      calcAggregate(serversMap);

      setRuntimeInfo({
        current_uptime_seconds: runtimesResult.current_running_time,
        total_uptime_seconds: runtimesResult.total_running_time,
      });

      setProxyStats({
        total_players: playerListResult.online ?? 0,
        max_players: playerListResult.display_max ?? 0,
        total_servers: ids.length,
        servers_with_players: Object.values(statusAllResult).filter(
          (s: any) => s.players?.online > 0
        ).length,
        players_on_servers: Object.values(statusAllResult).reduce(
          (sum: number, s: any) => sum + (s.players?.via_proxy_online ?? 0),
          0
        ),
      });
    } catch (e) {
      console.error('[WS] refreshData failed:', e);
    }
  }, [sendRequest, calcAggregate]);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.method && !('id' in msg)) {
          handlePushEvent(msg);
          return;
        }

        if (msg.id && pendingRef.current.has(msg.id)) {
          const p = pendingRef.current.get(msg.id)!;
          clearTimeout(p.timer);
          pendingRef.current.delete(msg.id);
          if (msg.error) {
            p.reject(msg.error);
          } else {
            p.resolve(msg.result);
          }
        }
      } catch (e) {
        console.error('[WS] message parse error:', e);
      }
    },
    [handlePushEvent]
  );

  const subscribeEvents = useCallback(async () => {
    try {
      await Promise.all([
        sendRequest('subscribe', { event: 'player.join' }),
        sendRequest('subscribe', { event: 'player.quit' }),
        sendRequest('subscribe', { event: 'player.switch_server' }),
      ]);
    } catch (e) {
      console.error('[WS] subscribe failed:', e);
    }
  }, [sendRequest]);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = undefined;
    }
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();
    pollTimerRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        refreshData();
      }
    }, POLL_INTERVAL);
  }, [stopPolling, refreshData]);

  const connect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = undefined;
    }
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      wsRef.current.onopen = null;
      wsRef.current.close();
      wsRef.current = null;
    }
    stopPolling();
    pendingRef.current.clear();

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
        if (mountedRef.current) {
          subscribeEvents().then(() => refreshData()).then(() => startPolling());
        }
      };

      ws.onmessage = handleMessage;

      ws.onerror = () => {};

      ws.onclose = () => {
        stopPolling();
        pendingRef.current.clear();
        if (!mountedRef.current) return;
        setConnectionStatus('reconnecting');
        const delay = Math.min(RECONNECT_DELAY * ++reconnectAttemptsRef.current, 30000);
        reconnectTimerRef.current = setTimeout(connect, delay);
      };
    } catch (e) {
      console.error('[WS] connect error:', e);
      setConnectionStatus('failed');
    }
  }, [handleMessage, subscribeEvents, refreshData, startPolling, stopPolling]);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        refreshData();
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      mountedRef.current = false;
      stopPolling();
      document.removeEventListener('visibilitychange', onVisible);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      pendingRef.current.clear();
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, []);

  const value: WebSocketContextType = {
    connectionStatus,
    servers,
    serverTree,
    aggregateStats,
    runtimeInfo,
    proxyStats,
    runningTime: runtimeInfo?.current_uptime_seconds ?? null,
    totalRunningTime: runtimeInfo?.total_uptime_seconds ?? null,
  };

  return React.createElement(WebSocketContext.Provider, { value }, children);
};

export const useWebSocket = () => {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error('useWebSocket must be used within WebSocketProvider');
  return ctx;
};
