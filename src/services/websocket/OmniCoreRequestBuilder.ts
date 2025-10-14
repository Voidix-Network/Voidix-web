/**
 * OmniCore WebSocket API 请求构造器
 * 根据 OmniCore API 文档构造标准的请求消息
 */

/**
 * 服务器状态查询请求选项
 */
export interface ServerStatusRequestOptions {
  use_cache?: boolean;
  include_players?: boolean;
  include_ping?: boolean;
  timeout?: number;
}

/**
 * 事件订阅过滤器
 */
export interface EventFilter {
  included_fields?: string[];
  excluded_fields?: string[];
  rate_limit_ms?: number;
}

/**
 * 批量订阅事件项
 */
export type BatchSubscribeEventItem =
  | string
  | {
      event_id: string;
      included_fields?: string[];
      excluded_fields?: string[];
      rate_limit_ms?: number;
    };

/**
 * OmniCore API 请求构造器
 */
export class OmniCoreRequestBuilder {
  private static echoCounter = 0;

  /**
   * 生成唯一的 echo 标识符
   */
  private static generateEcho(prefix: string = 'req'): string {
    return `${prefix}_${Date.now()}_${++this.echoCounter}`;
  }

  /**
   * 1.1 查询单个服务器状态
   * @param serverName - 服务器名称
   * @param options - 请求选项
   * @returns JSON 字符串
   */
  static getSingleServerStatus(
    serverName: string,
    options: ServerStatusRequestOptions = {}
  ): string {
    const request = {
      type: 'get_server_status',
      action: 'get_single',
      server_name: serverName,
      echo: this.generateEcho('get_single'),
      use_cache: options.use_cache ?? true,
      include_players: options.include_players ?? true,
      include_ping: options.include_ping ?? true,
    };

    return JSON.stringify(request);
  }

  /**
   * 1.2 批量查询服务器状态
   * @param serverNames - 服务器名称数组
   * @param options - 请求选项
   * @returns JSON 字符串
   */
  static getBatchServerStatus(
    serverNames: string[],
    options: ServerStatusRequestOptions = {}
  ): string {
    const request = {
      type: 'get_server_status',
      action: 'get_batch',
      server_names: serverNames,
      echo: this.generateEcho('get_batch'),
      use_cache: options.use_cache ?? true,
      include_players: options.include_players ?? true,
      timeout: options.timeout ?? 2,
    };

    return JSON.stringify(request);
  }

  /**
   * 1.3 查询所有服务器状态
   * @param options - 请求选项
   * @returns JSON 字符串
   */
  static getAllServerStatus(options: ServerStatusRequestOptions = {}): string {
    const request = {
      type: 'get_server_status',
      action: 'get_all',
      echo: this.generateEcho('get_all'),
      use_cache: options.use_cache ?? false,
      include_players: options.include_players ?? true,
      include_ping: options.include_ping ?? true,
    };

    return JSON.stringify(request);
  }

  /**
   * 1.4 获取服务器摘要信息（轻量级）
   * @returns JSON 字符串
   */
  static getServerSummary(): string {
    const request = {
      type: 'get_server_status',
      action: 'get_summary',
      echo: this.generateEcho('get_summary'),
    };

    return JSON.stringify(request);
  }

  /**
   * 2.1 订阅单个事件
   * @param eventId - 事件ID
   * @param filter - 事件过滤器
   * @returns JSON 字符串
   */
  static subscribeEvent(eventId: string, filter: EventFilter = {}): string {
    const request: any = {
      type: 'subscribe_event',
      action: 'subscribe',
      event_id: eventId,
      echo: this.generateEcho('subscribe'),
    };

    if (filter.included_fields) {
      request.included_fields = filter.included_fields;
    }
    if (filter.excluded_fields) {
      request.excluded_fields = filter.excluded_fields;
    }
    if (filter.rate_limit_ms !== undefined) {
      request.rate_limit_ms = filter.rate_limit_ms;
    }

    return JSON.stringify(request);
  }

  /**
   * 2.2 取消订阅单个事件
   * @param eventId - 事件ID
   * @returns JSON 字符串
   */
  static unsubscribeEvent(eventId: string): string {
    const request = {
      type: 'subscribe_event',
      action: 'unsubscribe',
      event_id: eventId,
      echo: this.generateEcho('unsubscribe'),
    };

    return JSON.stringify(request);
  }

  /**
   * 2.3 批量订阅事件
   * @param eventIds - 事件ID数组或配置对象数组
   * @param globalFilter - 全局过滤器（可选）
   * @returns JSON 字符串
   */
  static batchSubscribeEvents(
    eventIds: BatchSubscribeEventItem[],
    globalFilter: EventFilter = {}
  ): string {
    const request: any = {
      type: 'subscribe_event',
      action: 'batch_subscribe',
      event_ids: eventIds,
      echo: this.generateEcho('batch_subscribe'),
    };

    if (globalFilter.included_fields) {
      request.included_fields = globalFilter.included_fields;
    }
    if (globalFilter.rate_limit_ms !== undefined) {
      request.rate_limit_ms = globalFilter.rate_limit_ms;
    }

    return JSON.stringify(request);
  }

  /**
   * 2.4 批量取消订阅
   * @param eventIds - 事件ID数组
   * @returns JSON 字符串
   */
  static batchUnsubscribeEvents(eventIds: string[]): string {
    const request = {
      type: 'subscribe_event',
      action: 'batch_unsubscribe',
      event_ids: eventIds,
      echo: this.generateEcho('batch_unsubscribe'),
    };

    return JSON.stringify(request);
  }

  /**
   * 2.5 列出所有订阅
   * @returns JSON 字符串
   */
  static listSubscriptions(): string {
    const request = {
      type: 'subscribe_event',
      action: 'list_subscriptions',
      echo: this.generateEcho('list_subscriptions'),
    };

    return JSON.stringify(request);
  }

  /**
   * 2.6 取消所有订阅
   * @returns JSON 字符串
   */
  static unsubscribeAll(): string {
    const request = {
      type: 'subscribe_event',
      action: 'unsubscribe_all',
      echo: this.generateEcho('unsubscribe_all'),
    };

    return JSON.stringify(request);
  }

  /**
   * 2.7 更新事件过滤器
   * @param eventId - 事件ID
   * @param filter - 新的过滤器配置
   * @returns JSON 字符串
   */
  static updateEventFilter(eventId: string, filter: EventFilter): string {
    const request: any = {
      type: 'subscribe_event',
      action: 'update_filter',
      event_id: eventId,
      echo: this.generateEcho('update_filter'),
    };

    if (filter.included_fields) {
      request.included_fields = filter.included_fields;
    }
    if (filter.rate_limit_ms !== undefined) {
      request.rate_limit_ms = filter.rate_limit_ms;
    }

    return JSON.stringify(request);
  }

  /**
   * 3. 元信息 API - 获取所有信息
   * @param options - 请求选项
   * @returns JSON 字符串
   */
  static getMetaInfoAll(options: {
    use_cache?: boolean;
    include_runtime?: boolean;
    include_proxy_stats?: boolean;
  } = {}): string {
    const request = {
      type: 'get_meta_info',
      action: 'get_all',
      echo: this.generateEcho('get_meta_all'),
      use_cache: options.use_cache ?? true,
      include_runtime: options.include_runtime ?? true,
      include_proxy_stats: options.include_proxy_stats ?? true,
    };

    return JSON.stringify(request);
  }

  /**
   * 3.1 元信息 API - 仅获取运行时信息
   * @param use_cache - 是否使用缓存
   * @returns JSON 字符串
   */
  static getMetaInfoRuntime(use_cache: boolean = true): string {
    const request = {
      type: 'get_meta_info',
      action: 'get_runtime',
      echo: this.generateEcho('get_runtime'),
      use_cache,
    };

    return JSON.stringify(request);
  }

  /**
   * 3.2 元信息 API - 仅获取代理统计信息
   * @param use_cache - 是否使用缓存
   * @returns JSON 字符串
   */
  static getMetaInfoProxyStats(use_cache: boolean = true): string {
    const request = {
      type: 'get_meta_info',
      action: 'get_proxy_stats',
      echo: this.generateEcho('get_proxy_stats'),
      use_cache,
    };

    return JSON.stringify(request);
  }
}

