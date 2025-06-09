/**
 * WebSocket Mock类
 * 模拟WebSocket API的完整功能用于测试
 */
export class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  url: string;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  private static instances: MockWebSocket[] = [];
  private autoConnectTimeout?: NodeJS.Timeout;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);

    // 模拟异步连接 - 但可以被控制
    this.autoConnectTimeout = setTimeout(() => {
      if (this.readyState === MockWebSocket.CONNECTING) {
        this.simulateOpen();
      }
    }, 10);
  }

  send(_data: string): void {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    // 在测试中可以监听发送的数据
  }

  close(code?: number, reason?: string): void {
    if (this.autoConnectTimeout) {
      clearTimeout(this.autoConnectTimeout);
    }
    if (this.readyState === MockWebSocket.OPEN || this.readyState === MockWebSocket.CONNECTING) {
      this.readyState = MockWebSocket.CLOSING;
      setTimeout(() => {
        this.simulateClose(code || 1000, reason || 'Normal closure');
      }, 10);
    }
  }

  // 测试辅助方法
  preventAutoConnect(): void {
    if (this.autoConnectTimeout) {
      clearTimeout(this.autoConnectTimeout);
    }
  }

  // 测试辅助方法
  simulateOpen(): void {
    this.readyState = MockWebSocket.OPEN;
    if (this.onopen) {
      this.onopen(new Event('open'));
    }
  }

  simulateClose(code: number = 1000, reason: string = ''): void {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      const closeEvent = new MockCloseEvent('close', { code, reason });
      this.onclose(closeEvent as any);
    }
  }

  simulateError(): void {
    if (this.onerror) {
      this.onerror(new Event('error'));
    }
  }

  simulateMessage(data: any): void {
    if (this.readyState === MockWebSocket.OPEN && this.onmessage) {
      const messageEvent = new MessageEvent('message', {
        data: typeof data === 'string' ? data : JSON.stringify(data),
      });
      this.onmessage(messageEvent);
    }
  }

  // 静态方法用于测试控制
  static getLastInstance(): MockWebSocket | undefined {
    return this.instances[this.instances.length - 1];
  }

  static clearInstances(): void {
    this.instances = [];
  }

  static getAllInstances(): MockWebSocket[] {
    return [...this.instances];
  }
}

/**
 * CloseEvent Mock
 * jsdom环境可能缺少CloseEvent的完整实现
 */
export class MockCloseEvent extends Event {
  code: number;
  reason: string;
  wasClean: boolean;

  constructor(
    type: string,
    eventInitDict?: { code?: number; reason?: string; wasClean?: boolean }
  ) {
    super(type);
    this.code = eventInitDict?.code || 1000;
    this.reason = eventInitDict?.reason || '';
    this.wasClean = eventInitDict?.wasClean || true;
  }
}

/**
 * 初始化WebSocket Mock
 * 替换全局WebSocket和CloseEvent
 */
export const initializeWebSocketMocks = () => {
  // Mock WebSocket
  global.WebSocket = MockWebSocket as any;

  // Mock CloseEvent
  global.CloseEvent = MockCloseEvent as any;

  // 设置常量（通过Object.defineProperty避免只读属性错误）
  Object.defineProperty(global.WebSocket, 'CONNECTING', {
    value: MockWebSocket.CONNECTING,
    writable: false,
  });
  Object.defineProperty(global.WebSocket, 'OPEN', { value: MockWebSocket.OPEN, writable: false });
  Object.defineProperty(global.WebSocket, 'CLOSING', {
    value: MockWebSocket.CLOSING,
    writable: false,
  });
  Object.defineProperty(global.WebSocket, 'CLOSED', {
    value: MockWebSocket.CLOSED,
    writable: false,
  });

  console.log('✅ WebSocket Mock初始化完成');
};
