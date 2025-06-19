/**
 * 维护状态信息
 */
export interface MaintenanceState {
  isMaintenance: boolean;
  maintenanceStartTime: string | null;
  forceShowMaintenance: boolean;
}

/**
 * 维护状态变化事件数据
 */
export interface MaintenanceStateChangeData {
  previousState: MaintenanceState;
  currentState: MaintenanceState;
  timestamp: number;
  source: 'message' | 'force' | 'reset';
}

/**
 * 维护模式处理器
 * 专门负责维护状态的管理和处理
 * 包括强制维护模式、状态跟踪和事件通知
 */
export class MaintenanceHandler {
  private state: MaintenanceState = {
    isMaintenance: false,
    maintenanceStartTime: null,
    forceShowMaintenance: false,
  };

  private stateChangeListeners: Array<(data: MaintenanceStateChangeData) => void> = [];

  constructor() {
    console.log('[MaintenanceHandler] 初始化维护处理器');
  }

  /**
   * 处理维护状态更新消息
   */
  handleMaintenanceMessage(data: {
    status?: boolean | string;
    maintenanceStartTime?: string | null;
  }): MaintenanceState {
    const isEnteringMaintenance = data.status === true || data.status === 'true';

    console.log('[MaintenanceHandler] 处理维护状态消息:', {
      status: data.status,
      isEnteringMaintenance,
      startTime: data.maintenanceStartTime,
    });

    const previousState = { ...this.state };

    // 更新维护状态
    if (isEnteringMaintenance) {
      this.state.forceShowMaintenance = true;
      this.state.isMaintenance = true;
    } else {
      this.state.forceShowMaintenance = false;
      this.state.isMaintenance = false;
    }

    // 更新维护开始时间
    this.state.maintenanceStartTime = data.maintenanceStartTime || null;

    // 触发状态变化事件
    this.notifyStateChange(previousState, 'message');

    return { ...this.state };
  }

  /**
   * 处理完整消息中的维护状态
   */
  handleFullMessage(data: {
    isMaintenance?: boolean;
    maintenanceStartTime?: string | null;
  }): MaintenanceState {
    const previousState = { ...this.state };

    // 如果有强制维护标记，优先使用强制状态
    if (this.state.forceShowMaintenance) {
      this.state.isMaintenance = true;
    } else {
      // 否则使用消息中的维护状态
      this.state.isMaintenance =
        typeof data.isMaintenance === 'boolean' ? data.isMaintenance : false;
    }

    // 更新维护开始时间
    if (data.maintenanceStartTime !== undefined) {
      this.state.maintenanceStartTime = data.maintenanceStartTime;
    }

    console.log('[MaintenanceHandler] 处理完整消息维护状态:', {
      fromMessage: data.isMaintenance,
      forceShow: this.state.forceShowMaintenance,
      final: this.state.isMaintenance,
      startTime: this.state.maintenanceStartTime,
    });

    // 如果状态有变化，触发通知
    if (this.hasStateChanged(previousState, this.state)) {
      this.notifyStateChange(previousState, 'message');
    }

    return { ...this.state };
  }

  /**
   * 强制设置维护模式
   */
  forceMaintenanceMode(force: boolean): MaintenanceState {
    const previousState = { ...this.state };

    this.state.forceShowMaintenance = force;
    this.state.isMaintenance = force;

    console.log('[MaintenanceHandler] 强制维护模式:', {
      force,
      previousState: previousState.isMaintenance,
      currentState: this.state.isMaintenance,
    });

    this.notifyStateChange(previousState, 'force');

    return { ...this.state };
  }

  /**
   * 重置维护状态
   */
  reset(): MaintenanceState {
    const previousState = { ...this.state };

    this.state = {
      isMaintenance: false,
      maintenanceStartTime: null,
      forceShowMaintenance: false,
    };

    console.log('[MaintenanceHandler] 重置维护状态');

    this.notifyStateChange(previousState, 'reset');

    return { ...this.state };
  }

  /**
   * 检查状态是否发生变化
   */
  private hasStateChanged(previous: MaintenanceState, current: MaintenanceState): boolean {
    return (
      previous.isMaintenance !== current.isMaintenance ||
      previous.maintenanceStartTime !== current.maintenanceStartTime ||
      previous.forceShowMaintenance !== current.forceShowMaintenance
    );
  }

  /**
   * 通知状态变化
   */
  private notifyStateChange(
    previousState: MaintenanceState,
    source: MaintenanceStateChangeData['source']
  ): void {
    const changeData: MaintenanceStateChangeData = {
      previousState,
      currentState: { ...this.state },
      timestamp: Date.now(),
      source,
    };

    this.stateChangeListeners.forEach(listener => {
      try {
        listener(changeData);
      } catch (error) {
        console.error('[MaintenanceHandler] 状态变化监听器错误:', error);
      }
    });
  }

  /**
   * 添加状态变化监听器
   */
  onStateChange(listener: (data: MaintenanceStateChangeData) => void): void {
    this.stateChangeListeners.push(listener);
  }

  /**
   * 移除状态变化监听器
   */
  offStateChange(listener: (data: MaintenanceStateChangeData) => void): void {
    const index = this.stateChangeListeners.indexOf(listener);
    if (index !== -1) {
      this.stateChangeListeners.splice(index, 1);
    }
  }

  /**
   * 获取当前维护状态
   */
  get maintenanceState(): MaintenanceState {
    return { ...this.state };
  }

  /**
   * 检查是否处于维护模式
   */
  get isMaintenance(): boolean {
    return this.state.isMaintenance;
  }

  /**
   * 检查是否强制维护模式
   */
  get isForced(): boolean {
    return this.state.forceShowMaintenance;
  }

  /**
   * 获取维护开始时间
   */
  get maintenanceStartTime(): string | null {
    return this.state.maintenanceStartTime;
  }

  /**
   * 生成维护状态的调试信息
   */
  getDebugInfo(): {
    state: MaintenanceState;
    listenerCount: number;
    timestamp: number;
  } {
    return {
      state: { ...this.state },
      listenerCount: this.stateChangeListeners.length,
      timestamp: Date.now(),
    };
  }

  /**
   * 清理所有监听器
   */
  cleanup(): void {
    this.stateChangeListeners = [];
    console.log('[MaintenanceHandler] 清理完成');
  }
}
