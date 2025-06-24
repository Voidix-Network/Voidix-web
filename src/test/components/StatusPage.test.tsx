import { StatusPage } from '@/pages/StatusPage';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Test helper to provide necessary context
const renderWithHelmet = (component: React.ReactElement) => {
  return render(<HelmetProvider>{component}</HelmetProvider>);
};

// Mock dependencies
vi.mock('@/hooks/useWebSocket', () => ({
  useWebSocketStatus: vi.fn(),
}));

vi.mock('@/utils', () => ({
  formatRunningTime: vi.fn(
    time => `${Math.floor(time / 3600)}h ${Math.floor((time % 3600) / 60)}m`
  ),
  calculateGroupStats: vi.fn((_servers, _allServers) => ({
    totalPlayers: 15,
    onlineServers: 2,
    totalServers: 3,
  })),
}));

vi.mock('@/constants', () => ({
  SERVER_DISPLAY_NAMES: {
    survival: '生存服务器',
    creative: '创造服务器',
    lobby: '大厅服务器',
  },
  SERVER_GROUPS: {
    main: {
      name: '主要服务器',
      servers: ['survival', 'creative'],
      color: 'blue',
    },
    other: {
      name: '其他服务器',
      servers: ['lobby'],
      color: 'green',
    },
  },
  LOGO_ASSETS: {
    PWA_ICON: '/android-chrome-512x512.png',
    BRAND_LOGO: '/logo.png',
    SEO_IMAGE: '/logo.png',
  },
  getPageSEOConfig: vi.fn(pageKey => ({
    title: `测试页面 - ${pageKey}`,
    description: '测试描述',
    keywords: {
      primary: ['测试关键词'],
      secondary: [],
      longTail: [],
      gameTerms: [],
      localTerms: [],
    },
    socialTags: {},
  })),
  generateKeywordsString: vi.fn(_pageKey => '测试关键词1,测试关键词2'),
}));

vi.mock('@/components', () => ({
  PageSEO: vi.fn(() => null),
  BreadcrumbNavigation: vi.fn(() => null),
  ServerCard: vi.fn(({ serverId, serverData }) => (
    <div data-testid={`server-card-${serverId}`}>
      Server: {serverId} - Players: {serverData.players}
    </div>
  )),
  ServerGroupCard: vi.fn(() => null),
}));

// Mock SEO组件，确保analytics在测试中可用
vi.mock('@/components/seo', () => ({
  SEO: () => {
    // 初始化analytics mock（模拟SEO组件的useEffect）
    React.useEffect(() => {
      if (!window.voidixUnifiedAnalytics) {
        window.voidixUnifiedAnalytics = {
          trackCustomEvent: mockTrackCustomEvent,
          trackBugReport: vi.fn(),
          trackFAQView: vi.fn(),
          trackPagePerformance: vi.fn(),
        };
      }
    }, []);
    return null;
  }
}));

// Mock window.voidixUnifiedAnalytics
const mockTrackCustomEvent = vi.fn();
const mockTrackServerStatus = vi.fn();

Object.defineProperty(window, 'voidixUnifiedAnalytics', {
  value: {
    trackCustomEvent: mockTrackCustomEvent,
    trackServerStatus: mockTrackServerStatus,
  },
  writable: true,
  configurable: true,
});

describe('StatusPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTrackCustomEvent.mockClear();
    mockTrackServerStatus.mockClear();
  });

  describe('基础渲染', () => {
    it('应该正确渲染页面基础结构', async () => {
      const { useWebSocketStatus: mockUseWebSocketStatus } = (await vi.importMock(
        '@/hooks/useWebSocket'
      )) as any;
      mockUseWebSocketStatus.mockReturnValue({
        connectionStatus: 'connected',
        servers: {},
        aggregateStats: { totalPlayers: 0, onlineServers: 0 },
        isMaintenance: false,
        runningTime: 0,
        totalRunningTime: 3600,
      });

      renderWithHelmet(<StatusPage />);

      // 检查主要页面元素存在
      expect(screen.getByText('服务器状态')).toBeInTheDocument();
      expect(screen.getByText('实时查看 Voidix 网络的服务器状态和统计信息')).toBeInTheDocument();
    });

    it('应该渲染面包屑导航', async () => {
      const { useWebSocketStatus: mockUseWebSocketStatus } = (await vi.importMock(
        '@/hooks/useWebSocket'
      )) as any;
      mockUseWebSocketStatus.mockReturnValue({
        connectionStatus: 'connected',
        servers: {},
        aggregateStats: { totalPlayers: 0, onlineServers: 0 },
        isMaintenance: false,
        runningTime: 0,
        totalRunningTime: 3600,
      });

      renderWithHelmet(<StatusPage />);

      // BreadcrumbNavigation组件应该被渲染（通过检查mock函数是否被调用）
      const { BreadcrumbNavigation } = (await vi.importMock('@/components')) as any;
      expect(BreadcrumbNavigation).toHaveBeenCalled();
    });
  });

  describe('维护模式', () => {
    it('应该在维护模式下显示维护警告', async () => {
      const { useWebSocketStatus: mockUseWebSocketStatus } = (await vi.importMock(
        '@/hooks/useWebSocket'
      )) as any;
      mockUseWebSocketStatus.mockReturnValue({
        connectionStatus: 'connected',
        servers: {},
        aggregateStats: { totalPlayers: 0, onlineServers: 0 },
        isMaintenance: true,
        runningTime: 0,
        totalRunningTime: 3600,
      });

      renderWithHelmet(<StatusPage />);

      expect(screen.getByText('🚧 服务器维护中')).toBeInTheDocument();
      expect(screen.getByText(/服务器正在进行维护/)).toBeInTheDocument();
      expect(screen.getByText(/请访问官网 www.voidix.net/)).toBeInTheDocument();
    });

    it('应该在非维护模式下不显示维护警告', async () => {
      const { useWebSocketStatus: mockUseWebSocketStatus } = (await vi.importMock(
        '@/hooks/useWebSocket'
      )) as any;
      mockUseWebSocketStatus.mockReturnValue({
        connectionStatus: 'connected',
        servers: {},
        aggregateStats: { totalPlayers: 0, onlineServers: 0 },
        isMaintenance: false,
        runningTime: 0,
        totalRunningTime: 3600,
      });

      renderWithHelmet(<StatusPage />);

      expect(screen.queryByText('🚧 服务器维护中')).not.toBeInTheDocument();
    });
  });

  describe('连接状态处理', () => {
    it('应该在连接状态下显示统计数据', async () => {
      const { useWebSocketStatus: mockUseWebSocketStatus } = (await vi.importMock(
        '@/hooks/useWebSocket'
      )) as any;
      mockUseWebSocketStatus.mockReturnValue({
        connectionStatus: 'connected',
        servers: {
          survival: { players: 10, status: 'online' },
          creative: { players: 5, status: 'online' },
        },
        aggregateStats: { totalPlayers: 15, onlineServers: 2 },
        isMaintenance: false,
        runningTime: 0,
        totalRunningTime: 7200,
      });

      renderWithHelmet(<StatusPage />);

      expect(screen.getByText('总在线玩家')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('在线服务器')).toBeInTheDocument();
      expect(screen.getByText('2/2')).toBeInTheDocument();
      expect(screen.getByText('总运行时间')).toBeInTheDocument();
    });

    it('应该在断开连接时显示加载骨架屏', async () => {
      const { useWebSocketStatus: mockUseWebSocketStatus } = (await vi.importMock(
        '@/hooks/useWebSocket'
      )) as any;
      mockUseWebSocketStatus.mockReturnValue({
        connectionStatus: 'disconnected',
        servers: {},
        aggregateStats: { totalPlayers: 0, onlineServers: 0 },
        isMaintenance: false,
        runningTime: 0,
        totalRunningTime: 0,
      });

      renderWithHelmet(<StatusPage />);

      // 应该显示加载状态
      expect(screen.getByText('正在加载服务器数据...')).toBeInTheDocument();
    });

    it('应该在连接失败时显示错误信息', async () => {
      const { useWebSocketStatus: mockUseWebSocketStatus } = (await vi.importMock(
        '@/hooks/useWebSocket'
      )) as any;
      mockUseWebSocketStatus.mockReturnValue({
        connectionStatus: 'failed',
        servers: {},
        aggregateStats: { totalPlayers: 0, onlineServers: 0 },
        isMaintenance: false,
        runningTime: 0,
        totalRunningTime: 0,
      });

      renderWithHelmet(<StatusPage />);

      expect(screen.getByText('无法连接到服务器')).toBeInTheDocument();
      expect(screen.getByText('请检查网络连接或稍后再试')).toBeInTheDocument();
    });
  });

  describe('服务器数据显示', () => {
    it('应该正确渲染服务器组和服务器卡片', async () => {
      const { useWebSocketStatus: mockUseWebSocketStatus } = (await vi.importMock(
        '@/hooks/useWebSocket'
      )) as any;
      mockUseWebSocketStatus.mockReturnValue({
        connectionStatus: 'connected',
        servers: {
          survival: { players: 10, status: 'online' },
          creative: { players: 5, status: 'online' },
          lobby: { players: 2, status: 'online' },
        },
        aggregateStats: { totalPlayers: 17, onlineServers: 3 },
        isMaintenance: false,
        runningTime: 0,
        totalRunningTime: 3600,
      });

      renderWithHelmet(<StatusPage />);

      // 应该渲染服务器组（通过检查mock函数是否被调用）
      const { ServerGroupCard } = (await vi.importMock('@/components')) as any;
      expect(ServerGroupCard).toHaveBeenCalled();
    });

    it('应该在没有服务器数据时显示加载状态', async () => {
      const { useWebSocketStatus: mockUseWebSocketStatus } = (await vi.importMock(
        '@/hooks/useWebSocket'
      )) as any;
      mockUseWebSocketStatus.mockReturnValue({
        connectionStatus: 'connected',
        servers: {},
        aggregateStats: { totalPlayers: 0, onlineServers: 0 },
        isMaintenance: false,
        runningTime: 0,
        totalRunningTime: 3600,
      });

      renderWithHelmet(<StatusPage />);

      expect(screen.getByText('正在加载服务器数据...')).toBeInTheDocument();
    });
  });

  describe('分析跟踪', () => {
    it('应该在页面加载时跟踪页面访问', async () => {
      const { useWebSocketStatus: mockUseWebSocketStatus } = (await vi.importMock(
        '@/hooks/useWebSocket'
      )) as any;
      mockUseWebSocketStatus.mockReturnValue({
        connectionStatus: 'connected',
        servers: { survival: { players: 10, status: 'online' } },
        aggregateStats: { totalPlayers: 10, onlineServers: 1 },
        isMaintenance: false,
        runningTime: 0,
        totalRunningTime: 3600,
      });

      renderWithHelmet(<StatusPage />);

      expect(mockTrackCustomEvent).toHaveBeenCalledWith(
        'page_view',
        'status_page',
        'status_page_visit',
        1
      );
    });

    it('应该在服务器状态变化时跟踪状态更新', async () => {
      const { useWebSocketStatus: mockUseWebSocketStatus } = (await vi.importMock(
        '@/hooks/useWebSocket'
      )) as any;
      mockUseWebSocketStatus.mockReturnValue({
        connectionStatus: 'connected',
        servers: { survival: { players: 10, status: 'online' } },
        aggregateStats: { totalPlayers: 10, onlineServers: 1 },
        isMaintenance: false,
        runningTime: 0,
        totalRunningTime: 3600,
      });

      renderWithHelmet(<StatusPage />);

      expect(mockTrackCustomEvent).toHaveBeenCalledWith(
        'server_status',
        'status_update',
        'aggregate_stats',
        10
      );
    });
  });
});
