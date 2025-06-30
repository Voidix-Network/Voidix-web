import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useUptimeStore } from '../../stores/uptimeStore';

describe('UptimeStore', () => {
  beforeEach(() => {
    // 重置store状态
    useUptimeStore.getState().reset();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('初始状态应该正确', () => {
    const state = useUptimeStore.getState();
    expect(state.runningTime).toBeNull();
    expect(state.totalRunningTime).toBeNull();
    expect(state.initialRunningTimeSeconds).toBeNull();
    expect(state.initialTotalRunningTimeSeconds).toBeNull();
    expect(state.lastUptimeUpdateTimestamp).toBeNull();
  });

  it('updateRunningTime 应该能更新运行时间', () => {
    // 更新运行时间
    useUptimeStore.getState().updateRunningTime(100, 1000);

    const { runningTime, totalRunningTime } = useUptimeStore.getState();
    expect(runningTime).toBe(100);
    expect(totalRunningTime).toBe(1000);
  });

  it('startRealtimeUptimeTracking 应该能启动实时时间跟踪', () => {
    // 先设置基础运行时间
    useUptimeStore.getState().updateRunningTime(100, 1000);

    // 启动实时跟踪
    useUptimeStore.getState().startRealtimeUptimeTracking();

    const state = useUptimeStore.getState();
    expect(state.initialRunningTimeSeconds).toBe(100);
    expect(state.initialTotalRunningTimeSeconds).toBe(1000);
    expect(state.lastUptimeUpdateTimestamp).toBeDefined();

    // 模拟时间流逝
    vi.advanceTimersByTime(5000); // 5秒

    const updatedState = useUptimeStore.getState();
    expect(updatedState.runningTime).toBe(105);
    expect(updatedState.totalRunningTime).toBe(1005);
  });

  it('stopRealtimeUptimeTracking 应该能停止实时时间跟踪', () => {
    useUptimeStore.getState().updateRunningTime(100, 1000);
    useUptimeStore.getState().startRealtimeUptimeTracking();

    // 模拟时间流逝
    vi.advanceTimersByTime(2000); // 2秒
    expect(useUptimeStore.getState().runningTime).toBe(102);

    // 停止跟踪
    useUptimeStore.getState().stopRealtimeUptimeTracking();

    // 继续模拟时间流逝
    vi.advanceTimersByTime(3000); // 再3秒

    // 时间应该不会继续更新，应该停留在停止时的值
    expect(useUptimeStore.getState().runningTime).toBe(102);

    // 基础状态应该被清空
    const state = useUptimeStore.getState();
    expect(state.initialRunningTimeSeconds).toBeNull();
    expect(state.initialTotalRunningTimeSeconds).toBeNull();
    expect(state.lastUptimeUpdateTimestamp).toBeNull();
  });

  it('当连接断开时，时间跟踪应该停止', () => {
    useUptimeStore.getState().updateRunningTime(100, 1000);
    useUptimeStore.getState().startRealtimeUptimeTracking();

    // 模拟时间流逝
    vi.advanceTimersByTime(2000); // 2秒
    expect(useUptimeStore.getState().runningTime).toBe(102);

    // 模拟连接断开 - 停止跟踪
    useUptimeStore.getState().stopRealtimeUptimeTracking();

    // 继续推进时间
    vi.advanceTimersByTime(3000); // 再3秒

    // runningTime 应该保持不变，而不是继续增加
    const finalState = useUptimeStore.getState();
    expect(finalState.runningTime).toBe(102); // 应该停留在断开连接时的值
    expect(finalState.initialRunningTimeSeconds).toBeNull();
    expect(finalState.lastUptimeUpdateTimestamp).toBeNull();
  });

  it('reset 应该能重置所有状态', () => {
    useUptimeStore.getState().updateRunningTime(100, 1000);
    useUptimeStore.getState().startRealtimeUptimeTracking();

    // 重置
    useUptimeStore.getState().reset();

    const state = useUptimeStore.getState();
    expect(state.runningTime).toBeNull();
    expect(state.totalRunningTime).toBeNull();
    expect(state.initialRunningTimeSeconds).toBeNull();
    expect(state.initialTotalRunningTimeSeconds).toBeNull();
    expect(state.lastUptimeUpdateTimestamp).toBeNull();
  });
});
