/**
 * WebSocket事件发射器
 * 负责管理事件监听器的注册、移除和事件分发
 * 从WebSocketService中分离出来的独立模块
 */
export class WebSocketEventEmitter {
  private listeners = new Map<string, Set<Function>>();

  /**
   * 添加事件监听器
   * @param event - 事件名称
   * @param handler - 事件处理函数
   */
  on<T = any>(event: string, handler: (data: T) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  /**
   * 移除事件监听器
   * @param event - 事件名称
   * @param handler - 要移除的事件处理函数
   */
  off(event: string, handler: Function): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler);
      // 如果该事件没有监听器了，清理空的Set
      if (handlers.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * 发射事件
   * @param event - 事件名称
   * @param data - 事件数据
   */
  emit(event: string, data?: any): void {
    const handlers = this.listeners.get(event);
    if (handlers && handlers.size > 0) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[WebSocketEventEmitter] 事件处理器错误 (${event}):`, error);
        }
      });
    }
  }

  /**
   * 清除所有事件监听器
   */
  clear(): void {
    this.listeners.clear();
  }

  /**
   * 清除指定事件的所有监听器
   * @param event - 事件名称
   */
  clearEvent(event: string): void {
    this.listeners.delete(event);
  }

  /**
   * 获取指定事件的监听器数量
   * @param event - 事件名称
   * @returns 监听器数量
   */
  getListenerCount(event: string): number {
    const handlers = this.listeners.get(event);
    return handlers ? handlers.size : 0;
  }

  /**
   * 获取所有已注册的事件名称
   * @returns 事件名称数组
   */
  getEventNames(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * 检查是否有指定事件的监听器
   * @param event - 事件名称
   * @returns 是否有监听器
   */
  hasListeners(event: string): boolean {
    return this.getListenerCount(event) > 0;
  }
}
