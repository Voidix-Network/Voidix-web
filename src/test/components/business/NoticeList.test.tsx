import { NoticeList } from '@/components/business/NoticeList';
import { useWebSocketStatus } from '@/hooks/useWebSocket';
import { useNoticeStore } from '@/stores/noticeStore';
import type { Notice } from '@/types';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@/stores/noticeStore');
vi.mock('@/hooks/useWebSocket');

// Mock the global getState function
const mockGetState = vi.fn();
(useNoticeStore as any).getState = mockGetState;

vi.mock('@/components/ui/Pagination', () => ({
  Pagination: ({ currentPage, totalPages, onPageChange, onPrevious, onNext }: any) => (
    <div data-testid="pagination">
      <button onClick={onPrevious} data-testid="prev-button">
        上一页
      </button>
      <span data-testid="page-info">
        {currentPage} / {totalPages}
      </span>
      <button onClick={onNext} data-testid="next-button">
        下一页
      </button>
      <button onClick={() => onPageChange(1)} data-testid="page-1-button">
        1
      </button>
    </div>
  ),
}));

vi.mock('@/components/business/NoticeCard', () => ({
  NoticeCard: ({ notice }: { notice: Notice & { id: string } }) => (
    <div data-testid={`notice-card-${notice.id}`}>
      <h3>{notice.title}</h3>
      <p>{notice.text}</p>
    </div>
  ),
  NoticeCardSkeleton: () => <div data-testid="notice-skeleton">加载中...</div>,
}));

// Helper function to create WebSocket status mock
const createWebSocketStatusMock = (connectionStatus: any) => ({
  connectionStatus,
  servers: {},
  aggregateStats: { totalPlayers: 0, onlineServers: 0, totalUptime: 0 },
  isMaintenance: false,
  runningTime: 0,
  totalRunningTime: 0,
});

describe('NoticeList', () => {
  const mockUseNoticeStore = vi.mocked(useNoticeStore);
  const mockUseWebSocketStatus = vi.mocked(useWebSocketStatus);

  const defaultStoreState = {
    notices: {},
    isLoading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    pageSize: 5,
    goToPage: vi.fn(),
    nextPage: vi.fn(),
    prevPage: vi.fn(),
    refreshCurrentPage: vi.fn(),
    handleNoticeResponse: vi.fn(),
    setError: vi.fn(),
    debugWebSocketStatus: vi.fn(),
  };

  const defaultWebSocketStatus = {
    connectionStatus: 'connected' as const,
    servers: {},
    aggregateStats: { totalPlayers: 0, onlineServers: 0, totalUptime: 0 },
    isMaintenance: false,
    runningTime: 0,
    totalRunningTime: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseNoticeStore.mockReturnValue(defaultStoreState);
    mockUseWebSocketStatus.mockReturnValue(defaultWebSocketStatus);

    // Mock getState to return the store with lastFetchTime
    mockGetState.mockReturnValue({
      ...defaultStoreState,
      lastFetchTime: Date.now(),
    });

    // Mock window events
    Object.defineProperty(window, 'addEventListener', {
      value: vi.fn(),
      writable: true,
    });
    Object.defineProperty(window, 'removeEventListener', {
      value: vi.fn(),
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('基本渲染', () => {
    it('应该正确渲染公告列表组件', () => {
      render(<NoticeList />);

      expect(screen.getByText('📢 服务器公告')).toBeInTheDocument();
      expect(screen.getByText(/第\s*1\s*页/)).toBeInTheDocument();
    });

    it('应该在showHeader为false时隐藏头部', () => {
      render(<NoticeList showHeader={false} />);

      expect(screen.queryByText('📢 最新公告')).not.toBeInTheDocument();
    });

    it('应该应用自定义className', () => {
      const { container } = render(<NoticeList className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('公告数据显示', () => {
    it('应该显示公告列表', () => {
      const mockNotices: Record<string, Notice> = {
        '1': {
          title: '测试公告1',
          text: '这是第一个测试公告',
          time: Date.now(),
          color: '#3b82f6',
        },
        '2': {
          title: '测试公告2',
          text: '这是第二个测试公告',
          time: Date.now() - 3600000,
          color: '#ef4444',
        },
      };

      mockUseNoticeStore.mockReturnValue({
        ...defaultStoreState,
        notices: mockNotices,
      });

      render(<NoticeList />);

      expect(screen.getByTestId('notice-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('notice-card-2')).toBeInTheDocument();
      expect(screen.getByText('测试公告1')).toBeInTheDocument();
      expect(screen.getByText('测试公告2')).toBeInTheDocument();
    });

    it('应该按ID排序显示公告', () => {
      const mockNotices: Record<string, Notice> = {
        '3': {
          title: '公告3',
          text: '内容3',
          time: Date.now(),
          color: '#000',
        },
        '1': {
          title: '公告1',
          text: '内容1',
          time: Date.now(),
          color: '#000',
        },
        '2': {
          title: '公告2',
          text: '内容2',
          time: Date.now(),
          color: '#000',
        },
      };

      mockUseNoticeStore.mockReturnValue({
        ...defaultStoreState,
        notices: mockNotices,
      });

      render(<NoticeList />);

      const cards = screen.getAllByTestId(/notice-card-/);
      expect(cards[0]).toHaveAttribute('data-testid', 'notice-card-1');
      expect(cards[1]).toHaveAttribute('data-testid', 'notice-card-2');
      expect(cards[2]).toHaveAttribute('data-testid', 'notice-card-3');
    });
  });

  describe('加载状态', () => {
    it('应该在加载时显示骨架屏', () => {
      mockUseNoticeStore.mockReturnValue({
        ...defaultStoreState,
        isLoading: true,
        notices: {},
      });

      render(<NoticeList pageSize={3} />);

      const skeletons = screen.getAllByTestId('notice-skeleton');
      expect(skeletons).toHaveLength(3);
    });

    it('应该在有数据时不显示骨架屏', () => {
      const mockNotices: Record<string, Notice> = {
        '1': {
          title: '测试公告',
          text: '内容',
          time: Date.now(),
          color: '#000',
        },
      };

      mockUseNoticeStore.mockReturnValue({
        ...defaultStoreState,
        isLoading: true,
        notices: mockNotices,
      });

      render(<NoticeList />);

      expect(screen.queryByTestId('notice-skeleton')).not.toBeInTheDocument();
      expect(screen.getByTestId('notice-card-1')).toBeInTheDocument();
    });
  });

  describe('错误状态', () => {
    it('应该显示错误信息', () => {
      mockUseNoticeStore.mockReturnValue({
        ...defaultStoreState,
        error: '网络连接失败',
      });

      render(<NoticeList />);

      expect(screen.getByText('加载公告失败')).toBeInTheDocument();
      expect(screen.getByText('网络连接失败')).toBeInTheDocument();
      expect(screen.getByText('重试')).toBeInTheDocument();
    });

    it('应该在点击重试时调用fetchNotices', () => {
      const mockGoToPage = vi.fn();

      mockUseNoticeStore.mockReturnValue({
        ...defaultStoreState,
        error: '网络错误',
        goToPage: mockGoToPage,
        currentPage: 2,
      });

      // Ensure connected status for retry button to work
      mockUseWebSocketStatus.mockReturnValue(defaultWebSocketStatus);

      render(<NoticeList />);

      fireEvent.click(screen.getByText('重试'));

      expect(mockGoToPage).toHaveBeenCalledWith(2);
    });

    it('应该在未连接时禁用重试按钮', () => {
      mockUseNoticeStore.mockReturnValue({
        ...defaultStoreState,
        error: '网络错误',
      });

      mockUseWebSocketStatus.mockReturnValue(createWebSocketStatusMock('disconnected'));

      render(<NoticeList />);

      const retryButton = screen.getByText('重试');
      expect(retryButton).toBeDisabled();
    });
  });

  describe('空状态', () => {
    it('应该显示无公告的空状态', () => {
      mockUseWebSocketStatus.mockReturnValue(defaultWebSocketStatus);

      render(<NoticeList />);

      expect(screen.getByText('暂无公告')).toBeInTheDocument();
      expect(screen.getByText('当前没有可显示的公告信息')).toBeInTheDocument();
    });

    it('应该在非第一页显示不同的空状态文案', () => {
      mockUseNoticeStore.mockReturnValue({
        ...defaultStoreState,
        currentPage: 3,
      });

      mockUseWebSocketStatus.mockReturnValue(defaultWebSocketStatus);

      render(<NoticeList />);

      expect(screen.getByText('当前页面没有公告')).toBeInTheDocument();
    });

    it('应该在未连接时显示等待连接文案', () => {
      mockUseWebSocketStatus.mockReturnValue(createWebSocketStatusMock('disconnected'));

      render(<NoticeList />);

      expect(screen.getByText('等待连接到服务器...')).toBeInTheDocument();
    });

    it('应该在连接状态下显示刷新按钮', () => {
      const mockRefreshCurrentPage = vi.fn();

      mockUseNoticeStore.mockReturnValue({
        ...defaultStoreState,
        refreshCurrentPage: mockRefreshCurrentPage,
      });

      mockUseWebSocketStatus.mockReturnValue(defaultWebSocketStatus);

      render(<NoticeList />);

      fireEvent.click(screen.getByText('刷新页面'));

      expect(mockRefreshCurrentPage).toHaveBeenCalled();
    });
  });

  describe('分页功能', () => {
    it('应该在多页时显示分页组件', () => {
      mockUseNoticeStore.mockReturnValue({
        ...defaultStoreState,
        currentPage: 2,
        totalPages: 5,
      });

      render(<NoticeList />);

      expect(screen.getByTestId('pagination')).toBeInTheDocument();
      expect(screen.getByTestId('page-info')).toHaveTextContent('2 / 5');
    });

    it('应该在单页时隐藏分页组件', () => {
      mockUseNoticeStore.mockReturnValue({
        ...defaultStoreState,
        currentPage: 1,
        totalPages: 1,
      });

      render(<NoticeList />);

      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });

    it('应该处理分页操作', () => {
      const mockGoToPage = vi.fn();
      const mockNextPage = vi.fn();
      const mockPrevPage = vi.fn();

      mockUseNoticeStore.mockReturnValue({
        ...defaultStoreState,
        currentPage: 2,
        totalPages: 5,
        goToPage: mockGoToPage,
        nextPage: mockNextPage,
        prevPage: mockPrevPage,
      });

      render(<NoticeList />);

      fireEvent.click(screen.getByTestId('next-button'));
      expect(mockNextPage).toHaveBeenCalled();

      fireEvent.click(screen.getByTestId('prev-button'));
      expect(mockPrevPage).toHaveBeenCalled();

      fireEvent.click(screen.getByTestId('page-1-button'));
      expect(mockGoToPage).toHaveBeenCalledWith(1);
    });
  });

  describe('连接状态管理', () => {
    it('应该在连接状态下请求数据', async () => {
      const mockGoToPage = vi.fn();

      mockUseNoticeStore.mockReturnValue({
        ...defaultStoreState,
        goToPage: mockGoToPage,
        notices: {}, // 确保notices为空，触发请求条件
      });

      // 确保连接状态为connected
      mockUseWebSocketStatus.mockReturnValue({
        ...defaultWebSocketStatus,
        connectionStatus: 'connected',
      });

      // 确保getState返回没有lastFetchTime或者很久之前的时间戳
      mockGetState.mockReturnValue({
        ...defaultStoreState,
        lastFetchTime: null, // 或者 Date.now() - 10000 表示10秒前
        notices: {},
      });

      render(<NoticeList />);

      // 使用更长的超时时间，因为组件有防重复请求的逻辑
      await waitFor(
        () => {
          expect(mockGoToPage).toHaveBeenCalledWith(1);
        },
        { timeout: 5000 }
      );
    });

    it('应该在未连接时不请求数据', () => {
      const mockGoToPage = vi.fn();

      mockUseNoticeStore.mockReturnValue({
        ...defaultStoreState,
        goToPage: mockGoToPage,
      });

      mockUseWebSocketStatus.mockReturnValue(createWebSocketStatusMock('disconnected'));

      render(<NoticeList />);

      expect(mockGoToPage).not.toHaveBeenCalled();
    });
  });

  describe('头部操作', () => {
    it('应该显示刷新和调试按钮', () => {
      const mockRefreshCurrentPage = vi.fn();
      const mockDebugWebSocketStatus = vi.fn();

      mockUseNoticeStore.mockReturnValue({
        ...defaultStoreState,
        refreshCurrentPage: mockRefreshCurrentPage,
        debugWebSocketStatus: mockDebugWebSocketStatus,
      });

      mockUseWebSocketStatus.mockReturnValue(defaultWebSocketStatus);

      render(<NoticeList />);

      expect(screen.getByText('刷新')).toBeInTheDocument();

      // 调试按钮应该只在开发环境显示，这里我们不能直接测试
      // 因为在测试环境中 import.meta.env.DEV 可能不是 true
    });

    it('应该在加载时禁用刷新按钮', () => {
      mockUseNoticeStore.mockReturnValue({
        ...defaultStoreState,
        isLoading: true,
      });

      render(<NoticeList />);

      const refreshButton = screen.getByText('刷新中...');
      expect(refreshButton).toBeDisabled();
    });

    it('应该在断开连接时隐藏操作按钮', () => {
      mockUseWebSocketStatus.mockReturnValue(createWebSocketStatusMock('disconnected'));

      render(<NoticeList />);

      expect(screen.queryByText('刷新')).not.toBeInTheDocument();
    });
  });

  describe('WebSocket事件处理', () => {
    it('应该注册WebSocket事件监听器', () => {
      const mockAddEventListener = vi.fn();
      window.addEventListener = mockAddEventListener;

      render(<NoticeList />);

      expect(mockAddEventListener).toHaveBeenCalledWith('noticeReturn', expect.any(Function));
      expect(mockAddEventListener).toHaveBeenCalledWith('noticeUpdate', expect.any(Function));
      expect(mockAddEventListener).toHaveBeenCalledWith('noticeError', expect.any(Function));
    });

    it('应该在组件卸载时移除事件监听器', () => {
      const mockRemoveEventListener = vi.fn();
      window.removeEventListener = mockRemoveEventListener;

      const { unmount } = render(<NoticeList />);
      unmount();

      expect(mockRemoveEventListener).toHaveBeenCalledWith('noticeReturn', expect.any(Function));
      expect(mockRemoveEventListener).toHaveBeenCalledWith('noticeUpdate', expect.any(Function));
      expect(mockRemoveEventListener).toHaveBeenCalledWith('noticeError', expect.any(Function));
    });
  });
});
