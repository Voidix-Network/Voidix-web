import { useWebSocketStatus } from '@/hooks/useWebSocket';
import { useNoticeStore } from '@/stores';
import React, { useCallback, useEffect } from 'react';
import { Pagination } from '../ui/Pagination';
import { NoticeCard, NoticeCardSkeleton } from './NoticeCard';

interface NoticeListProps {
  className?: string;
  pageSize?: number; // 每页显示数量
  showHeader?: boolean;
}

/**
 * 公告列表组件
 * 使用真正的分页功能，保持页面切换时的视觉稳定性
 */
export const NoticeList: React.FC<NoticeListProps> = ({
  className = '',
  pageSize = 5,
  showHeader = true,
}) => {
  const {
    notices,
    isLoading,
    error,
    currentPage,
    totalPages,
    hasMore,
    totalCount,
    goToPage,
    nextPage,
    prevPage,
    refreshCurrentPage,
    handleNoticeResponse,
    setError,
    debugWebSocketStatus,
  } = useNoticeStore();

  const { connectionStatus } = useWebSocketStatus();

  // 转换公告数据为数组并按时间降序排序（最新的在前面）
  const noticeList = Object.entries(notices)
    .map(([id, notice]) => ({ id, ...notice }))
    .sort((a, b) => {
      // 按时间降序排序（时间越大越新，排在前面）
      return b.time - a.time;
    });

  // 获取公告数据
  const fetchNotices = useCallback(
    (page: number = currentPage) => {
      if (connectionStatus === 'connected') {
        goToPage(page);
      }
    },
    [connectionStatus, goToPage, currentPage]
  );

  // 处理WebSocket消息
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleNoticeReturn = (event: CustomEvent) => {
      const { notices: newNotices, error_msg, notice_total_count } = event.detail;

      console.log('[NoticeList] 收到公告返回事件:', {
        noticesCount: newNotices ? Object.keys(newNotices).length : 0,
        notice_total_count,
        currentPage,
        pageSize,
        error_msg,
      });

      if (error_msg) {
        setError(error_msg);
        return;
      }

      if (newNotices) {
        // 使用新的处理方法，传递总数用于精确分页计算
        console.log('[NoticeList] 调用handleNoticeResponse:', {
          newNotices,
          currentPage,
          pageSize,
          notice_total_count,
        });
        handleNoticeResponse(newNotices, currentPage, pageSize, notice_total_count);
      }
    };

    const handleNoticeUpdate = (event: CustomEvent) => {
      const { type, data } = event.detail;

      console.log('[NoticeList] 收到公告更新:', type, data);

      // 无论是新增还是删除，都刷新当前页（添加防抖）
      if (type === 'notice_update_add_respond' || type === 'notice_update_remove_respond') {
        console.log('[NoticeList] 公告有变化，延迟刷新当前页');
        // 延迟刷新，避免频繁更新导致的重复请求
        setTimeout(() => {
          const noticeStore = useNoticeStore.getState();
          const now = Date.now();
          // 只有距离上次请求超过1秒才刷新
          if (!noticeStore.lastFetchTime || now - noticeStore.lastFetchTime > 1000) {
            refreshCurrentPage();
          }
        }, 500);
      }
    };

    const handleNoticeError = (event: CustomEvent) => {
      const { error } = event.detail;
      setError(error);
    };

    // 监听WebSocket事件
    window.addEventListener('noticeReturn', handleNoticeReturn as EventListener);
    window.addEventListener('noticeUpdate', handleNoticeUpdate as EventListener);
    window.addEventListener('noticeError', handleNoticeError as EventListener);

    return () => {
      window.removeEventListener('noticeReturn', handleNoticeReturn as EventListener);
      window.removeEventListener('noticeUpdate', handleNoticeUpdate as EventListener);
      window.removeEventListener('noticeError', handleNoticeError as EventListener);
    };
  }, [handleNoticeResponse, setError, currentPage, pageSize, refreshCurrentPage]);

  // 连接成功后请求第一页公告（添加防重复请求机制）
  useEffect(() => {
    if (connectionStatus === 'connected' && Object.keys(notices).length === 0) {
      // 检查是否刚刚请求过（避免快速重复请求）
      const now = Date.now();
      const noticeStore = useNoticeStore.getState();
      if (!noticeStore.lastFetchTime || now - noticeStore.lastFetchTime > 3000) {
        console.log('[NoticeList] 连接成功，首次请求公告');
        fetchNotices(1);
      } else {
        console.log('[NoticeList] 连接成功，但最近已请求过，跳过重复请求');
      }
    }
  }, [connectionStatus, notices, fetchNotices]);

  // 页面切换处理
  const handlePageChange = (page: number) => {
    // 如果页码发生了大幅变化，给用户一个提示
    if (Math.abs(page - currentPage) > 3) {
      console.log(`[NoticeList] 页码大幅变化：从第${currentPage}页跳转到第${page}页`);
    }
    goToPage(page);
  };

  return (
    <div className={`${className}`}>
      {/* 固定的标题区域 - 位置保持不变 */}
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-white">📢 服务器公告</h2>
            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
              第 {currentPage} 页
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {connectionStatus === 'connected' && (
              <>
                <button
                  onClick={refreshCurrentPage}
                  className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                  disabled={isLoading}
                  title="刷新当前页"
                >
                  {isLoading ? '刷新中...' : '刷新'}
                </button>
                {/* 调试按钮仅在开发环境显示 */}
                {import.meta.env.DEV && (
                  <>
                    <button
                      onClick={debugWebSocketStatus}
                      className="text-yellow-400 hover:text-yellow-300 text-xs transition-colors"
                      title="调试WebSocket状态"
                    >
                      调试WS
                    </button>
                    <button
                      onClick={() => {
                        console.log('[NoticeList] 当前分页状态调试:', {
                          currentPage,
                          totalPages,
                          hasMore,
                          noticeCount: Object.keys(notices).length,
                          totalCount,
                          isLoading,
                          error,
                          pageSize,
                        });
                        alert(
                          `分页状态: ${currentPage}/${totalPages}, 公告数: ${Object.keys(notices).length}, 总数: ${totalCount}, hasMore: ${hasMore}`
                        );
                      }}
                      className="text-green-400 hover:text-green-300 text-xs transition-colors"
                      title="调试分页状态"
                    >
                      调试分页
                    </button>
                  </>
                )}
              </>
            )}
            <div
              className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}
            />
          </div>
        </div>
      )}

      {/* 动态内容区域 - 高度可变，但基准位置固定 */}
      <div className="relative">
        {/* 错误状态 */}
        {error ? (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <svg
                className="w-5 h-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-red-400 font-medium">加载公告失败</span>
            </div>
            <p className="text-red-300 text-sm mb-4">{error}</p>
            <button
              onClick={() => fetchNotices(currentPage)}
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
              disabled={connectionStatus !== 'connected'}
            >
              重试
            </button>
          </div>
        ) : (
          <>
            {/* 加载状态 */}
            {isLoading && noticeList.length === 0 ? (
              <div className="space-y-4">
                {Array.from({ length: pageSize }, (_, i) => (
                  <NoticeCardSkeleton key={i} />
                ))}
              </div>
            ) : noticeList.length > 0 ? (
              /* 公告列表 */
              <div className="space-y-4">
                {noticeList.map(notice => (
                  <NoticeCard key={notice.id} notice={notice} />
                ))}
              </div>
            ) : (
              /* 空状态 */
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-500 mb-2">暂无公告</h3>
                  <p className="text-sm text-gray-600">
                    {connectionStatus !== 'connected'
                      ? '等待连接到服务器...'
                      : currentPage === 1
                        ? '当前没有可显示的公告信息'
                        : '当前页面没有公告'}
                  </p>
                </div>
                {connectionStatus === 'connected' && (
                  <button
                    onClick={refreshCurrentPage}
                    className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                    disabled={isLoading}
                  >
                    刷新页面
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* 分页控件 - 根据内容位置自然对齐 */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasMore={hasMore}
            isLoading={isLoading}
            onPageChange={handlePageChange}
            onPrevious={prevPage}
            onNext={nextPage}
          />
        </div>
      )}
    </div>
  );
};
