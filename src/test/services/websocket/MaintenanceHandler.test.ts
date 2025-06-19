import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MaintenanceHandler } from '@/services/websocket/MaintenanceHandler';
import type { MaintenanceStateChangeData } from '@/services/websocket/types';

describe('MaintenanceHandler', () => {
  let maintenanceHandler: MaintenanceHandler;
  let stateChanges: MaintenanceStateChangeData[];

  beforeEach(() => {
    maintenanceHandler = new MaintenanceHandler();
    stateChanges = [];

    // 监听状态变化
    maintenanceHandler.onStateChange(data => {
      stateChanges.push(data);
    });
  });

  describe('初始状态', () => {
    it('应该以非维护状态开始', () => {
      expect(maintenanceHandler.isMaintenance).toBe(false);
      expect(maintenanceHandler.isForced).toBe(false);
      expect(maintenanceHandler.maintenanceStartTime).toBeNull();

      const state = maintenanceHandler.maintenanceState;
      expect(state).toEqual({
        isMaintenance: false,
        maintenanceStartTime: null,
        forceShowMaintenance: false,
      });
    });
  });

  describe('维护消息处理', () => {
    it('应该处理进入维护模式的消息', () => {
      const result = maintenanceHandler.handleMaintenanceMessage({
        status: true,
        maintenanceStartTime: '2024-01-01T00:00:00Z',
      });

      expect(result.isMaintenance).toBe(true);
      expect(result.forceShowMaintenance).toBe(true);
      expect(result.maintenanceStartTime).toBe('2024-01-01T00:00:00Z');

      expect(maintenanceHandler.isMaintenance).toBe(true);
      expect(maintenanceHandler.isForced).toBe(true);
      expect(maintenanceHandler.maintenanceStartTime).toBe('2024-01-01T00:00:00Z');
    });

    it('应该处理退出维护模式的消息', () => {
      // 先进入维护模式
      maintenanceHandler.handleMaintenanceMessage({ status: true });

      // 再退出维护模式
      const result = maintenanceHandler.handleMaintenanceMessage({
        status: false,
        maintenanceStartTime: null,
      });

      expect(result.isMaintenance).toBe(false);
      expect(result.forceShowMaintenance).toBe(false);
      expect(result.maintenanceStartTime).toBeNull();
    });

    it('应该处理字符串状态值', () => {
      const result = maintenanceHandler.handleMaintenanceMessage({
        status: 'true',
        maintenanceStartTime: '2024-01-01T00:00:00Z',
      });

      expect(result.isMaintenance).toBe(true);
      expect(result.forceShowMaintenance).toBe(true);
    });

    it('应该处理无开始时间的维护消息', () => {
      const result = maintenanceHandler.handleMaintenanceMessage({
        status: true,
      });

      expect(result.isMaintenance).toBe(true);
      expect(result.maintenanceStartTime).toBeNull();
    });
  });

  describe('完整消息处理', () => {
    it('应该处理完整消息中的维护状态', () => {
      const result = maintenanceHandler.handleFullMessage({
        isMaintenance: true,
        maintenanceStartTime: '2024-01-01T00:00:00Z',
      });

      expect(result.isMaintenance).toBe(true);
      expect(result.maintenanceStartTime).toBe('2024-01-01T00:00:00Z');
    });

    it('应该在强制维护模式下忽略完整消息的维护状态', () => {
      // 先强制进入维护模式
      maintenanceHandler.forceMaintenanceMode(true);

      // 处理显示非维护状态的完整消息
      const result = maintenanceHandler.handleFullMessage({
        isMaintenance: false,
        maintenanceStartTime: null,
      });

      // 应该仍然显示维护状态
      expect(result.isMaintenance).toBe(true);
      expect(result.forceShowMaintenance).toBe(true);
    });

    it('应该处理未定义的维护状态', () => {
      const result = maintenanceHandler.handleFullMessage({});

      expect(result.isMaintenance).toBe(false);
    });

    it('应该只在状态变化时触发通知', () => {
      // 第一次处理
      maintenanceHandler.handleFullMessage({
        isMaintenance: true,
        maintenanceStartTime: '2024-01-01T00:00:00Z',
      });

      const initialChangeCount = stateChanges.length;

      // 第二次处理相同状态
      maintenanceHandler.handleFullMessage({
        isMaintenance: true,
        maintenanceStartTime: '2024-01-01T00:00:00Z',
      });

      // 不应该触发新的状态变化
      expect(stateChanges.length).toBe(initialChangeCount);
    });
  });

  describe('强制维护模式', () => {
    it('应该强制进入维护模式', () => {
      const result = maintenanceHandler.forceMaintenanceMode(true);

      expect(result.isMaintenance).toBe(true);
      expect(result.forceShowMaintenance).toBe(true);

      expect(maintenanceHandler.isMaintenance).toBe(true);
      expect(maintenanceHandler.isForced).toBe(true);
    });

    it('应该强制退出维护模式', () => {
      maintenanceHandler.forceMaintenanceMode(true);

      const result = maintenanceHandler.forceMaintenanceMode(false);

      expect(result.isMaintenance).toBe(false);
      expect(result.forceShowMaintenance).toBe(false);

      expect(maintenanceHandler.isMaintenance).toBe(false);
      expect(maintenanceHandler.isForced).toBe(false);
    });
  });

  describe('状态重置', () => {
    it('应该重置所有维护状态', () => {
      // 先设置一些状态
      maintenanceHandler.handleMaintenanceMessage({
        status: true,
        maintenanceStartTime: '2024-01-01T00:00:00Z',
      });
      maintenanceHandler.forceMaintenanceMode(true);

      // 重置状态
      const result = maintenanceHandler.reset();

      expect(result).toEqual({
        isMaintenance: false,
        maintenanceStartTime: null,
        forceShowMaintenance: false,
      });

      expect(maintenanceHandler.isMaintenance).toBe(false);
      expect(maintenanceHandler.isForced).toBe(false);
      expect(maintenanceHandler.maintenanceStartTime).toBeNull();
    });
  });

  describe('状态变化监听', () => {
    it('应该正确跟踪状态变化', () => {
      maintenanceHandler.handleMaintenanceMessage({ status: true });
      maintenanceHandler.forceMaintenanceMode(false);
      maintenanceHandler.reset();

      expect(stateChanges).toHaveLength(3);

      expect(stateChanges[0].source).toBe('message');
      expect(stateChanges[0].currentState.isMaintenance).toBe(true);

      expect(stateChanges[1].source).toBe('force');
      expect(stateChanges[1].currentState.isMaintenance).toBe(false);

      expect(stateChanges[2].source).toBe('reset');
      expect(stateChanges[2].currentState.isMaintenance).toBe(false);
    });

    it('应该支持监听器的添加和移除', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      maintenanceHandler.onStateChange(listener1);
      maintenanceHandler.onStateChange(listener2);

      maintenanceHandler.forceMaintenanceMode(true);

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();

      maintenanceHandler.offStateChange(listener1);
      maintenanceHandler.forceMaintenanceMode(false);

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(2);
    });

    it('应该在监听器出错时继续执行其他监听器', () => {
      const errorListener = vi.fn(() => {
        throw new Error('Listener error');
      });
      const normalListener = vi.fn();

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      maintenanceHandler.onStateChange(errorListener);
      maintenanceHandler.onStateChange(normalListener);

      maintenanceHandler.forceMaintenanceMode(true);

      expect(errorListener).toHaveBeenCalled();
      expect(normalListener).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('调试信息', () => {
    it('应该提供调试信息', () => {
      maintenanceHandler.handleMaintenanceMessage({
        status: true,
        maintenanceStartTime: '2024-01-01T00:00:00Z',
      });

      const listener = vi.fn();
      maintenanceHandler.onStateChange(listener);

      const debugInfo = maintenanceHandler.getDebugInfo();

      expect(debugInfo.state).toEqual({
        isMaintenance: true,
        maintenanceStartTime: '2024-01-01T00:00:00Z',
        forceShowMaintenance: true,
      });
      expect(debugInfo.listenerCount).toBe(2); // 包括测试中的监听器
      expect(debugInfo.timestamp).toBeGreaterThan(0);
    });
  });

  describe('清理', () => {
    it('应该清理所有监听器', () => {
      const listener = vi.fn();
      maintenanceHandler.onStateChange(listener);

      maintenanceHandler.cleanup();

      maintenanceHandler.forceMaintenanceMode(true);

      // 监听器应该已被清理，不会被调用
      expect(listener).not.toHaveBeenCalled();

      const debugInfo = maintenanceHandler.getDebugInfo();
      expect(debugInfo.listenerCount).toBe(0);
    });
  });

  describe('边界情况', () => {
    it('应该处理空的维护消息', () => {
      const result = maintenanceHandler.handleMaintenanceMessage({});

      expect(result.isMaintenance).toBe(false);
      expect(result.forceShowMaintenance).toBe(false);
    });

    it('应该处理无效的状态值', () => {
      const result = maintenanceHandler.handleMaintenanceMessage({
        status: 'invalid' as any,
      });

      expect(result.isMaintenance).toBe(false);
    });

    it('应该处理空的完整消息', () => {
      const result = maintenanceHandler.handleFullMessage({});

      expect(result.isMaintenance).toBe(false);
      expect(result.maintenanceStartTime).toBeNull();
    });
  });
});
