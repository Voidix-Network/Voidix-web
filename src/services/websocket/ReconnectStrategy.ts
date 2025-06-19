import type { WebSocketConfig } from '@/types';

/**
 * WebSocket重连策略
 * 负责管理重连逻辑，包括重连次数、延迟计算和状态管理
 * 实现指数退避算法，支持可配置的重连参数
 */
export class ReconnectStrategy {
  private attempts = 0;
  private config: Required<
    Pick<WebSocketConfig, 'maxReconnectAttempts' | 'reconnectIntervals' | 'disableReconnect'>
  >;

  constructor(
    config: Pick<
      WebSocketConfig,
      'maxReconnectAttempts' | 'reconnectIntervals' | 'disableReconnect'
    >
  ) {
    this.config = {
      maxReconnectAttempts: config.maxReconnectAttempts ?? 10,
      reconnectIntervals: config.reconnectIntervals ?? [1000, 2000, 5000, 10000, 30000],
      disableReconnect: config.disableReconnect ?? false,
    };
  }

  /**
   * 检查是否应该进行重连
   * @returns 是否应该重连
   */
  shouldReconnect(): boolean {
    if (this.config.disableReconnect) {
      return false;
    }

    return this.attempts < this.config.maxReconnectAttempts;
  }

  /**
   * 获取下次重连的延迟时间
   * 使用指数退避算法，支持可配置的延迟序列
   * @returns 延迟时间（毫秒）
   */
  getNextDelay(): number {
    const intervals = this.config.reconnectIntervals;

    // 如果尝试次数超过配置的间隔数组长度，使用最后一个间隔
    const index = Math.min(this.attempts, intervals.length - 1);
    return intervals[index];
  }

  /**
   * 增加重连尝试次数
   * @returns 当前尝试次数
   */
  incrementAttempts(): number {
    this.attempts++;
    return this.attempts;
  }

  /**
   * 重置重连状态
   * 连接成功后应该调用此方法
   */
  reset(): void {
    this.attempts = 0;
  }

  /**
   * 获取当前重连尝试次数
   * @returns 当前尝试次数
   */
  getCurrentAttempts(): number {
    return this.attempts;
  }

  /**
   * 获取最大重连次数
   * @returns 最大重连次数
   */
  getMaxAttempts(): number {
    return this.config.maxReconnectAttempts;
  }

  /**
   * 检查是否已达到最大重连次数
   * @returns 是否已达到最大次数
   */
  isMaxAttemptsReached(): boolean {
    return this.attempts >= this.config.maxReconnectAttempts;
  }

  /**
   * 获取重连进度信息
   * @returns 重连进度对象
   */
  getProgress(): {
    current: number;
    max: number;
    percentage: number;
    nextDelay: number;
    canReconnect: boolean;
  } {
    return {
      current: this.attempts,
      max: this.config.maxReconnectAttempts,
      percentage: (this.attempts / this.config.maxReconnectAttempts) * 100,
      nextDelay: this.getNextDelay(),
      canReconnect: this.shouldReconnect(),
    };
  }

  /**
   * 更新重连配置
   * @param newConfig - 新的配置选项
   */
  updateConfig(
    newConfig: Partial<
      Pick<WebSocketConfig, 'maxReconnectAttempts' | 'reconnectIntervals' | 'disableReconnect'>
    >
  ): void {
    if (newConfig.maxReconnectAttempts !== undefined) {
      this.config.maxReconnectAttempts = newConfig.maxReconnectAttempts;
    }

    if (newConfig.reconnectIntervals !== undefined) {
      this.config.reconnectIntervals = newConfig.reconnectIntervals;
    }

    if (newConfig.disableReconnect !== undefined) {
      this.config.disableReconnect = newConfig.disableReconnect;
    }
  }

  /**
   * 获取当前配置
   * @returns 当前重连配置
   */
  getConfig(): Readonly<typeof this.config> {
    return { ...this.config };
  }

  /**
   * 计算预估的总重连时间
   * @returns 预估总重连时间（毫秒）
   */
  getEstimatedTotalReconnectTime(): number {
    const intervals = this.config.reconnectIntervals;
    let totalTime = 0;

    for (let i = 0; i < this.config.maxReconnectAttempts; i++) {
      const index = Math.min(i, intervals.length - 1);
      totalTime += intervals[index];
    }

    return totalTime;
  }

  /**
   * 生成重连策略的调试信息
   * @returns 调试信息对象
   */
  getDebugInfo(): any {
    return {
      currentAttempts: this.attempts,
      maxAttempts: this.config.maxReconnectAttempts,
      isMaxReached: this.isMaxAttemptsReached(),
      canReconnect: this.shouldReconnect(),
      nextDelay: this.getNextDelay(),
      config: this.config,
      progress: this.getProgress(),
      estimatedTotalTime: this.getEstimatedTotalReconnectTime(),
    };
  }
}
