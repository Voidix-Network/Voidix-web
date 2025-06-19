import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { UptimeState, UptimeActions } from './types';

/**
 * 运行时间初始状态
 */
const initialUptimeState: UptimeState = {
  runningTime: null,
  totalRunningTime: null,
  initialRunningTimeSeconds: null,
  initialTotalRunningTimeSeconds: null,
  lastUptimeUpdateTimestamp: null,
};

/**
 * 运行时间管理器类
 * 负责管理定时器的创建和清理，防止内存泄漏
 */
class UptimeManager {
  private static instance: UptimeManager;
  private intervalId: NodeJS.Timeout | null = null;

  static getInstance(): UptimeManager {
    if (!UptimeManager.instance) {
      UptimeManager.instance = new UptimeManager();
    }
    return UptimeManager.instance;
  }

  /**
   * 启动定时器
   * @param callback - 更新回调函数
   */
  start(callback: () => void) {
    this.stop(); // 确保清理现有定时器
    this.intervalId = setInterval(callback, 1000);

    if (import.meta.env.DEV) {
      console.log('[UptimeManager] 实时运行时间跟踪已启动');
    }
  }

  /**
   * 停止定时器
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;

      if (import.meta.env.DEV) {
        console.log('[UptimeManager] 实时运行时间跟踪已停止');
      }
    }
  }

  /**
   * 检查是否正在运行
   */
  isRunning(): boolean {
    return this.intervalId !== null;
  }

  /**
   * 清理资源（用于组件卸载时）
   */
  cleanup() {
    this.stop();
  }
}

/**
 * 运行时间管理Store
 * 负责管理服务器运行时间和实时时间跟踪
 * 修复了原有的内存泄漏问题
 */
export const useUptimeStore = create<UptimeState & UptimeActions>()(
  subscribeWithSelector((set, get) => ({
    ...initialUptimeState,

    /**
     * 更新运行时间
     * @param runningTime - 当前运行时间（秒）
     * @param totalRunningTime - 总运行时间（秒）
     */
    updateRunningTime: (runningTime: number, totalRunningTime: number) => {
      set({
        runningTime,
        totalRunningTime,
      });
    },

    /**
     * 启动实时运行时间跟踪
     * 使用单例模式的UptimeManager确保只有一个定时器运行
     */
    startRealtimeUptimeTracking: () => {
      const state = get();
      const manager = UptimeManager.getInstance();

      // 如果已经在运行，先停止
      if (manager.isRunning()) {
        manager.stop();
      }

      // 初始化基准时间
      const initialRunningTimeSeconds = state.runningTime || 0;
      const initialTotalRunningTimeSeconds = state.totalRunningTime || 0;
      const lastUptimeUpdateTimestamp = Date.now();

      set({
        initialRunningTimeSeconds,
        initialTotalRunningTimeSeconds,
        lastUptimeUpdateTimestamp,
      });

      // 启动定时器，每秒更新运行时间
      manager.start(() => {
        const currentState = get();

        if (
          currentState.initialRunningTimeSeconds === null ||
          currentState.lastUptimeUpdateTimestamp === null
        ) {
          if (import.meta.env.DEV) {
            console.warn('[UptimeStore] 定时器运行但基准时间未设置，停止跟踪');
          }
          manager.stop();
          return;
        }

        // 计算经过的秒数
        const elapsedSeconds = Math.floor(
          (Date.now() - currentState.lastUptimeUpdateTimestamp) / 1000
        );
        const currentRunningTime = currentState.initialRunningTimeSeconds + elapsedSeconds;
        const currentTotalRunningTime =
          (currentState.initialTotalRunningTimeSeconds || 0) + elapsedSeconds;

        set({
          runningTime: currentRunningTime,
          totalRunningTime: currentTotalRunningTime,
        });
      });
    },

    /**
     * 停止实时运行时间跟踪
     * 清理定时器和相关状态
     */
    stopRealtimeUptimeTracking: () => {
      const manager = UptimeManager.getInstance();
      manager.stop();

      set({
        initialRunningTimeSeconds: null,
        initialTotalRunningTimeSeconds: null,
        lastUptimeUpdateTimestamp: null,
      });
    },

    /**
     * 重置运行时间状态
     * 确保清理所有定时器
     */
    reset: () => {
      const manager = UptimeManager.getInstance();
      manager.cleanup();
      set(initialUptimeState);
    },
  }))
);

/**
 * 便捷的Hook - 获取运行时间信息
 */
export const useRunningTime = () =>
  useUptimeStore(state => ({
    runningTime: state.runningTime,
    totalRunningTime: state.totalRunningTime,
  }));

/**
 * 便捷的Hook - 检查是否正在实时跟踪
 */
export const useIsUptimeTracking = () =>
  useUptimeStore(
    state => state.initialRunningTimeSeconds !== null && state.lastUptimeUpdateTimestamp !== null
  );

/**
 * 全局清理函数
 * 在应用卸载时调用以确保资源清理
 */
export const cleanupUptimeTracking = () => {
  const manager = UptimeManager.getInstance();
  manager.cleanup();
};
