import { describe, it, expect, beforeEach } from 'vitest';
import { ReconnectStrategy } from '@/services/websocket/ReconnectStrategy';

describe('ReconnectStrategy', () => {
  let strategy: ReconnectStrategy;

  beforeEach(() => {
    strategy = new ReconnectStrategy({
      maxReconnectAttempts: 5,
      reconnectIntervals: [1000, 2000, 5000],
      disableReconnect: false,
    });
  });

  describe('重连判断', () => {
    it('应该在未达到最大次数时允许重连', () => {
      expect(strategy.shouldReconnect()).toBe(true);
    });

    it('应该在达到最大次数时拒绝重连', () => {
      // 增加尝试次数到最大值
      for (let i = 0; i < 5; i++) {
        strategy.incrementAttempts();
      }

      expect(strategy.shouldReconnect()).toBe(false);
      expect(strategy.isMaxAttemptsReached()).toBe(true);
    });

    it('应该在禁用重连时拒绝重连', () => {
      const disabledStrategy = new ReconnectStrategy({
        maxReconnectAttempts: 5,
        reconnectIntervals: [1000],
        disableReconnect: true,
      });

      expect(disabledStrategy.shouldReconnect()).toBe(false);
    });
  });

  describe('延迟计算', () => {
    it('应该根据尝试次数返回正确的延迟', () => {
      expect(strategy.getNextDelay()).toBe(1000); // 第0次

      strategy.incrementAttempts();
      expect(strategy.getNextDelay()).toBe(2000); // 第1次

      strategy.incrementAttempts();
      expect(strategy.getNextDelay()).toBe(5000); // 第2次
    });

    it('应该在超出配置数组时使用最后一个延迟值', () => {
      // 增加尝试次数超过配置数组长度
      strategy.incrementAttempts(); // 1
      strategy.incrementAttempts(); // 2
      strategy.incrementAttempts(); // 3

      expect(strategy.getNextDelay()).toBe(5000); // 应该使用最后一个值
    });
  });

  describe('状态管理', () => {
    it('应该正确跟踪尝试次数', () => {
      expect(strategy.getCurrentAttempts()).toBe(0);

      strategy.incrementAttempts();
      expect(strategy.getCurrentAttempts()).toBe(1);

      strategy.incrementAttempts();
      expect(strategy.getCurrentAttempts()).toBe(2);
    });

    it('应该能够重置状态', () => {
      strategy.incrementAttempts();
      strategy.incrementAttempts();

      expect(strategy.getCurrentAttempts()).toBe(2);

      strategy.reset();

      expect(strategy.getCurrentAttempts()).toBe(0);
      expect(strategy.shouldReconnect()).toBe(true);
    });

    it('incrementAttempts应该返回当前尝试次数', () => {
      const firstIncrement = strategy.incrementAttempts();
      expect(firstIncrement).toBe(1);

      const secondIncrement = strategy.incrementAttempts();
      expect(secondIncrement).toBe(2);
    });
  });

  describe('配置管理', () => {
    it('应该能够更新配置', () => {
      strategy.updateConfig({
        maxReconnectAttempts: 10,
        reconnectIntervals: [500, 1000],
      });

      expect(strategy.getMaxAttempts()).toBe(10);
      expect(strategy.getNextDelay()).toBe(500);
    });

    it('应该返回当前配置的副本', () => {
      const config = strategy.getConfig();

      expect(config.maxReconnectAttempts).toBe(5);
      expect(config.reconnectIntervals).toEqual([1000, 2000, 5000]);
      expect(config.disableReconnect).toBe(false);

      // 配置应该是只读的，修改不应该影响原配置
      expect(strategy.getMaxAttempts()).toBe(5);
    });

    it('应该支持部分配置更新', () => {
      strategy.updateConfig({ maxReconnectAttempts: 8 });

      expect(strategy.getMaxAttempts()).toBe(8);
      expect(strategy.getConfig().reconnectIntervals).toEqual([1000, 2000, 5000]); // 保持不变
    });
  });

  describe('进度信息', () => {
    it('应该提供准确的进度信息', () => {
      strategy.incrementAttempts();
      strategy.incrementAttempts();

      const progress = strategy.getProgress();

      expect(progress.current).toBe(2);
      expect(progress.max).toBe(5);
      expect(progress.percentage).toBe(40);
      expect(progress.nextDelay).toBe(5000);
      expect(progress.canReconnect).toBe(true);
    });

    it('应该在达到最大次数时显示正确的进度', () => {
      for (let i = 0; i < 5; i++) {
        strategy.incrementAttempts();
      }

      const progress = strategy.getProgress();

      expect(progress.current).toBe(5);
      expect(progress.max).toBe(5);
      expect(progress.percentage).toBe(100);
      expect(progress.canReconnect).toBe(false);
    });
  });

  describe('时间估算', () => {
    it('应该计算正确的总重连时间', () => {
      const totalTime = strategy.getEstimatedTotalReconnectTime();

      // 5次重连: 1000 + 2000 + 5000 + 5000 + 5000 = 18000ms
      expect(totalTime).toBe(18000);
    });

    it('应该处理不同配置的时间估算', () => {
      const shortStrategy = new ReconnectStrategy({
        maxReconnectAttempts: 2,
        reconnectIntervals: [1000, 2000],
      });

      const totalTime = shortStrategy.getEstimatedTotalReconnectTime();

      // 2次重连: 1000 + 2000 = 3000ms
      expect(totalTime).toBe(3000);
    });
  });

  describe('调试信息', () => {
    it('应该提供完整的调试信息', () => {
      strategy.incrementAttempts();

      const debugInfo = strategy.getDebugInfo();

      expect(debugInfo).toMatchObject({
        currentAttempts: 1,
        maxAttempts: 5,
        isMaxReached: false,
        canReconnect: true,
        nextDelay: 2000,
      });

      expect(debugInfo.config).toBeDefined();
      expect(debugInfo.progress).toBeDefined();
      expect(debugInfo.estimatedTotalTime).toBe(18000);
    });
  });

  describe('边界情况', () => {
    it('应该处理零最大重连次数', () => {
      const noReconnectStrategy = new ReconnectStrategy({
        maxReconnectAttempts: 0,
        reconnectIntervals: [1000],
      });

      expect(noReconnectStrategy.shouldReconnect()).toBe(false);
      expect(noReconnectStrategy.isMaxAttemptsReached()).toBe(true);
    });

    it('应该处理空的重连间隔数组', () => {
      expect(() => {
        new ReconnectStrategy({
          maxReconnectAttempts: 3,
          reconnectIntervals: [],
        });
      }).not.toThrow();
    });

    it('应该处理单个重连间隔', () => {
      const singleIntervalStrategy = new ReconnectStrategy({
        maxReconnectAttempts: 3,
        reconnectIntervals: [5000],
      });

      expect(singleIntervalStrategy.getNextDelay()).toBe(5000);

      singleIntervalStrategy.incrementAttempts();
      expect(singleIntervalStrategy.getNextDelay()).toBe(5000);

      singleIntervalStrategy.incrementAttempts();
      expect(singleIntervalStrategy.getNextDelay()).toBe(5000);
    });
  });

  describe('默认配置', () => {
    it('应该使用合理的默认值', () => {
      const defaultStrategy = new ReconnectStrategy({
        maxReconnectAttempts: 10,
        reconnectIntervals: [1000, 2000, 5000, 10000, 30000],
      });

      expect(defaultStrategy.getMaxAttempts()).toBe(10);
      expect(defaultStrategy.getConfig().reconnectIntervals).toEqual([
        1000, 2000, 5000, 10000, 30000,
      ]);
      expect(defaultStrategy.getConfig().disableReconnect).toBe(false);
    });
  });
});
