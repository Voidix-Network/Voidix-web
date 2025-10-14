/**
 * OmniCore WebSocket API 消息解析器
 * 处理 OmniCore API 的各种响应消息
 */

/**
 * OmniCore 消息基础接口
 */
export interface OmniCoreBaseMessage {
  type: string;
  echo?: string;
  timestamp?: number;
  success?: boolean;
  error?: string;
  code?: number;
}

/**
 * 服务器状态响应
 */
export interface ServerStatusResponse extends OmniCoreBaseMessage {
  type: 'server_status_response';
  name?: string;
  players_count?: number;
  players?: Array<{ name: string; uuid: string }>;
  online?: boolean;
  ping?: {
    version?: string;
    protocol?: number;
    players?: {
      online: number;
      max: number;
    };
  };
}

/**
 * 批量服务器状态响应
 */
export interface BatchServerStatusResponse extends OmniCoreBaseMessage {
  type: 'batch_server_status_response';
  servers: Array<{
    name: string;
    players_count?: number;
    online?: boolean;
    error?: string;
  }>;
  total: number;
}

/**
 * 所有服务器状态响应（get_all）
 */
export interface AllServersStatusResponse extends OmniCoreBaseMessage {
  type: 'server_status_response';
  servers: Array<{
    name: string;
    players_count: number;
    online: boolean;
    ping?: any;
  }>;
  player: {
    current: number;
    max: number;
  };
  total_servers: number;
}

/**
 * 服务器摘要响应
 */
export interface ServerSummaryResponse extends OmniCoreBaseMessage {
  type: 'server_summary_response';
  servers: Array<{
    name: string;
    players_online: number;
  }>;
  total_players: number;
  total_servers: number;
}

/**
 * 事件回调消息
 */
export interface EventCallMessage extends OmniCoreBaseMessage {
  type: 'event_call';
  event_id: 'player_join' | 'player_quit' | 'player_switch_server';
  event_data: {
    name?: string;
    uuid?: string;
    last_server?: string;
    new_server?: string;
  };
}

/**
 * 订阅响应
 */
export interface SubscribeResponse extends OmniCoreBaseMessage {
  type: 'subscribe_response';
  event_id: string;
  message: string;
  filter_applied?: boolean;
}

/**
 * 批量订阅响应
 */
export interface BatchSubscribeResponse extends OmniCoreBaseMessage {
  type: 'batch_subscribe_response';
  subscribed: string[];
  subscribed_count: number;
  failed: string[];
  failed_count: number;
  total: number;
}

/**
 * 错误消息
 */
export interface ErrorMessage extends OmniCoreBaseMessage {
  type: string; // 各种错误类型
  error: string;
  code: number;
}

/**
 * 元信息响应 - 完整信息
 */
export interface MetaInfoResponse extends OmniCoreBaseMessage {
  type: 'meta_info_response';
  runtime?: {
    current_uptime_seconds: number;
    current_uptime_formatted: string;
    total_uptime_seconds: number;
    total_uptime_formatted: string;
    start_timestamp: number;
  };
  proxy?: {
    total_players: number;
    max_players: number;
    total_servers: number;
    servers_with_players: number;
    players_on_servers: number;
  };
}

/**
 * 运行时信息响应
 */
export interface RuntimeInfoResponse extends OmniCoreBaseMessage {
  type: 'runtime_info_response';
  current_uptime_seconds: number;
  current_uptime_formatted: string;
  total_uptime_seconds: number;
  total_uptime_formatted: string;
  start_timestamp: number;
}

/**
 * 代理统计信息响应
 */
export interface ProxyStatsResponse extends OmniCoreBaseMessage {
  type: 'proxy_stats_response';
  total_players: number;
  max_players: number;
  total_servers: number;
  servers_with_players: number;
  players_on_servers: number;
}

/**
 * OmniCore 消息解析器
 */
export class OmniCoreMessageParser {
  /**
   * 解析原始消息
   */
  static parse(rawData: string): { success: boolean; data?: OmniCoreBaseMessage; error?: string } {
    try {
      const parsed = JSON.parse(rawData);

      if (!this.validate(parsed)) {
        return {
          success: false,
          error: '消息格式验证失败',
        };
      }

      return {
        success: true,
        data: parsed as OmniCoreBaseMessage,
      };
    } catch (error) {
      console.error('[OmniCoreMessageParser] 消息解析失败:', error, 'Raw data:', rawData);
      return {
        success: false,
        error: `消息解析失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 验证消息格式
   */
  static validate(message: any): message is OmniCoreBaseMessage {
    if (!message || typeof message !== 'object') {
      return false;
    }

    // 检查 type 字段（或者 packet_id 用于错误消息）
    if (!message.type && !message.packet_id) {
      return false;
    }

    // 如果是 packet_id，规范化为 type
    if (message.packet_id && !message.type) {
      message.type = message.packet_id;
    }

    if (typeof message.type !== 'string') {
      return false;
    }

    return true;
  }

  /**
   * 判断是否为错误消息
   */
  static isErrorMessage(message: OmniCoreBaseMessage): message is ErrorMessage {
    return (
      message.type.includes('error') ||
      (message.success === false && !!message.error) ||
      !!message.code
    );
  }

  /**
   * 判断是否为事件回调消息
   */
  static isEventCall(message: OmniCoreBaseMessage): message is EventCallMessage {
    return message.type === 'event_call';
  }

  /**
   * 判断是否为服务器状态响应
   */
  static isServerStatusResponse(
    message: OmniCoreBaseMessage
  ): message is ServerStatusResponse | AllServersStatusResponse {
    return message.type === 'server_status_response';
  }

  /**
   * 判断是否为批量服务器状态响应
   */
  static isBatchServerStatusResponse(
    message: OmniCoreBaseMessage
  ): message is BatchServerStatusResponse {
    return message.type === 'batch_server_status_response';
  }

  /**
   * 判断是否为服务器摘要响应
   */
  static isServerSummaryResponse(
    message: OmniCoreBaseMessage
  ): message is ServerSummaryResponse {
    return message.type === 'server_summary_response';
  }

  /**
   * 判断是否为订阅相关响应
   */
  static isSubscribeResponse(message: OmniCoreBaseMessage): boolean {
    return (
      message.type === 'subscribe_response' ||
      message.type === 'unsubscribe_response' ||
      message.type === 'batch_subscribe_response' ||
      message.type === 'batch_unsubscribe_response' ||
      message.type === 'list_subscriptions_response' ||
      message.type === 'unsubscribe_all_response' ||
      message.type === 'update_filter_response'
    );
  }

  /**
   * 判断是否为元信息响应
   */
  static isMetaInfoResponse(message: OmniCoreBaseMessage): boolean {
    return (
      message.type === 'meta_info_response' ||
      message.type === 'runtime_info_response' ||
      message.type === 'proxy_stats_response'
    );
  }

  /**
   * 将 OmniCore 服务器状态转换为内部格式
   */
  static normalizeServerStatus(response: ServerStatusResponse | AllServersStatusResponse): any {
    if ('servers' in response && Array.isArray(response.servers)) {
      // get_all 响应 - 多个服务器
      const serversMap: Record<string, any> = {};

      response.servers.forEach(server => {
        serversMap[server.name] = {
          online: server.players_count || 0,
          isOnline: server.online === true, // 严格检查 online 字段
          ping: server.ping,
          max: server.ping?.players?.max || 0,
        };
      });

      return {
        servers: serversMap,
        players: {
          online: response.player?.current?.toString() || '0',
          max: response.player?.max || 10000,
        },
        total_servers: response.total_servers,
      };
    } else if ('name' in response) {
      // get_single 响应 - 单个服务器
      return {
        servers: {
          [response.name!]: {
            online: response.players_count || 0,
            isOnline: response.online === true, // 严格检查 online 字段
            players: response.players || [],
            ping: response.ping,
            max: response.ping?.players?.max || 0,
          },
        },
      };
    }

    return null;
  }

  /**
   * 将事件回调转换为内部格式
   */
  static normalizeEventCall(event: EventCallMessage): any {
    switch (event.event_id) {
      case 'player_join':
        return {
          type: 'players_update_add',
          player: {
            uuid: event.event_data.uuid,
            name: event.event_data.name,
            currentServer: event.event_data.new_server || 'unknown',
          },
        };

      case 'player_quit':
        return {
          type: 'players_update_remove',
          player: {
            uuid: event.event_data.uuid,
            name: event.event_data.name,
          },
        };

      case 'player_switch_server':
        return {
          type: 'server_update',
          player: {
            uuid: event.event_data.uuid,
            name: event.event_data.name,
            previousServer: event.event_data.last_server,
            newServer: event.event_data.new_server,
          },
        };

      default:
        return null;
    }
  }

  /**
   * 获取调试信息
   */
  static getDebugInfo(message: OmniCoreBaseMessage): any {
    return {
      type: message.type,
      echo: message.echo,
      timestamp: message.timestamp,
      success: message.success,
      isError: this.isErrorMessage(message),
      isEventCall: this.isEventCall(message),
      time: new Date().toISOString(),
    };
  }
}

