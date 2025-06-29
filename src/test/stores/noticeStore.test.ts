import { useNoticeStore } from '@/stores/noticeStore';
import type { Notice } from '@/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock window object
const mockWebSocket = {
  send: vi.fn(),
  readyState: 1, // WebSocket.OPEN
};

Object.defineProperty(window, 'voidixWebSocket', {
  value: mockWebSocket,
  writable: true,
  configurable: true,
});

describe('NoticeStore', () => {
  beforeEach(() => {
    // 重置store状态
    useNoticeStore.getState().reset();
    // 清除mock调用记录
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('基本状态管理', () => {
    it('应该有正确的初始状态', () => {
      const state = useNoticeStore.getState();

      expect(state.notices).toEqual({});
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
      expect(state.lastFetchTime).toBe(null);
      expect(state.currentPage).toBe(1);
      expect(state.hasMore).toBe(true);
      expect(state.totalPages).toBe(1);
      expect(state.pageSize).toBe(5);
      expect(state.totalCount).toBeUndefined();
    });

    it('应该能够设置公告数据', () => {
      const mockNotices: Record<string, Notice> = {
        '1': {
          title: '测试公告1',
          text: '这是一个测试公告',
          time: Date.now(),
          color: '#3b82f6',
        },
        '2': {
          title: '测试公告2',
          text: '这是另一个测试公告',
          time: Date.now() - 3600000,
          color: '#ef4444',
        },
      };

      useNoticeStore.getState().setNotices(mockNotices);
      const state = useNoticeStore.getState();

      expect(state.notices).toEqual(mockNotices);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
      expect(state.lastFetchTime).toBeTruthy();
    });

    it('应该能够添加单个公告', () => {
      const notice: Notice = {
        title: '新公告',
        text: '新公告内容',
        time: Date.now(),
        color: '#10b981',
      };

      useNoticeStore.getState().addNotice('3', notice);
      const state = useNoticeStore.getState();

      expect(state.notices['3']).toEqual(notice);
    });

    it('应该能够删除公告', () => {
      // 先添加一个公告
      const notice: Notice = {
        title: '要删除的公告',
        text: '内容',
        time: Date.now(),
        color: '#8b5cf6',
      };

      useNoticeStore.getState().addNotice('4', notice);
      expect(useNoticeStore.getState().notices['4']).toEqual(notice);

      // 删除公告
      useNoticeStore.getState().removeNotice('4');
      expect(useNoticeStore.getState().notices['4']).toBeUndefined();
    });

    it('应该能够设置加载状态', () => {
      useNoticeStore.getState().setLoading(true);
      expect(useNoticeStore.getState().isLoading).toBe(true);

      useNoticeStore.getState().setLoading(false);
      expect(useNoticeStore.getState().isLoading).toBe(false);
    });

    it('应该能够设置错误状态', () => {
      const errorMessage = '网络错误';

      useNoticeStore.getState().setError(errorMessage);
      const state = useNoticeStore.getState();

      expect(state.error).toBe(errorMessage);
      expect(state.isLoading).toBe(false);

      // 清除错误
      useNoticeStore.getState().setError(null);
      expect(useNoticeStore.getState().error).toBe(null);
    });

    it('应该能够重置状态', () => {
      // 先设置一些状态
      useNoticeStore
        .getState()
        .setNotices({ '1': { title: '测试', text: '内容', time: Date.now(), color: '#000' } });
      useNoticeStore.getState().setLoading(true);
      useNoticeStore.getState().setError('错误');
      useNoticeStore.getState().updatePage(3);

      // 重置
      useNoticeStore.getState().reset();
      const state = useNoticeStore.getState();

      expect(state.notices).toEqual({});
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
      expect(state.currentPage).toBe(1);
      expect(state.hasMore).toBe(true);
      expect(state.totalPages).toBe(1);
      expect(state.totalCount).toBeUndefined();
    });
  });

  describe('分页功能', () => {
    it('应该能够更新页码', () => {
      useNoticeStore.getState().updatePage(2);
      expect(useNoticeStore.getState().currentPage).toBe(2);
    });

    it('应该能够设置hasMore状态', () => {
      useNoticeStore.getState().setHasMore(false);
      expect(useNoticeStore.getState().hasMore).toBe(false);
    });

    it('应该能够设置总公告数', () => {
      useNoticeStore.getState().setTotalCount(10);
      expect(useNoticeStore.getState().totalCount).toBe(10);

      useNoticeStore.getState().setTotalCount(25);
      expect(useNoticeStore.getState().totalCount).toBe(25);
    });

    it('应该能够跳转到指定页面', () => {
      useNoticeStore.getState().goToPage(3);

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'get_notice',
          page: 3,
          counts: 5,
        })
      );
    });

    it('应该能够跳转到下一页', () => {
      // 设置hasMore为true
      useNoticeStore.getState().setHasMore(true);
      useNoticeStore.getState().updatePage(2);

      useNoticeStore.getState().nextPage();

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'get_notice',
          page: 3,
          counts: 5,
        })
      );
    });

    it('应该在没有更多页面时禁止跳转下一页', () => {
      useNoticeStore.getState().setHasMore(false);
      useNoticeStore.getState().updatePage(3);

      useNoticeStore.getState().nextPage();

      // 不应该发送请求
      expect(mockWebSocket.send).not.toHaveBeenCalled();
    });

    it('应该能够跳转到上一页', () => {
      useNoticeStore.getState().updatePage(3);

      useNoticeStore.getState().prevPage();

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'get_notice',
          page: 2,
          counts: 5,
        })
      );
    });

    it('应该在第一页时禁止跳转上一页', () => {
      useNoticeStore.getState().updatePage(1);

      useNoticeStore.getState().prevPage();

      // 不应该发送请求
      expect(mockWebSocket.send).not.toHaveBeenCalled();
    });

    it('应该能够刷新当前页', () => {
      useNoticeStore.getState().updatePage(2);

      useNoticeStore.getState().refreshCurrentPage();

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'get_notice',
          page: 2,
          counts: 5,
        })
      );
    });
  });

  describe('WebSocket 请求', () => {
    it('应该能够请求公告数据', () => {
      useNoticeStore.getState().requestNotices(1, 10);

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'get_notice',
          page: 1,
          counts: 10,
        })
      );

      const state = useNoticeStore.getState();
      expect(state.isLoading).toBe(true);
      expect(state.error).toBe(null);
      expect(state.currentPage).toBe(1);
      expect(state.pageSize).toBe(10);
    });

    it('应该在WebSocket不可用时设置错误', async () => {
      // 临时移除WebSocket
      const originalWS = window.voidixWebSocket;
      delete (window as any).voidixWebSocket;

      useNoticeStore.getState().requestNotices(1, 5);

      // 等待重试逻辑完成
      await new Promise(resolve => setTimeout(resolve, 400));

      const state = useNoticeStore.getState();
      expect(state.error).toBe('WebSocket连接不可用');
      expect(state.isLoading).toBe(false);

      // 恢复WebSocket
      window.voidixWebSocket = originalWS;
    });

    it('应该处理WebSocket发送错误', () => {
      mockWebSocket.send.mockImplementation(() => {
        throw new Error('发送失败');
      });

      useNoticeStore.getState().requestNotices(1, 5);

      const state = useNoticeStore.getState();
      expect(state.error).toBe('发送公告请求失败');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('响应处理', () => {
    it('应该正确处理分页响应', () => {
      const mockNotices: Record<string, Notice> = {
        '1': { title: '公告1', text: '内容1', time: Date.now(), color: '#000' },
        '2': { title: '公告2', text: '内容2', time: Date.now(), color: '#000' },
      };

      useNoticeStore.getState().handleNoticeResponse(mockNotices, 1, 5);

      const state = useNoticeStore.getState();
      expect(state.notices).toEqual(mockNotices);
      expect(state.currentPage).toBe(1);
      expect(state.hasMore).toBe(false); // 返回了2个，小于pageSize(5)，所以是最后一页
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('应该检测最后一页', () => {
      const mockNotices: Record<string, Notice> = {
        '1': { title: '公告1', text: '内容1', time: Date.now(), color: '#000' },
        '2': { title: '公告2', text: '内容2', time: Date.now(), color: '#000' },
      };

      useNoticeStore.getState().handleNoticeResponse(mockNotices, 2, 5);

      const state = useNoticeStore.getState();
      expect(state.hasMore).toBe(false);
      expect(state.totalPages).toBe(2);
    });

    it('应该处理空页面状态重置', async () => {
      // 先设置一个非第1页的状态
      useNoticeStore.getState().updatePage(2);

      // 处理空响应
      useNoticeStore.getState().handleNoticeResponse({}, 2, 5);

      const state = useNoticeStore.getState();
      // 验证状态被重置为第1页，但不发起新请求
      expect(state.currentPage).toBe(1);
      expect(state.notices).toEqual({});
      expect(state.hasMore).toBe(false);
      expect(state.totalPages).toBe(1);
    });

    it('应该使用精确总数计算分页', () => {
      const mockNotices: Record<string, Notice> = {
        '1': { title: '公告1', text: '内容1', time: Date.now(), color: '#000' },
        '2': { title: '公告2', text: '内容2', time: Date.now(), color: '#000' },
        '3': { title: '公告3', text: '内容3', time: Date.now(), color: '#000' },
      };

      // 使用精确总数（比如有6个公告，每页5个，应该有2页）
      useNoticeStore.getState().handleNoticeResponse(mockNotices, 1, 5, 6);

      const state = useNoticeStore.getState();
      expect(state.notices).toEqual(mockNotices);
      expect(state.currentPage).toBe(1);
      expect(state.totalPages).toBe(2); // Math.ceil(6 / 5) = 2
      expect(state.hasMore).toBe(true); // 第1页，还有第2页
      expect(state.isLoading).toBe(false);
    });

    it('应该使用存储的总数计算分页', () => {
      // 先设置总数
      useNoticeStore.getState().setTotalCount(8);

      const mockNotices: Record<string, Notice> = {
        '1': { title: '公告1', text: '内容1', time: Date.now(), color: '#000' },
        '2': { title: '公告2', text: '内容2', time: Date.now(), color: '#000' },
      };

      // 不传递精确总数，应该使用存储的总数
      useNoticeStore.getState().handleNoticeResponse(mockNotices, 1, 5);

      const state = useNoticeStore.getState();
      expect(state.totalPages).toBe(2); // Math.ceil(8 / 5) = 2
      expect(state.hasMore).toBe(true);
    });
  });

  describe('调试功能', () => {
    it('应该返回WebSocket调试信息', () => {
      const debugInfo = useNoticeStore.getState().debugWebSocketStatus();

      expect(debugInfo).toMatchObject({
        windowExists: true,
        voidixWebSocketExists: true,
        sendExists: true,
        sendType: 'function',
        readyState: 1,
      });
    });
  });

  describe('智能更新', () => {
    it('应该能够智能更新公告', () => {
      const mockNotices: Record<string, Notice> = {
        '1': { title: '更新后的公告', text: '新内容', time: Date.now(), color: '#000' },
      };

      useNoticeStore.getState().updatePage(2);
      useNoticeStore.getState().smartUpdateNotices(mockNotices);

      const state = useNoticeStore.getState();
      expect(state.notices).toEqual(mockNotices);
      expect(state.currentPage).toBe(2);
    });
  });
});
