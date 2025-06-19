import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useConnectionStore } from '@/stores/connectionStore';
import { act } from '@testing-library/react';

describe('useConnectionStore', () => {
  // 在每次测试前重置 store
  beforeEach(() => {
    act(() => {
      useConnectionStore.setState({
        connectionStatus: 'disconnected',
        lastUpdateTime: null,
        isMaintenance: false,
        maintenanceStartTime: null,
        forceShowMaintenance: false,
      });
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应该有正确的初始状态', () => {
    const {
      connectionStatus,
      isMaintenance,
      maintenanceStartTime,
      forceShowMaintenance,
      lastUpdateTime,
    } = useConnectionStore.getState();

    expect(connectionStatus).toBe('disconnected');
    expect(isMaintenance).toBe(false);
    expect(maintenanceStartTime).toBeNull();
    expect(forceShowMaintenance).toBe(false);
    expect(lastUpdateTime).toBeNull();
  });

  it('updateConnectionStatus 应该能正确更新连接状态和最后更新时间', () => {
    const testDate = new Date();
    vi.setSystemTime(testDate);

    act(() => {
      useConnectionStore.getState().updateConnectionStatus('connected');
    });

    const { connectionStatus, lastUpdateTime } = useConnectionStore.getState();
    expect(connectionStatus).toBe('connected');
    expect(lastUpdateTime).toEqual(testDate);
  });

  it('updateMaintenanceStatus 应该能正确更新维护状态', () => {
    const testDate = new Date();
    const maintenanceStartTime = new Date(testDate.getTime() + 1000).toISOString();
    vi.setSystemTime(testDate);

    act(() => {
      useConnectionStore.getState().updateMaintenanceStatus(true, maintenanceStartTime);
    });

    const state = useConnectionStore.getState();
    expect(state.isMaintenance).toBe(true);
    expect(state.maintenanceStartTime).toBe(maintenanceStartTime);
    expect(state.forceShowMaintenance).toBe(false);
    expect(state.lastUpdateTime).toEqual(testDate);
  });

  it('updateMaintenanceStatus 应该能正确处理强制维护模式', () => {
    const testDate = new Date();
    vi.setSystemTime(testDate);

    // 强制开启维护模式，即使第一个参数是 false
    act(() => {
      useConnectionStore.getState().updateMaintenanceStatus(false, null, true);
    });

    const state = useConnectionStore.getState();
    expect(state.isMaintenance).toBe(true); // 因为 force 为 true
    expect(state.forceShowMaintenance).toBe(true);
    expect(state.lastUpdateTime).toEqual(testDate);
  });

  it('updateLastUpdateTime 应该能正确更新最后更新时间', () => {
    const testDate = new Date();
    vi.setSystemTime(testDate);

    act(() => {
      useConnectionStore.getState().updateLastUpdateTime();
    });

    expect(useConnectionStore.getState().lastUpdateTime).toEqual(testDate);
  });
});
