import type { WebSocketEventEmitter } from './EventEmitter';
import {
  OmniCoreMessageParser,
  type EventCallMessage,
  type OmniCoreBaseMessage,
} from './OmniCoreMessageParser';

export interface MultiMessageData {
  connectionName: string;
  data: string;
  source: string;
}

export class MultiMessageRouter {
  private eventEmitter: WebSocketEventEmitter;

  constructor(eventEmitter: WebSocketEventEmitter) {
    this.eventEmitter = eventEmitter;
  }

  handleMessage(messageData: MultiMessageData): void {
    const { connectionName, data } = messageData;

    console.log(`[MultiMessageRouter] 收到来自 ${connectionName} 的原始消息:`, data);

    // 使用 OmniCore 解析器
    const parseResult = OmniCoreMessageParser.parse(data);

    if (!parseResult.success || !parseResult.data) {
      console.error(`[MultiMessageRouter] ${connectionName} OmniCore 消息解析失败:`, parseResult.error);
      return;
    }

    console.log(`[MultiMessageRouter] ${connectionName} 消息解析成功:`, parseResult.data);

    // 处理 OmniCore API 消息
    this.handleOmniCoreMessage(parseResult.data, connectionName);
  }


  /**
   * 处理 OmniCore API 消息
   */
  private handleOmniCoreMessage(message: OmniCoreBaseMessage, connectionName: string): void {
    console.log('[MultiMessageRouter] 处理 OmniCore API 消息:', message.type, message);

    // 检查错误消息
    if (OmniCoreMessageParser.isErrorMessage(message)) {
      console.error('[MultiMessageRouter] OmniCore 错误:', message.error, message);
      this.eventEmitter.emit('error', {
        type: message.type,
        error: message.error,
        code: message.code,
      });
      return;
    }

    // 处理事件回调
    if (OmniCoreMessageParser.isEventCall(message)) {
      this.handleOmniCoreEventCall(message as EventCallMessage);
      return;
    }

    // 处理服务器状态响应
    if (OmniCoreMessageParser.isServerStatusResponse(message)) {
      this.handleOmniCoreServerStatus(message, connectionName);
      return;
    }

    // 处理服务器摘要响应
    if (OmniCoreMessageParser.isServerSummaryResponse(message)) {
      this.handleOmniCoreServerSummary(message, connectionName);
      return;
    }

    // 处理订阅响应
    if (OmniCoreMessageParser.isSubscribeResponse(message)) {
      console.log('[MultiMessageRouter] 订阅响应:', message);
      return;
    }

    // 处理元信息响应
    if (OmniCoreMessageParser.isMetaInfoResponse(message)) {
      this.handleOmniCoreMetaInfo(message, connectionName);
      return;
    }

    // 未知消息类型
    console.warn('[MultiMessageRouter] 未知的 OmniCore 消息类型:', message.type, message);
  }

  /**
   * 处理 OmniCore 事件回调
   */
  private handleOmniCoreEventCall(event: EventCallMessage): void {
    console.log('[MultiMessageRouter] 处理 OmniCore 事件:', event.event_id, event.event_data);

    const normalized = OmniCoreMessageParser.normalizeEventCall(event);
    if (!normalized) {
      console.warn('[MultiMessageRouter] 无法转换事件:', event);
      return;
    }

    console.log('[MultiMessageRouter] 事件已转换为内部格式:', normalized);

    // 转换为内部消息格式后发送事件
    switch (normalized.type) {
      case 'players_update_add':
        this.eventEmitter.emit('playerAdd', {
          playerId: normalized.player.uuid,
          serverId: normalized.player.currentServer,
          playerInfo: normalized.player,
          player: normalized.player,
        });
        break;

      case 'players_update_remove':
        this.eventEmitter.emit('playerRemove', {
          playerId: normalized.player.uuid,
          playerInfo: normalized.player,
          player: normalized.player,
        });
        break;

      case 'server_update':
        this.eventEmitter.emit('playerMove', {
          playerId: normalized.player.uuid,
          fromServer: normalized.player.previousServer,
          toServer: normalized.player.newServer,
          playerInfo: normalized.player,
        });
        break;
    }
  }

  /**
   * 处理 OmniCore 服务器状态响应
   */
  private handleOmniCoreServerStatus(message: any, connectionName: string): void {
    const normalized = OmniCoreMessageParser.normalizeServerStatus(message);

    if (!normalized) {
      console.warn('[MultiMessageRouter] 无法转换服务器状态:', message);
      return;
    }

    console.log('[MultiMessageRouter] OmniCore 服务器状态已标准化:', normalized);

    // 构造 fullUpdate 格式
    // 注意：运行时间现在通过独立的 runtimeUpdate 事件处理，不再包含在 fullUpdate 中
    const fullUpdatePayload = {
      servers: normalized.servers || {},
      players: normalized.players || { online: '0', currentPlayers: {} },
      isMaintenance: false,
      maintenanceStartTime: null,
      source: connectionName,
      connectionName: connectionName,
    };

    console.log('[MultiMessageRouter] 发送 fullUpdate 事件:', fullUpdatePayload);
    this.eventEmitter.emit('fullUpdate', fullUpdatePayload);
    console.log('[MultiMessageRouter] fullUpdate 事件已发送');
  }

  /**
   * 处理 OmniCore 服务器摘要响应
   */
  private handleOmniCoreServerSummary(message: any, connectionName: string): void {
    console.log('[MultiMessageRouter] OmniCore 服务器摘要:', message);

    // 将摘要转换为服务器数据格式
    const servers: Record<string, any> = {};

    if (message.servers && Array.isArray(message.servers)) {
      message.servers.forEach((server: any) => {
        servers[server.name] = {
          online: server.players_online || 0,
          isOnline: true,
        };
      });
    }

    const fullUpdatePayload = {
      servers: servers,
      players: {
        online: message.total_players?.toString() || '0',
        currentPlayers: {},
      },
      runningTime: 0,
      totalRunningTime: 0,
      isMaintenance: false,
      maintenanceStartTime: null,
      source: connectionName,
      connectionName: connectionName,
    };

    console.log('[MultiMessageRouter] 发送 fullUpdate 事件 (摘要):', fullUpdatePayload);
    this.eventEmitter.emit('fullUpdate', fullUpdatePayload);
    console.log('[MultiMessageRouter] fullUpdate 事件已发送 (摘要)');
  }

  /**
   * 处理 OmniCore 元信息响应
   */
  private handleOmniCoreMetaInfo(message: any, connectionName: string): void {
    console.log('[MultiMessageRouter] OmniCore 元信息响应:', message);

    // 提取运行时间信息
    let runtimeData: any = null;

    if (message.type === 'meta_info_response' && message.runtime) {
      runtimeData = message.runtime;
    } else if (message.type === 'runtime_info_response') {
      runtimeData = {
        current_uptime_seconds: message.current_uptime_seconds,
        current_uptime_formatted: message.current_uptime_formatted,
        total_uptime_seconds: message.total_uptime_seconds,
        total_uptime_formatted: message.total_uptime_formatted,
        start_timestamp: message.start_timestamp,
      };
    }

    // 如果有运行时间数据，发送更新事件
    if (runtimeData) {
      console.log('[MultiMessageRouter] 发送运行时间更新事件:', runtimeData);
      this.eventEmitter.emit('runtimeUpdate', {
        runningTime: runtimeData.current_uptime_seconds,
        totalRunningTime: runtimeData.total_uptime_seconds,
        startTimestamp: runtimeData.start_timestamp,
        source: connectionName,
      });
    }

    // 提取代理统计信息（可用于更新总玩家数等）
    if (message.type === 'meta_info_response' && message.proxy) {
      console.log('[MultiMessageRouter] 代理统计信息:', message.proxy);
      // 可以发送事件更新总玩家数
      this.eventEmitter.emit('proxyStatsUpdate', {
        totalPlayers: message.proxy.total_players,
        maxPlayers: message.proxy.max_players,
        totalServers: message.proxy.total_servers,
        source: connectionName,
      });
    } else if (message.type === 'proxy_stats_response') {
      console.log('[MultiMessageRouter] 代理统计信息:', message);
      this.eventEmitter.emit('proxyStatsUpdate', {
        totalPlayers: message.total_players,
        maxPlayers: message.max_players,
        totalServers: message.total_servers,
        source: connectionName,
      });
    }
  }
}
