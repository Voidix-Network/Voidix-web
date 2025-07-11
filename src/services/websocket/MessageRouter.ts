import { WEBSOCKET_CONFIG } from '@/constants';
import { useNoticeStore } from '@/stores';
import type { WebSocketMessage } from '@/types';
import type { WebSocketEventEmitter } from './EventEmitter';
import type { MaintenanceHandler } from './MaintenanceHandler';
import { WebSocketMessageParser } from './MessageParser';

/**
 * WebSocket消息路由器
 * 专门负责消息的解析、路由和分发
 * 从WebSocketService中分离出来的消息处理逻辑
 */
export class MessageRouter {
  private eventEmitter: WebSocketEventEmitter;
  private maintenanceHandler: MaintenanceHandler;
  private protocolVersionVerified: boolean = false;

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

    if (!parseResult.success || !parseResult.data) {
      console.error('[MessageRouter] 消息解析失败:', parseResult.error);
      return;
    }

    const messageData = parseResult.data;

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
      // 公告系统消息处理
      case 'notice_return':
        this.handleNoticeReturn(messageData);
        break;
      case 'notice_update_add_respond':
      case 'notice_update_remove_respond':
        this.handleNoticeUpdate(messageData);
        break;
      default:
        console.warn('[MessageRouter] 未知消息类型:', messageData.type, messageData);
    }
  }

  /**
   * 处理'full'消息 - 完整状态更新
   */
  private handleFullMessage(data: WebSocketMessage): void {
    console.debug('[MessageRouter] 处理fullUpdate消息 - 原始数据:', JSON.stringify(data, null, 2));

    // 首先检查协议版本
    if (!this.protocolVersionVerified) {
      const serverProtocolVersion = data.protocol_version;
      const supportedVersion = WEBSOCKET_CONFIG.SUPPORTED_PROTOCOL_VERSION;

      console.debug(
        `[MessageRouter] 协议版本检查: 服务器=${serverProtocolVersion}, 支持=${supportedVersion}`
      );

      if (typeof serverProtocolVersion !== 'number' || serverProtocolVersion !== supportedVersion) {
        console.error(
          `[MessageRouter] 协议版本不匹配！服务器版本: ${serverProtocolVersion}, 客户端支持版本: ${supportedVersion}`
        );

        // 标记为已验证，避免重复弹错误
        this.protocolVersionVerified = true;

        // 发出协议版本错误事件，触发连接断开
        this.eventEmitter.emit('protocolVersionMismatch', {
          serverVersion: serverProtocolVersion,
          clientVersion: supportedVersion,
          error: `协议版本不兼容: 服务器v${serverProtocolVersion} vs 客户端v${supportedVersion}`,
        });

        return; // 停止处理消息
      }

      this.protocolVersionVerified = true;
      console.debug('[MessageRouter] 协议版本验证通过');
    }

    console.debug('[MessageRouter] fullUpdate数据结构分析:', {
      hasServers: !!data.servers,
      serverCount: data.servers ? Object.keys(data.servers).length : 0,
      hasPlayers: !!data.players,
      hasCurrentPlayers: !!(data.players && data.players.currentPlayers),
      currentPlayersCount: data.players?.currentPlayers
        ? Object.keys(data.players.currentPlayers).length
        : 0,
      isMaintenance: data.isMaintenance,
      runningTime: data.runningTime,
      totalRunningTime: data.totalRunningTime,
      protocolVersion: data.protocol_version,
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

    // 处理公告总数（如果存在）
    if (data.notice_total_count !== undefined) {
      console.debug('[MessageRouter] full消息中包含公告总数:', data.notice_total_count);
      const noticeStore = useNoticeStore.getState();
      noticeStore.setTotalCount(data.notice_total_count);
    }

    // 移除重复的玩家数据处理，统一由aggregatedStore处理
    if (import.meta.env.DEV) {
      if (data.players?.currentPlayers && Object.keys(data.players.currentPlayers).length > 0) {
        console.debug('[MessageRouter] fullUpdate包含玩家详情数据，将由aggregatedStore统一处理');
      } else {
        console.debug('[MessageRouter] fullUpdate不包含玩家详情数据');
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

    console.debug('[MessageRouter] 维护状态更新结果:', result);
  }

  /**
   * 处理玩家数量更新
   */
  private handlePlayerUpdate(data: WebSocketMessage): void {
    console.debug('[MessageRouter] 处理玩家数量更新 - 原始数据:', JSON.stringify(data, null, 2));
    console.debug('[MessageRouter] 玩家数据字段检查:', {
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
          console.debug(`[MessageRouter] 玩家 ${data.player.uuid} 上线到 ${serverId}`);
          this.eventEmitter.emit('playerAdd', {
            playerId: data.player.uuid,
            serverId: serverId,
            playerInfo: data.player,
            player: data.player, // 兼容性字段
          });
          break;

        case 'players_update_remove':
          console.debug(`[MessageRouter] 玩家 ${data.player.uuid} 下线`);
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
      console.debug(
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
      console.debug('[MessageRouter] 原始server_update数据:', data.servers);

      // 检查数据格式：server_update消息使用简化格式 { serverId: playerCount }
      const firstKey = Object.keys(data.servers)[0];
      const firstValue = data.servers[firstKey];

      let normalizedServers: Record<string, any>;

      // 如果值是数字，说明是server_update的简化格式
      if (typeof firstValue === 'number') {
        normalizedServers = {};
        Object.entries(data.servers).forEach(([serverId, playerCount]) => {
          normalizedServers[serverId] = {
            online: playerCount as unknown as number,
            isOnline: true, // server_update消息中出现的服务器都是在线的
          };
        });
        console.debug('[MessageRouter] 转换server_update格式:', normalizedServers);
      } else {
        // 已经是完整格式（full消息）
        normalizedServers = data.servers;
      }

      console.debug('[MessageRouter] 发送标准化服务器数据:', {
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

  /**
   * 处理公告返回消息
   */
  private handleNoticeReturn(data: any) {
    console.debug('[MessageRouter] 处理公告返回:', data);

    try {
      const { notices, error_msg, page = 1, counts = 5, notice_total_count } = data;

      if (error_msg) {
        console.error('[MessageRouter] 公告请求错误:', error_msg);
        this.eventEmitter.emit('noticeError', { error: error_msg });
        return;
      }

      if (notices && typeof notices === 'object') {
        // 处理富文本数据，确保兼容性
        const processedNotices: Record<string, any> = {};

        Object.entries(notices).forEach(([id, notice]: [string, any]) => {
          processedNotices[id] = {
            ...notice,
            // 确保基础字段存在
            title: notice.title || '',
            text: notice.text || '',
            time: notice.time || Date.now(),
            color: notice.color || '#3B82F6',
            // 富文本字段（可选）
            title_rich: notice.title_rich || null,
            text_rich: notice.text_rich || null,
          };
        });

        console.debug('[MessageRouter] 处理后的公告数据:', processedNotices);
        console.debug('[MessageRouter] 公告总数:', notice_total_count);

        // 使用新的分页响应处理方法
        const noticeStore = useNoticeStore.getState();
        noticeStore.handleNoticeResponse(processedNotices, page, counts, notice_total_count);

        // 同时发送事件以保持兼容性
        this.eventEmitter.emit('noticeReturn', {
          notices: processedNotices,
          error_msg,
          page,
          counts,
          notice_total_count,
        });
      } else {
        console.warn('[MessageRouter] 收到的公告数据格式无效:', data);
        this.eventEmitter.emit('noticeError', { error: '公告数据格式无效' });
      }
    } catch (error) {
      console.error('[MessageRouter] 处理公告返回时出错:', error);
      this.eventEmitter.emit('noticeError', { error: '处理公告数据时出错' });
    }
  }

  /**
   * 处理公告更新消息（新增/删除）
   */
  private handleNoticeUpdate(data: WebSocketMessage): void {
    console.debug('[MessageRouter] 处理公告更新消息:', data.type, data);

    this.eventEmitter.emit('noticeUpdate', {
      type: data.type,
      data: data,
    });
  }
}
