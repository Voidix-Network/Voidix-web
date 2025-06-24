import type { Notice, NoticeRequest } from '@/types';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { NoticeActions, NoticeState } from './types';

/**
 * 公告数据状态管理Store
 * 支持真正的分页功能，充分利用后端分页API
 */
export const useNoticeStore = create<NoticeState & NoticeActions>()(
  subscribeWithSelector((set, get) => ({
    // 状态
    notices: {},
    isLoading: false,
    error: null,
    lastFetchTime: null,
    currentPage: 1,
    hasMore: true,
    // 新增分页相关状态
    totalPages: 1,
    pageSize: 5,

    // Actions
    setNotices: (notices: Record<string, Notice>) => {
      console.log('[NoticeStore] 设置公告数据:', notices);
      set({
        notices,
        lastFetchTime: Date.now(),
        isLoading: false,
        error: null,
      });
    },

    addNotice: (id: string, notice: Notice) => {
      console.log('[NoticeStore] 添加新公告:', { id, notice });
      set(state => ({
        notices: {
          ...state.notices,
          [id]: notice,
        },
      }));
    },

    removeNotice: (id: string) => {
      console.log('[NoticeStore] 移除公告:', id);
      set(state => {
        const newNotices = { ...state.notices };
        delete newNotices[id];
        return { notices: newNotices };
      });
    },

    setLoading: (loading: boolean) => {
      set({ isLoading: loading });
    },

    setError: (error: string | null) => {
      set({ error, isLoading: false });
    },

    updatePage: (page: number) => {
      set({ currentPage: page });
    },

    setHasMore: (hasMore: boolean) => {
      set({ hasMore });
    },

    reset: () => {
      console.log('[NoticeStore] 重置store状态');
      set({
        notices: {},
        isLoading: false,
        error: null,
        lastFetchTime: null,
        currentPage: 1,
        hasMore: true,
        totalPages: 1,
      });
    },

    // 分页请求公告
    requestNotices: (page: number = 1, counts: number = 5) => {
      console.log('[NoticeStore] 请求公告数据:', { page, counts });

      const request: NoticeRequest = {
        type: 'get_notice',
        page,
        counts,
      };

      // 检查全局WebSocket连接，支持重试
      const checkAndSend = (retryCount = 0) => {
        if (window.voidixWebSocket?.send && typeof window.voidixWebSocket.send === 'function') {
          try {
            window.voidixWebSocket.send(JSON.stringify(request));
            set({
              isLoading: true,
              error: null,
              currentPage: page,
              pageSize: counts,
            });
          } catch (error) {
            console.error('[NoticeStore] 发送公告请求失败:', error);
            set({
              error: '发送公告请求失败',
              isLoading: false,
            });
          }
        } else if (retryCount < 3) {
          // 最多重试3次，每次延迟100ms
          console.warn(`[NoticeStore] WebSocket连接不可用，重试第${retryCount + 1}次...`);
          setTimeout(() => checkAndSend(retryCount + 1), 100);
        } else {
          console.warn('[NoticeStore] WebSocket连接不可用，重试失败');
          set({
            error: 'WebSocket连接不可用',
            isLoading: false,
          });
        }
      };

      checkAndSend();
    },

    // 处理分页公告响应
    handleNoticeResponse: (
      notices: Record<string, Notice>,
      requestedPage: number,
      pageSize: number
    ) => {
      const noticeCount = Object.keys(notices).length;

      // 如果返回的公告数量少于请求的数量，说明这是最后一页
      const isLastPage = noticeCount < pageSize;

      // 更智能的总页数计算
      let estimatedTotalPages: number;
      if (isLastPage) {
        // 如果是最后一页，总页数就是当前页
        estimatedTotalPages = requestedPage;
      } else {
        // 如果不是最后一页，保守估计还有下一页
        const { totalPages: currentTotal } = get();
        // 取当前已知最大页数和请求页数+1的较大值
        estimatedTotalPages = Math.max(currentTotal, requestedPage + 1);
      }

      console.log('[NoticeStore] 处理分页响应:', {
        requestedPage,
        pageSize,
        noticeCount,
        isLastPage,
        estimatedTotalPages,
        currentTotalPages: get().totalPages,
      });

      // 检查页码偏移问题：如果请求的页面没有数据且不是第1页
      if (noticeCount === 0 && requestedPage > 1) {
        console.warn('[NoticeStore] 检测到页码偏移，自动跳转到第1页');
        // 自动跳转到第1页
        setTimeout(() => {
          get().goToPage(1);
        }, 100);
        return;
      }

      set({
        notices,
        currentPage: requestedPage,
        hasMore: !isLastPage,
        totalPages: estimatedTotalPages,
        lastFetchTime: Date.now(),
        isLoading: false,
        error: null,
      });
    },

    // 跳转到指定页
    goToPage: (page: number) => {
      const { pageSize, totalPages, hasMore } = get();

      // 页码范围检查
      if (page < 1) {
        console.warn('[NoticeStore] 页码不能小于1，自动校正为1');
        page = 1;
      }

      // 如果页码超出已知范围且确定没有更多数据
      if (!hasMore && page > totalPages) {
        console.warn(`[NoticeStore] 页码${page}超出范围，自动校正为最后一页${totalPages}`);
        page = totalPages;
      }

      console.log('[NoticeStore] 跳转到页面:', page);
      get().requestNotices(page, pageSize);
    },

    // 下一页
    nextPage: () => {
      const { currentPage, hasMore } = get();
      if (hasMore) {
        get().goToPage(currentPage + 1);
      }
    },

    // 上一页
    prevPage: () => {
      const { currentPage } = get();
      if (currentPage > 1) {
        get().goToPage(currentPage - 1);
      }
    },

    // 刷新当前页
    refreshCurrentPage: () => {
      const { currentPage, pageSize } = get();
      get().requestNotices(currentPage, pageSize);
    },

    // 智能更新：检测是否需要刷新当前页
    smartUpdateNotices: (newNotices: Record<string, Notice>) => {
      console.log('[NoticeStore] 智能更新公告');
      const { currentPage, pageSize } = get();

      // 直接使用新数据，并重新评估分页状态
      get().handleNoticeResponse(newNotices, currentPage, pageSize);
    },

    // 增强版请求（获取更多以检测删除）
    requestNoticesEnhanced: (page: number = 1, counts: number = 10) => {
      console.log('[NoticeStore] 增强版请求:', { page, counts });
      get().requestNotices(page, counts);
    },

    // 调试WebSocket状态
    debugWebSocketStatus: () => {
      const wsStatus = {
        windowExists: typeof window !== 'undefined',
        voidixWebSocketExists: !!window.voidixWebSocket,
        sendExists: !!window.voidixWebSocket?.send,
        sendType: typeof window.voidixWebSocket?.send,
        readyState: window.voidixWebSocket?.readyState,
      };
      console.log('[NoticeStore] WebSocket状态调试:', wsStatus);
      return wsStatus;
    },
  }))
);

// 在开发环境下启用store调试
if (import.meta.env.DEV) {
  useNoticeStore.subscribe(
    state => state,
    state => {
      console.log('[NoticeStore] 状态变更:', {
        noticeCount: Object.keys(state.notices).length,
        isLoading: state.isLoading,
        error: state.error,
        currentPage: state.currentPage,
        totalPages: state.totalPages,
        hasMore: state.hasMore,
      });
    }
  );
}
