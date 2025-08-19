import { MultiWebSocketService } from '@/services/websocket';
import { useEffect, useRef, useState } from 'react';

interface ConnectionStatus {
  minigames: {
    connected: boolean;
    readyState: number;
    lastMessage?: string;
  };
  survival: {
    connected: boolean;
    readyState: number;
    lastMessage?: string;
  };
}

export function TestMultiConnectionPage() {
  const [status, setStatus] = useState<ConnectionStatus>({
    minigames: { connected: false, readyState: WebSocket.CLOSED },
    survival: { connected: false, readyState: WebSocket.CLOSED },
  });
  const [logs, setLogs] = useState<string[]>([]);
  const serviceRef = useRef<InstanceType<typeof MultiWebSocketService> | null>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-19), `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    const service = MultiWebSocketService.getInstance();
    serviceRef.current = service;

    service.on('fullUpdate', (data: any) => {
      addLog(
        `收到 ${data.source || 'unknown'} 完整更新: ${JSON.stringify(data).substring(0, 100)}...`
      );
    });

    service.on('message', (data: any) => {
      addLog(`收到来自 ${data.connectionName} 的消息: ${data.data.substring(0, 50)}...`);

      setStatus(prev => ({
        ...prev,
        [data.connectionName]: {
          ...prev[data.connectionName as keyof ConnectionStatus],
          lastMessage: data.data.substring(0, 100),
        },
      }));
    });

    service.on('connectionStateChange', (data: any) => {
      addLog(`${data.connectionName} 连接状态变化: ${data.previousState} -> ${data.currentState}`);

      const connectionInfo = service.getConnectionInfo();
      setStatus({
        minigames: {
          connected: connectionInfo.minigames?.isConnected || false,
          readyState: connectionInfo.minigames?.readyState || WebSocket.CLOSED,
        },
        survival: {
          connected: connectionInfo.survival?.isConnected || false,
          readyState: connectionInfo.survival?.readyState || WebSocket.CLOSED,
        },
      });
    });

    return () => {
      service.disconnect();
    };
  }, []);

  const handleConnectAll = async () => {
    try {
      addLog('尝试连接所有WebSocket...');
      await serviceRef.current?.connect();
      addLog('所有连接建立成功');
    } catch (error) {
      addLog(`连接失败: ${error}`);
    }
  };

  const handleConnectSingle = async (connectionName: 'minigames' | 'survival') => {
    try {
      addLog(`尝试连接 ${connectionName}...`);
      await serviceRef.current?.connectSingle(connectionName);
      addLog(`${connectionName} 连接建立成功`);
    } catch (error) {
      addLog(`${connectionName} 连接失败: ${error}`);
    }
  };

  const handleDisconnect = (connectionName?: 'minigames' | 'survival') => {
    if (connectionName) {
      addLog(`断开 ${connectionName} 连接`);
      serviceRef.current?.disconnect(connectionName);
    } else {
      addLog('断开所有连接');
      serviceRef.current?.disconnect();
    }
  };

  const getReadyStateText = (state: number) => {
    switch (state) {
      case WebSocket.CONNECTING:
        return '连接中';
      case WebSocket.OPEN:
        return '已连接';
      case WebSocket.CLOSING:
        return '关闭中';
      case WebSocket.CLOSED:
        return '已关闭';
      default:
        return '未知';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">多连接WebSocket测试页面</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">小游戏服务器连接</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <span
                className={`w-3 h-3 rounded-full mr-2 ${status.minigames.connected ? 'bg-green-500' : 'bg-red-500'}`}
              ></span>
              <span>状态: {status.minigames.connected ? '已连接' : '未连接'}</span>
            </div>
            <div>ReadyState: {getReadyStateText(status.minigames.readyState)}</div>
            <div>地址: wss://server.voidix.top:10203</div>
            {status.minigames.lastMessage && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                最新消息: {status.minigames.lastMessage}
              </div>
            )}
          </div>
          <div className="mt-4 space-x-2">
            <button
              onClick={() => handleConnectSingle('minigames')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              连接
            </button>
            <button
              onClick={() => handleDisconnect('minigames')}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              断开
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">生存服务器连接</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <span
                className={`w-3 h-3 rounded-full mr-2 ${status.survival.connected ? 'bg-green-500' : 'bg-red-500'}`}
              ></span>
              <span>状态: {status.survival.connected ? '已连接' : '未连接'}</span>
            </div>
            <div>ReadyState: {getReadyStateText(status.survival.readyState)}</div>
            <div>地址: wss://server1.voidix.top:10203/</div>
            {status.survival.lastMessage && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                最新消息: {status.survival.lastMessage}
              </div>
            )}
          </div>
          <div className="mt-4 space-x-2">
            <button
              onClick={() => handleConnectSingle('survival')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              连接
            </button>
            <button
              onClick={() => handleDisconnect('survival')}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              断开
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">全局控制</h2>
        <div className="space-x-2">
          <button
            onClick={handleConnectAll}
            className="px-6 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            连接所有
          </button>
          <button
            onClick={() => handleDisconnect()}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            断开所有
          </button>
          <button
            onClick={() => setLogs([])}
            className="px-6 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            清空日志
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">连接日志</h2>
        <div className="bg-gray-100 dark:bg-gray-900 rounded p-4 h-64 overflow-y-auto font-mono text-sm">
          {logs.length === 0 ? (
            <div className="text-gray-500">暂无日志...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
