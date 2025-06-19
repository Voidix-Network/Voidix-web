import type { WebSocketMessage } from '@/types';
import { WebSocketMessageParser } from './MessageParser';
import type { WebSocketEventEmitter } from './EventEmitter';
import type { MaintenanceHandler } from './MaintenanceHandler';

/**
 * WebSocket消息路由器
 * 专门负责消息的解析、路由和分发
 * 从WebSocketService中分离出来的消息处理逻辑
 */
export class MessageRouter {
  private eventEmitter: WebSocketEventEmitter;
  private maintenanceHandler: MaintenanceHandler;

  constructor(eventEmitter: WebSocketEventEmitter, maintenanceHandler: MaintenanceHandler) {
    this.eventEmitter = eventEmitter;
    this.maintenanceHandler = maintenanceHandler;
  }

  /**
   * 处理WebSocket消息
   * 基于原项目的消息类型分发机制
   */
  handleMessage(event: MessageEvent): void {
    const parseResult = WebSocketMessageParser.parse(event.data);

    if (!parseResult.success) {
      console.error('[MessageRouter] 消息解析失败:', parseResult.error, 'Raw data:', event.data);
      return;
    }

    const messageData = parseResult.data!;
    console.log('[MessageRouter] 路由消息:', messageData.type, messageData);

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
        console.log('[MessageRouter] 收到公告系统消息（未处理）:', messageData.type);
        break;
      default:
        console.warn('[MessageRouter] 未知消息类型:', messageData.type, messageData);
    }
  }

  /**
   * 处理'full'消息 - 完整状态更新
   */
  private handleFullMessage(data: WebSocketMessage): void {
    console.log('[MessageRouter] 处理fullUpdate消息 - 原始数据:', JSON.stringify(data, null, 2));
    console.log('[MessageRouter] fullUpdate数据结构分析:', {
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

    // 使用MaintenanceHandler处理维护状态
    const maintenanceResult = this.maintenanceHandler.handleFullMessage({
      isMaintenance: data.isMaintenance,
      maintenanceStartTime: data.maintenanceStartTime,
    });

    // 构建完整的数据负载
    const payload = {
      servers: data.servers || {},
      players: data.players || { online: '0', currentPlayers: {} },
      runningTime: data.runningTime,
      totalRunningTime: data.totalRunningTime,
      isMaintenance: maintenanceResult.isMaintenance,
      maintenanceStartTime: maintenanceResult.maintenanceStartTime,
    };

    // 移除重复的玩家数据处理，统一由aggregatedStore处理
    if (import.meta.env.DEV) {
      if (data.players?.currentPlayers && Object.keys(data.players.currentPlayers).length > 0) {
        console.log('[MessageRouter] fullUpdate包含玩家详情数据，将由aggregatedStore统一处理');
      } else {
        console.log('[MessageRouter] fullUpdate不包含玩家详情数据');
      }
    }

    this.eventEmitter.emit('fullUpdate', payload);
  }

  /**
   * 处理维护状态更新
   */
  private handleMaintenanceUpdate(data: WebSocketMessage): void {
    const result = this.maintenanceHandler.handleMaintenanceMessage({
      status: data.status,
      maintenanceStartTime: data.maintenanceStartTime,
    });

    console.log('[MessageRouter] 维护状态更新结果:', result);
  }

  /**
   * 处理玩家数量更新
   */
  private handlePlayerUpdate(data: WebSocketMessage): void {
    console.log('[MessageRouter] 处理玩家数量更新 - 原始数据:', JSON.stringify(data, null, 2));
    console.log('[MessageRouter] 玩家数据字段检查:', {
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
          console.log(`[MessageRouter] 玩家 ${data.player.uuid} 上线到 ${serverId}`);
          this.eventEmitter.emit('playerAdd', {
            playerId: data.player.uuid,
            serverId: serverId,
            playerInfo: data.player,
            player: data.player, // 兼容性字段
          });
          break;

        case 'players_update_remove':
          console.log(`[MessageRouter] 玩家 ${data.player.uuid} 下线`);
          this.eventEmitter.emit('playerRemove', {
            playerId: data.player.uuid,
            playerInfo: data.player,
            player: data.player, // 兼容性字段
          });
          break;
      }
    } else {
      console.warn('[MessageRouter] 玩家更新消息缺少必要字段:', {
        hasPlayer: !!data.player,
        hasUuid: data.player?.uuid,
        messageType: data.type,
        fullData: data,
      });
    }

    // 处理总玩家数更新
    if (data.totalOnlinePlayers !== undefined) {
      this.eventEmitter.emit('playerUpdate', {
        totalOnlinePlayers: data.totalOnlinePlayers.toString(),
        type: data.type,
      });
    } else {
      // 对于players_update_add/remove消息，需要重新计算总数
      this.eventEmitter.emit('playerUpdate', {
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
        `[MessageRouter] 玩家 ${data.player.uuid} 从 ${data.player.previousServer} 移动到 ${data.player.newServer}`
      );
      this.eventEmitter.emit('playerMove', {
        playerId: data.player.uuid,
        fromServer: data.player.previousServer,
        toServer: data.player.newServer,
        playerInfo: data.player,
      });
    }

    if (data.servers) {
      console.log('[MessageRouter] 原始server_update数据:', data.servers);

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
        console.log('[MessageRouter] 转换server_update格式:', normalizedServers);
      } else {
        // 已经是完整格式（full消息）
        normalizedServers = data.servers;
      }

      console.log('[MessageRouter] 发送标准化服务器数据:', {
        serverCount: Object.keys(normalizedServers).length,
        servers: Object.keys(normalizedServers),
        serverData: normalizedServers,
      });

      this.eventEmitter.emit('serverUpdate', {
        servers: normalizedServers,
      });
    } else {
      console.warn('[MessageRouter] server_update消息缺少servers数据:', data);
    }
  }
}
