import { WEBSOCKET_CONFIG } from '@/constants';
import { useNoticeStore } from '@/stores';
import type { WebSocketMessage } from '@/types';
import type { WebSocketEventEmitter } from './EventEmitter';
import type { MaintenanceHandler } from './MaintenanceHandler';
import { WebSocketMessageParser } from './MessageParser';

export interface MultiMessageData {
  connectionName: string;
  data: string;
  source: string;
}

export class MultiMessageRouter {
  private eventEmitter: WebSocketEventEmitter;
  private maintenanceHandler: MaintenanceHandler;
  private protocolVersionVerified: Map<string, boolean> = new Map();

  constructor(eventEmitter: WebSocketEventEmitter, maintenanceHandler: MaintenanceHandler) {
    this.eventEmitter = eventEmitter;
    this.maintenanceHandler = maintenanceHandler;
  }

  handleMessage(messageData: MultiMessageData): void {
    const { connectionName, data } = messageData;

    console.debug(`[MultiMessageRouter] 收到来自 ${connectionName} 的消息:`, data);

    const parseResult = WebSocketMessageParser.parse(data);

    if (!parseResult.success || !parseResult.data) {
      console.error(`[MultiMessageRouter] ${connectionName} 消息解析失败:`, parseResult.error);
      return;
    }

    const parsedData = parseResult.data;

    // 根据连接来源处理消息
    if (connectionName === 'survival') {
      this.handleSurvivalMessage(parsedData);
    } else if (connectionName === 'minigames') {
      this.handleMinigamesMessage(parsedData);
    } else {
      console.warn(`[MultiMessageRouter] 未知连接来源: ${connectionName}`);
    }
  }

  private handleSurvivalMessage(data: WebSocketMessage): void {
    console.debug('[MultiMessageRouter] 处理生存服消息:', data);

    // 生存服消息格式：{"players":{"max":10000,"players":[],"curr":0},"server-version":"1.21.7-DEV-d855821 (MC: 1.21.7)","type":"full"}
    if (data.type === 'full') {
      // 转换生存服数据格式以匹配现有的处理逻辑
      const normalizedData = this.normalizeSurvivalData(data);

      // 添加生存服标识
      const survivalPayload = {
        ...normalizedData,
        source: 'survival',
        connectionName: 'survival',
      };

      this.eventEmitter.emit('fullUpdate', survivalPayload);
    } else {
      console.warn('[MultiMessageRouter] 生存服未知消息类型:', data.type);
    }
  }

  private handleMinigamesMessage(data: WebSocketMessage): void {
    console.debug('[MultiMessageRouter] 处理小游戏服消息:', data);

    // 检查协议版本（只对小游戏服务器进行版本检查）
    if (!this.protocolVersionVerified.get('minigames')) {
      const serverProtocolVersion = data.protocol_version;
      const supportedVersion = WEBSOCKET_CONFIG.SUPPORTED_PROTOCOL_VERSION;

      console.debug(
        `[MultiMessageRouter] 小游戏服协议版本检查: 服务器=${serverProtocolVersion}, 支持=${supportedVersion}`
      );

      if (typeof serverProtocolVersion !== 'number' || serverProtocolVersion !== supportedVersion) {
        console.error(
          `[MultiMessageRouter] 小游戏服协议版本不匹配！服务器版本: ${serverProtocolVersion}, 客户端支持版本: ${supportedVersion}`
        );

        this.protocolVersionVerified.set('minigames', true);

        this.eventEmitter.emit('protocolVersionMismatch', {
          serverVersion: serverProtocolVersion,
          clientVersion: supportedVersion,
          error: `小游戏服协议版本不兼容: 服务器v${serverProtocolVersion} vs 客户端v${supportedVersion}`,
        });

        return;
      }

      this.protocolVersionVerified.set('minigames', true);
      console.debug('[MultiMessageRouter] 小游戏服协议版本验证通过');
    }

    // 处理小游戏服各种消息类型
    switch (data.type) {
      case 'full':
        this.handleMinigamesFullMessage(data);
        break;
      case 'maintenance_status_update':
        this.handleMaintenanceUpdate(data);
        break;
      case 'players_update_add':
      case 'players_update_remove':
        this.handlePlayerUpdate(data);
        break;
      case 'server_update':
        this.handleServerUpdate(data);
        break;
      case 'notice_return':
        this.handleNoticeReturn(data);
        break;
      case 'notice_update_add_respond':
      case 'notice_update_remove_respond':
        this.handleNoticeUpdate(data);
        break;
      default:
        console.warn('[MultiMessageRouter] 小游戏服未知消息类型:', data.type, data);
    }
  }

  private normalizeSurvivalData(data: any): any {
    // 将生存服数据格式转换为标准格式
    return {
      servers: {
        survival: {
          online: data.players?.curr || 0,
          max: data.players?.max || 10000,
          players: data.players?.players || [],
          isOnline: true,
          uptime: 0, // 生存服没有提供uptime信息
          version: data['server-version'] || 'Unknown',
        },
      },
      players: {
        online: (data.players?.curr || 0).toString(),
        currentPlayers: this.createPlayerMap(data.players?.players || []),
      },
      runningTime: 0,
      totalRunningTime: 0,
      isMaintenance: false,
      maintenanceStartTime: null,
      source: 'survival',
    };
  }

  private createPlayerMap(playersList: any[]): Record<string, any> {
    const playerMap: Record<string, any> = {};

    playersList.forEach((player, index) => {
      if (typeof player === 'string') {
        // 简单的用户名列表
        playerMap[`survival_player_${index}`] = {
          uuid: `survival_player_${index}`,
          username: player,
          currentServer: 'survival',
        };
      } else if (player && typeof player === 'object') {
        // 详细的玩家信息
        const playerId = player.uuid || player.id || `survival_player_${index}`;
        playerMap[playerId] = {
          ...player,
          currentServer: 'survival',
        };
      }
    });

    return playerMap;
  }

  private handleMinigamesFullMessage(data: WebSocketMessage): void {
    console.debug('[MultiMessageRouter] 处理小游戏服完整状态更新:', data);

    const maintenanceResult = this.maintenanceHandler.handleFullMessage({
      isMaintenance: data.isMaintenance,
      maintenanceStartTime: data.maintenanceStartTime,
    });

    const payload = {
      servers: data.servers || {},
      players: data.players || { online: '0', currentPlayers: {} },
      runningTime: data.runningTime,
      totalRunningTime: data.totalRunningTime,
      isMaintenance: maintenanceResult.isMaintenance,
      maintenanceStartTime: maintenanceResult.maintenanceStartTime,
      source: 'minigames',
    };

    if (data.notice_total_count !== undefined) {
      console.debug(
        '[MultiMessageRouter] 小游戏服full消息中包含公告总数:',
        data.notice_total_count
      );
      const noticeStore = useNoticeStore.getState();
      noticeStore.setTotalCount(data.notice_total_count);
    }

    this.eventEmitter.emit('fullUpdate', payload);
  }

  private handleMaintenanceUpdate(data: WebSocketMessage): void {
    const result = this.maintenanceHandler.handleMaintenanceMessage({
      status: data.status,
      maintenanceStartTime: data.maintenanceStartTime,
    });

    console.debug('[MultiMessageRouter] 维护状态更新结果:', result);
  }

  private handlePlayerUpdate(data: WebSocketMessage): void {
    console.debug('[MultiMessageRouter] 处理玩家数量更新:', data);

    if (data.player && data.player.uuid) {
      switch (data.type) {
        case 'players_update_add':
          const serverId = data.player.currentServer || data.player.newServer || 'unknown';
          this.eventEmitter.emit('playerAdd', {
            playerId: data.player.uuid,
            serverId: serverId,
            playerInfo: data.player,
            player: data.player,
          });
          break;

        case 'players_update_remove':
          this.eventEmitter.emit('playerRemove', {
            playerId: data.player.uuid,
            playerInfo: data.player,
            player: data.player,
          });
          break;
      }
    }

    if (data.totalOnlinePlayers !== undefined) {
      this.eventEmitter.emit('playerUpdate', {
        totalOnlinePlayers: data.totalOnlinePlayers.toString(),
        type: data.type,
      });
    } else {
      this.eventEmitter.emit('playerUpdate', {
        totalOnlinePlayers: null,
        type: data.type,
        player: data.player,
      });
    }
  }

  private handleServerUpdate(data: WebSocketMessage): void {
    if (data.player && data.player.uuid && data.player.previousServer && data.player.newServer) {
      this.eventEmitter.emit('playerMove', {
        playerId: data.player.uuid,
        fromServer: data.player.previousServer,
        toServer: data.player.newServer,
        playerInfo: data.player,
      });
    }

    if (data.servers) {
      let normalizedServers: Record<string, any>;
      const firstKey = Object.keys(data.servers)[0];
      const firstValue = data.servers[firstKey];

      if (typeof firstValue === 'number') {
        normalizedServers = {};
        Object.entries(data.servers).forEach(([serverId, playerCount]) => {
          normalizedServers[serverId] = {
            online: playerCount as unknown as number,
            isOnline: true,
          };
        });
      } else {
        normalizedServers = data.servers;
      }

      this.eventEmitter.emit('serverUpdate', {
        servers: normalizedServers,
      });
    }
  }

  private handleNoticeReturn(data: any) {
    console.debug('[MultiMessageRouter] 处理公告返回:', data);

    try {
      const { notices, error_msg, page = 1, counts = 5, notice_total_count } = data;

      if (error_msg) {
        console.error('[MultiMessageRouter] 公告请求错误:', error_msg);
        this.eventEmitter.emit('noticeError', { error: error_msg });
        return;
      }

      if (notices && typeof notices === 'object') {
        const processedNotices: Record<string, any> = {};

        Object.entries(notices).forEach(([id, notice]: [string, any]) => {
          processedNotices[id] = {
            ...notice,
            title: notice.title || '',
            text: notice.text || '',
            time: notice.time || Date.now(),
            color: notice.color || '#3B82F6',
            title_rich: notice.title_rich || null,
            text_rich: notice.text_rich || null,
          };
        });

        const noticeStore = useNoticeStore.getState();
        noticeStore.handleNoticeResponse(processedNotices, page, counts, notice_total_count);

        this.eventEmitter.emit('noticeReturn', {
          notices: processedNotices,
          error_msg,
          page,
          counts,
          notice_total_count,
        });
      } else {
        console.warn('[MultiMessageRouter] 收到的公告数据格式无效:', data);
        this.eventEmitter.emit('noticeError', { error: '公告数据格式无效' });
      }
    } catch (error) {
      console.error('[MultiMessageRouter] 处理公告返回时出错:', error);
      this.eventEmitter.emit('noticeError', { error: '处理公告数据时出错' });
    }
  }

  private handleNoticeUpdate(data: WebSocketMessage): void {
    console.debug('[MultiMessageRouter] 处理公告更新消息:', data.type, data);

    this.eventEmitter.emit('noticeUpdate', {
      type: data.type,
      data: data,
    });
  }
}
