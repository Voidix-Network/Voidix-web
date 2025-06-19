import { describe, it, expect, beforeEach } from 'vitest';
import { WebSocketEventEmitter } from '@/services/websocket/EventEmitter';

describe('WebSocketEventEmitter', () => {
  let emitter: WebSocketEventEmitter;

  beforeEach(() => {
    emitter = new WebSocketEventEmitter();
  });

  describe('事件监听器管理', () => {
    it('应该能够注册事件监听器', () => {
      const handler = () => {};
      emitter.on('test', handler);

      expect(emitter.hasListeners('test')).toBe(true);
      expect(emitter.getListenerCount('test')).toBe(1);
    });

    it('应该能够注册多个监听器到同一事件', () => {
      const handler1 = () => {};
      const handler2 = () => {};

      emitter.on('test', handler1);
      emitter.on('test', handler2);

      expect(emitter.getListenerCount('test')).toBe(2);
    });

    it('应该能够移除指定的事件监听器', () => {
      const handler1 = () => {};
      const handler2 = () => {};

      emitter.on('test', handler1);
      emitter.on('test', handler2);
      emitter.off('test', handler1);

      expect(emitter.getListenerCount('test')).toBe(1);
    });

    it('应该在移除所有监听器后清理事件', () => {
      const handler = () => {};

      emitter.on('test', handler);
      expect(emitter.hasListeners('test')).toBe(true);

      emitter.off('test', handler);
      expect(emitter.hasListeners('test')).toBe(false);
      expect(emitter.getEventNames()).not.toContain('test');
    });
  });

  describe('事件发射', () => {
    it('应该能够发射事件并调用监听器', () => {
      let called = false;
      let receivedData: any;

      const handler = (data: any) => {
        called = true;
        receivedData = data;
      };

      emitter.on('test', handler);
      emitter.emit('test', { message: 'hello' });

      expect(called).toBe(true);
      expect(receivedData).toEqual({ message: 'hello' });
    });

    it('应该能够调用多个监听器', () => {
      let count = 0;

      const handler1 = () => count++;
      const handler2 = () => count++;

      emitter.on('test', handler1);
      emitter.on('test', handler2);
      emitter.emit('test');

      expect(count).toBe(2);
    });

    it('应该处理监听器中的错误', () => {
      const errorHandler = () => {
        throw new Error('Test error');
      };
      const normalHandler = () => {};

      emitter.on('test', errorHandler);
      emitter.on('test', normalHandler);

      // 应该不会抛出错误
      expect(() => emitter.emit('test')).not.toThrow();
    });

    it('对于没有监听器的事件应该安全处理', () => {
      expect(() => emitter.emit('nonexistent')).not.toThrow();
    });
  });

  describe('事件管理', () => {
    it('应该能够清除所有事件监听器', () => {
      emitter.on('event1', () => {});
      emitter.on('event2', () => {});

      expect(emitter.getEventNames()).toHaveLength(2);

      emitter.clear();

      expect(emitter.getEventNames()).toHaveLength(0);
    });

    it('应该能够清除指定事件的监听器', () => {
      emitter.on('event1', () => {});
      emitter.on('event2', () => {});

      emitter.clearEvent('event1');

      expect(emitter.hasListeners('event1')).toBe(false);
      expect(emitter.hasListeners('event2')).toBe(true);
    });

    it('应该正确返回所有事件名称', () => {
      emitter.on('event1', () => {});
      emitter.on('event2', () => {});
      emitter.on('event3', () => {});

      const eventNames = emitter.getEventNames();
      expect(eventNames).toContain('event1');
      expect(eventNames).toContain('event2');
      expect(eventNames).toContain('event3');
      expect(eventNames).toHaveLength(3);
    });
  });

  describe('状态查询', () => {
    it('应该正确报告监听器数量', () => {
      expect(emitter.getListenerCount('test')).toBe(0);

      emitter.on('test', () => {});
      expect(emitter.getListenerCount('test')).toBe(1);

      emitter.on('test', () => {});
      expect(emitter.getListenerCount('test')).toBe(2);
    });

    it('应该正确检查是否有监听器', () => {
      expect(emitter.hasListeners('test')).toBe(false);

      emitter.on('test', () => {});
      expect(emitter.hasListeners('test')).toBe(true);
    });
  });

  describe('类型安全', () => {
    it('应该支持泛型类型的事件数据', () => {
      interface TestData {
        id: number;
        name: string;
      }

      let receivedData: TestData | undefined;

      emitter.on<TestData>('typed-event', data => {
        receivedData = data;
      });

      const testData: TestData = { id: 1, name: 'test' };
      emitter.emit('typed-event', testData);

      expect(receivedData).toEqual(testData);
    });
  });
});
