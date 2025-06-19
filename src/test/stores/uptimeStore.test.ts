import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useUptimeStore } from '@/stores/uptimeStore';
import { act } from '@testing-library/react';

describe('useUptimeStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    act(() => {
      useUptimeStore.getState().reset();
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应该有正确的初始状态', () => {
    const state = useUptimeStore.getState();
    expect(state.runningTime).toBeNull();
    expect(state.totalRunningTime).toBeNull();
    expect(state.initialRunningTimeSeconds).toBeNull();
    expect(state.initialTotalRunningTimeSeconds).toBeNull();
    expect(state.lastUptimeUpdateTimestamp).toBeNull();
  });

  it('updateRunningTime 应该能更新运行时间', () => {
    act(() => {
      useUptimeStore.getState().updateRunningTime(100, 1000);
    });

    const { runningTime, totalRunningTime } = useUptimeStore.getState();
    expect(runningTime).toBe(100);
    expect(totalRunningTime).toBe(1000);
  });

  it('startRealtimeUptimeTracking 应该能启动时间跟踪', () => {
    const testDate = new Date();
    vi.setSystemTime(testDate);

    act(() => {
      useUptimeStore.getState().updateRunningTime(100, 1000);
      useUptimeStore.getState().startRealtimeUptimeTracking();
    });

    const state = useUptimeStore.getState();
    expect(state.initialRunningTimeSeconds).toBe(100);
    expect(state.initialTotalRunningTimeSeconds).toBe(1000);
    expect(state.lastUptimeUpdateTimestamp).toBe(testDate.getTime());

    // 快进 5 秒
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    const updatedState = useUptimeStore.getState();
    expect(updatedState.runningTime).toBe(105);
    expect(updatedState.totalRunningTime).toBe(1005);
  });

  it('stopRealtimeUptimeTracking 应该能停止时间跟踪', () => {
    act(() => {
      useUptimeStore.getState().updateRunningTime(100, 1000);
      useUptimeStore.getState().startRealtimeUptimeTracking();
    });

    // 快进 2 秒
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(useUptimeStore.getState().runningTime).toBe(102);

    act(() => {
      useUptimeStore.getState().stopRealtimeUptimeTracking();
    });

    const state = useUptimeStore.getState();
    expect(state.initialRunningTimeSeconds).toBeNull();
    expect(state.lastUptimeUpdateTimestamp).toBeNull();

    // 再次快进，时间不应该再更新
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(useUptimeStore.getState().runningTime).toBe(102);
  });

  it('reset 应该能重置 store 并停止任何正在运行的计时器', () => {
    act(() => {
      useUptimeStore.getState().updateRunningTime(100, 1000);
      useUptimeStore.getState().startRealtimeUptimeTracking();
    });

    act(() => {
      useUptimeStore.getState().reset();
    });

    const state = useUptimeStore.getState();
    expect(state.runningTime).toBeNull();
    expect(state.totalRunningTime).toBeNull();

    // 快进时间，确认计时器已停止
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // runningTime 应该保持为 null，而不是从 0 开始增加
    const finalState = useUptimeStore.getState();
    expect(finalState.runningTime).toBeNull();
  });
});
