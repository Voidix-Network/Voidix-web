import type { WebSocketMessage } from '@/types';

/**
 * WebSocket消息解析器
 * 负责解析、验证和标准化WebSocket消息
 * 提供纯函数式的消息处理逻辑
 */
export class WebSocketMessageParser {
  /**
   * 解析原始WebSocket消息
   * @param rawData - 原始消息字符串
   * @returns 解析结果对象
   */
  static parse(rawData: string): { success: boolean; data?: WebSocketMessage; error?: string } {
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
        data: parsed as WebSocketMessage,
      };
    } catch (error) {
      console.error('[MessageParser] 消息解析失败:', error, 'Raw data:', rawData);
      return {
        success: false,
        error: `消息解析失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 验证消息格式是否正确
   * @param message - 要验证的消息对象
   * @returns 验证结果
   */
  static validate(message: any): message is WebSocketMessage {
    if (!message || typeof message !== 'object') {
      return false;
    }

    // 检查必需的type字段
    if (!message.type || typeof message.type !== 'string') {
      return false;
    }

    // 根据消息类型进行特定验证
    switch (message.type) {
      case 'full':
        return this.validateFullMessage(message);
      case 'maintenance_status_update':
        return this.validateMaintenanceMessage(message);
      case 'players_update_add':
      case 'players_update_remove':
        return this.validatePlayerUpdateMessage(message);
      case 'server_update':
        return this.validateServerUpdateMessage(message);
      default:
        // 对于未知类型，只要有type字段就认为有效
        return true;
    }
  }

  /**
   * 验证full消息格式
   */
  private static validateFullMessage(message: any): boolean {
    // full消息应该包含servers或players字段
    return !!(message.servers || message.players);
  }

  /**
   * 验证维护状态消息格式
   */
  private static validateMaintenanceMessage(message: any): boolean {
    // 维护消息应该包含status字段
    return message.status !== undefined;
  }

  /**
   * 验证玩家更新消息格式
   */
  private static validatePlayerUpdateMessage(message: any): boolean {
    // 玩家更新消息应该包含player字段
    return !!(message.player && typeof message.player === 'object');
  }

  /**
   * 验证服务器更新消息格式
   */
  private static validateServerUpdateMessage(message: any): boolean {
    // 服务器更新消息应该包含servers字段
    return !!(message.servers && typeof message.servers === 'object');
  }

  /**
   * 标准化服务器数据格式
   * 将不同格式的服务器数据转换为统一格式
   * @param servers - 原始服务器数据
   * @returns 标准化后的服务器数据
   */
  static normalizeServerData(servers: any): Record<string, any> {
    if (!servers || typeof servers !== 'object') {
      return {};
    }

    const normalized: Record<string, any> = {};

    Object.entries(servers).forEach(([serverId, data]) => {
      // 如果值是数字，说明是server_update的简化格式 { serverId: playerCount }
      if (typeof data === 'number') {
        normalized[serverId] = {
          online: data,
          isOnline: true, // server_update消息中出现的服务器都是在线的
        };
      } else if (data && typeof data === 'object') {
        // 已经是完整格式（full消息）
        normalized[serverId] = { ...data };
      } else {
        // 无效数据，跳过
        console.warn('[MessageParser] 跳过无效的服务器数据:', { serverId, data });
      }
    });

    return normalized;
  }

  /**
   * 提取消息中的玩家信息
   * @param message - WebSocket消息
   * @returns 玩家信息对象或null
   */
  static extractPlayerInfo(message: WebSocketMessage): any | null {
    if (message.player && typeof message.player === 'object') {
      return message.player;
    }
    return null;
  }

  /**
   * 检查消息是否包含玩家数据
   * @param message - WebSocket消息
   * @returns 是否包含玩家数据
   */
  static hasPlayerData(message: WebSocketMessage): boolean {
    return !!(
      message.players &&
      message.players.currentPlayers &&
      Object.keys(message.players.currentPlayers).length > 0
    );
  }

  /**
   * 提取消息中的服务器数据
   * @param message - WebSocket消息
   * @returns 服务器数据对象或null
   */
  static extractServerData(message: WebSocketMessage): Record<string, any> | null {
    if (message.servers && typeof message.servers === 'object') {
      return this.normalizeServerData(message.servers);
    }
    return null;
  }

  /**
   * 获取消息的调试信息
   * @param message - WebSocket消息
   * @returns 调试信息对象
   */
  static getDebugInfo(message: WebSocketMessage): any {
    return {
      type: message.type,
      hasServers: !!message.servers,
      hasPlayers: !!message.players,
      hasCurrentPlayers: this.hasPlayerData(message),
      playerInfo: this.extractPlayerInfo(message),
      serverCount: message.servers ? Object.keys(message.servers).length : 0,
      timestamp: new Date().toISOString(),
    };
  }
}
