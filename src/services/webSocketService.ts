import type { WebSocketMessage, WebSocketConfig } from '@/types';
import { WEBSOCKET_CONFIG } from '@/constants';

/**
 * WebSocket服务类
 * 基于原项目的复杂重连逻辑和消息处理机制
 * 实现类型安全的WebSocket通信
 */
export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private connectionTimeout: NodeJS.Timeout | null = null;
  private eventListeners = new Map<string, Set<Function>>();
  private config: WebSocketConfig;
  private forceShowMaintenance = false; // 维护模式强制标记

  constructor(config?: Partial<WebSocketConfig>) {
    this.config = { ...WEBSOCKET_CONFIG, ...config };
  }

  /**
   * 处理currentPlayers数据（从 fullUpdate 消息中）
   */
  private handleCurrentPlayersData(currentPlayers: Record<string, any>): void {
    console.log('[WebSocket] 处理当前玩家数据:', currentPlayers);

    // 遍历所有在线玩家
    Object.entries(currentPlayers).forEach(([playerId, playerData]) => {
      console.log(`[WebSocket] 处理玩家 ${playerId}:`, playerData);

      // 检查玩家数据格式
      if (playerData && typeof playerData === 'object') {
        // 提取玩家信息
        const uuid = playerData.uuid || playerId;
        const ign = playerData.ign || playerData.username || playerData.name || playerId;
        const serverId = playerData.server || playerData.currentServer || 'unknown';

        console.log(`[WebSocket] 从 fullUpdate 解析玩家IGN:`, {
          uuid,
          ign,
          serverId,
          originalData: playerData,
        });

        // 发射 playerAdd 事件来更新 store
        this.emit('playerAdd', {
          playerId: uuid,
          serverId,
          playerInfo: {
            uuid,
            ign,
            username: ign,
            server: serverId,
            ...playerData,
          },
          player: {
            uuid,
            ign,
            username: ign,
            currentServer: serverId,
            ...playerData,
          },
        });
      } else {
        console.warn(`[WebSocket] 玩家数据格式不正确: ${playerId}`, playerData);
      }
    });
  }

  /**
   * 建立WebSocket连接
   * 实现5秒连接超时机制
   */
  async connect(): Promise<void> {
    // 检查是否已经连接或正在连接
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] 已连接，跳过重复连接');
      return;
    }

    if (this.ws?.readyState === WebSocket.CONNECTING) {
      console.log('[WebSocket] 正在连接中，跳过重复连接');
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        // 清除现有连接超时
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
        }

        console.log('[WebSocket] 尝试连接到:', this.config.url);
        this.ws = new WebSocket(this.config.url);

        // 5秒连接超时机制（复现原项目逻辑）
        this.connectionTimeout = setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            console.log('[WebSocket] 连接超时，关闭连接');
            this.ws?.close();
          }
        }, this.config.connectionTimeout);

        // 连接成功处理
        this.ws.onopen = () => {
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
          }
          console.log('[WebSocket] 连接成功');
          this.reconnectAttempts = 0; // 重置重连计数
          this.emit('connected');
          resolve();
        };

        // 消息处理
        this.ws.onmessage = event => {
          this.handleMessage(event);
        };

        // 连接关闭处理
        this.ws.onclose = event => {
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
          }
          console.log('[WebSocket] 连接关闭:', event.code, event.reason);
          this.emit('disconnected', { code: event.code, reason: event.reason });
          this.handleReconnect();
        };

        // 连接错误处理
        this.ws.onerror = error => {
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
          }
          console.error('[WebSocket] 连接错误:', error);
          this.emit('error', error);
          reject(error);
        };
      } catch (error) {
        console.error('[WebSocket] 连接失败:', error);
        reject(error);
      }
    });
  }

  /**
   * 断开WebSocket连接
   */
  disconnect(): void {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    if (this.ws) {
      const currentState = this.ws.readyState;

      if (currentState === WebSocket.OPEN || currentState === WebSocket.CONNECTING) {
        console.log('[WebSocket] 手动断开连接');
        this.ws.close();
      } else {
        console.log('[WebSocket] 连接已关闭，跳过断开操作');
      }

      this.ws = null;
    } else {
      console.log('[WebSocket] 无连接实例，跳过断开操作');
    }
  }

  /**
   * 强制停止所有活动（用于测试清理）
   */
  forceStop(): void {
    // 清理连接超时
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    // 关闭WebSocket连接但不触发重连
    if (this.ws) {
      // 临时移除事件处理器避免触发重连
      const originalOnClose = this.ws.onclose;
      this.ws.onclose = null;

      this.ws.close();
      this.ws = null;

      // 恢复事件处理器
      if (originalOnClose) {
        this.ws = null; // 确保不会触发重连
      }
    }

    // 重置重连计数
    this.reconnectAttempts = 0;

    // 清理事件监听器
    this.eventListeners.clear();

    console.log('[WebSocket] 强制停止完成');
  }

  /**
   * 处理WebSocket消息
   * 基于原项目的消息类型分发机制
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const messageData: WebSocketMessage = JSON.parse(event.data);

      console.log('[WebSocket] 收到消息:', messageData.type, messageData);

      // 消息类型分发处理（复现原项目的switch-case逻辑）
      switch (messageData.type) {
        case 'full':
          this.handleFullMessage(messageData);
          break;
        case 'maintenance_status_update':
          this.handleMaintenanceUpdate(messageData);
          break;
        case 'players_update_add':
        case 'players_update_remove':
          this.handlePlayerUpdate(messageData);
          break;
        case 'server_update':
          this.handleServerUpdate(messageData);
          break;
        // 公告系统消息（状态页面不处理，但记录日志）
        case 'notice_update_add_respond':
        case 'notice_update_remove_respond':
        case 'notice_return':
          console.log('[WebSocket] 收到公告系统消息（未处理）:', messageData.type);
          break;
        default:
          console.warn('[WebSocket] 未知消息类型:', messageData.type, messageData);
      }
    } catch (error) {
      console.error('[WebSocket] 消息解析失败:', error, 'Raw data:', event.data);
    }
  }

  /**
   * 处理'full'消息 - 完整状态更新
   */
  private handleFullMessage(data: WebSocketMessage): void {
    console.log('[WebSocket] 处理fullUpdate消息 - 原始数据:', JSON.stringify(data, null, 2));
    console.log('[WebSocket] fullUpdate数据结构分析:', {
      hasServers: !!data.servers,
      serverCount: data.servers ? Object.keys(data.servers).length : 0,
      hasPlayers: !!data.players,
      hasCurrentPlayers: !!(data.players && data.players.currentPlayers),
      currentPlayersCount: data.players?.currentPlayers
        ? Object.keys(data.players.currentPlayers).length
        : 0,
      totalOnline: data.players?.online,
      hasRunningTime: data.runningTime !== undefined,
      isMaintenance: data.isMaintenance,
    });

    const isMaintenanceFromFull = data.isMaintenance;
    const maintenanceStartTimeFromFull = data.maintenanceStartTime;

    // 构建完整的数据负载
    const payload = {
      servers: data.servers || {},
      players: data.players || { online: '0', currentPlayers: {} },
      runningTime: data.runningTime,
      totalRunningTime: data.totalRunningTime,
      isMaintenance: this.forceShowMaintenance
        ? true
        : typeof isMaintenanceFromFull === 'boolean'
          ? isMaintenanceFromFull
          : false,
      maintenanceStartTime: maintenanceStartTimeFromFull || null,
    };

    // 如果fullUpdate包含玩家详情数据，处理它们
    if (data.players?.currentPlayers && Object.keys(data.players.currentPlayers).length > 0) {
      console.log('[WebSocket] fullUpdate包含玩家详情数据，处理IGN信息');
      this.handleCurrentPlayersData(data.players.currentPlayers);
    } else {
      console.log('[WebSocket] fullUpdate不包含玩家详情数据');
    }

    this.emit('fullUpdate', payload);
  }

  /**
   * 处理维护状态更新
   */
  private handleMaintenanceUpdate(data: WebSocketMessage): void {
    const isEnteringMaintenance = data.status === true || data.status === 'true';

    if (isEnteringMaintenance) {
      this.forceShowMaintenance = true; // 强制维护标记
    } else {
      this.forceShowMaintenance = false;
    }

    const payload = {
      isMaintenance: isEnteringMaintenance,
      maintenanceStartTime: data.maintenanceStartTime || null,
      forceShowMaintenance: this.forceShowMaintenance,
    };

    this.emit('maintenanceUpdate', payload);
  }

  /**
   * 处理玩家数量更新
   */
  private handlePlayerUpdate(data: WebSocketMessage): void {
    console.log('[WebSocket] 处理玩家数量更新 - 原始数据:', JSON.stringify(data, null, 2));
    console.log('[WebSocket] 玩家数据字段检查:', {
      hasPlayer: !!data.player,
      playerKeys: data.player ? Object.keys(data.player) : 'undefined',
      hasUuid: data.player?.uuid,
      hasCurrentServer: data.player?.currentServer,
      hasPreviousServer: data.player?.previousServer,
      hasNewServer: data.player?.newServer,
      messageType: data.type,
    });

    // 发射专门的玩家事件以支持精确的玩家跟踪
    if (data.player && data.player.uuid) {
      switch (data.type) {
        case 'players_update_add':
          const serverId = data.player.currentServer || data.player.newServer || 'unknown';
          console.log(`[WebSocket] 玩家 ${data.player.uuid} 上线到 ${serverId}`);
          this.emit('playerAdd', {
            playerId: data.player.uuid,
            serverId: serverId,
            playerInfo: data.player,
            player: data.player, // 兼容性字段
          });
          break;

        case 'players_update_remove':
          console.log(`[WebSocket] 玩家 ${data.player.uuid} 下线`);
          this.emit('playerRemove', {
            playerId: data.player.uuid,
            playerInfo: data.player,
            player: data.player, // 兼容性字段
          });
          break;
      }
    } else {
      console.warn('[WebSocket] 玩家更新消息缺少必要字段:', {
        hasPlayer: !!data.player,
        hasUuid: data.player?.uuid,
        messageType: data.type,
        fullData: data,
      });
    }

    // 处理总玩家数更新（如果提供）
    if (data.totalOnlinePlayers !== undefined) {
      this.emit('playerUpdate', {
        totalOnlinePlayers: data.totalOnlinePlayers.toString(),
        type: data.type,
      });
    } else {
      // 对于players_update_add/remove消息，需要重新计算总数
      // 由于这些消息不包含总数，我们发射一个信号让store重新计算
      this.emit('playerUpdate', {
        totalOnlinePlayers: null, // 表示需要重新计算
        type: data.type,
        player: data.player, // 传递玩家信息以便调试
      });
    }
  }

  /**
   * 处理服务器状态更新
   */
  private handleServerUpdate(data: WebSocketMessage): void {
    // 处理玩家移动（如果包含玩家信息）
    if (data.player && data.player.uuid && data.player.previousServer && data.player.newServer) {
      console.log(
        `[WebSocket] 玩家 ${data.player.uuid} 从 ${data.player.previousServer} 移动到 ${data.player.newServer}`
      );
      this.emit('playerMove', {
        playerId: data.player.uuid,
        fromServer: data.player.previousServer,
        toServer: data.player.newServer,
        playerInfo: data.player,
      });
    }

    if (data.servers) {
      console.log('[WebSocket] 原始server_update数据:', data.servers);

      // 检查数据格式：server_update消息使用简化格式 { serverId: playerCount }
      const firstKey = Object.keys(data.servers)[0];
      const firstValue = data.servers[firstKey];

      let normalizedServers: Record<string, any>;

      // 如果值是数字，说明是server_update的简化格式
      if (typeof firstValue === 'number') {
        normalizedServers = {};
        Object.entries(data.servers).forEach(([serverId, playerCount]) => {
          normalizedServers[serverId] = {
            online: playerCount as number,
            isOnline: true, // server_update消息中出现的服务器都是在线的
          };
        });
        console.log('[WebSocket] 转换server_update格式:', normalizedServers);
      } else {
        // 已经是完整格式（full消息）
        normalizedServers = data.servers;
      }

      console.log('[WebSocket] 发送标准化服务器数据:', {
        serverCount: Object.keys(normalizedServers).length,
        servers: Object.keys(normalizedServers),
        serverData: normalizedServers,
      });

      this.emit('serverUpdate', {
        servers: normalizedServers,
      });
    } else {
      console.warn('[WebSocket] server_update消息缺少servers数据:', data);
    }
  }
  /**
   * 处理重连逻辑
   * 实现3级指数退避重连策略
   */
  private async handleReconnect(): Promise<void> {
    // 如果禁用重连，直接返回
    if (this.config.disableReconnect) {
      console.log('[WebSocket] 重连已禁用，跳过重连');
      return;
    }

    const maxAttempts = this.config.maxReconnectAttempts;
    const intervalSequence = this.config.reconnectIntervals;

    if (this.reconnectAttempts < maxAttempts) {
      // 动态重连间隔算法（复现原项目逻辑）
      const nextInterval =
        intervalSequence[this.reconnectAttempts] !== undefined
          ? intervalSequence[this.reconnectAttempts]
          : intervalSequence[intervalSequence.length - 1];

      this.reconnectAttempts++;

      console.log(
        `[WebSocket] 重连尝试 ${this.reconnectAttempts}/${maxAttempts}，${nextInterval / 1000}秒后重试`
      );

      this.emit('reconnecting', {
        attempt: this.reconnectAttempts,
        delay: nextInterval,
        maxAttempts,
      });

      setTimeout(() => {
        this.connect().catch(error => {
          console.error('[WebSocket] 重连失败:', error);
        });
      }, nextInterval);
    } else {
      console.log(`[WebSocket] 达到最大重连次数 (${maxAttempts})，停止重连`);
      this.emit('connectionFailed', {
        maxAttempts,
        totalAttempts: this.reconnectAttempts,
      });
    }
  }

  /**
   * 添加事件监听器
   */
  on<T = any>(event: string, handler: (data: T) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(handler);
  }

  /**
   * 移除事件监听器
   */
  off(event: string, handler: Function): void {
    const handlers = this.eventListeners.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * 发射事件
   */
  private emit(event: string, data?: any): void {
    const handlers = this.eventListeners.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[WebSocket] 事件处理器错误 (${event}):`, error);
        }
      });
    }
  }

  /**
   * 获取当前连接状态
   */
  get readyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  /**
   * 检查是否已连接
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * 获取当前重连尝试次数
   */
  get currentReconnectAttempts(): number {
    return this.reconnectAttempts;
  }
}
