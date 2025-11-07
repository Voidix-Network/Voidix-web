import { PlayerIgnTooltip } from '@/components/ui/PlayerIgnTooltip';
import type { PlayerIgnInfo } from '@/types';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@/stores', () => ({
  useServerPlayerIgns: vi.fn(() => []),
  usePlayerIgnStore: vi.fn(() => ({
    getAllPlayerIgns: vi.fn(() => []),
  })),
}));

vi.mock('@/hooks/useWebSocketV2', () => ({
  useWebSocketV2: vi.fn(() => ({
    connectionStatus: 'connected',
    servers: {},
    serverTree: null,
    aggregateStats: { totalPlayers: 0, onlineServers: 0, totalServers: 0 },
    runtimeInfo: null,
    proxyStats: null,
    isMaintenance: false,
    runningTime: null,
    totalRunningTime: null,
  })),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('lucide-react', () => ({
  Users: ({ className, ...props }: any) => (
    <div data-testid="users-icon" className={className} {...props} />
  ),
  Clock: ({ className, ...props }: any) => (
    <div data-testid="clock-icon" className={className} {...props} />
  ),
  Wifi: ({ className, ...props }: any) => (
    <div data-testid="wifi-icon" className={className} {...props} />
  ),
  WifiOff: ({ className, ...props }: any) => (
    <div data-testid="wifi-off-icon" className={className} {...props} />
  ),
  RefreshCw: ({ className, ...props }: any) => (
    <div data-testid="refresh-icon" className={className} {...props} />
  ),
}));

describe('PlayerIgnTooltip', () => {
  const mockPlayers: PlayerIgnInfo[] = [
    {
      uuid: 'uuid-1',
      ign: 'Player1',
      serverId: 'survival',
      joinTime: new Date('2025-06-16T10:00:00Z'),
      lastSeen: new Date('2025-06-16T10:30:00Z'),
    },
  ];

  let mockUseServerPlayerIgns: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // 动态导入并设置mock
    const stores = await import('@/stores');
    mockUseServerPlayerIgns = vi.mocked(stores.useServerPlayerIgns);
    mockUseServerPlayerIgns.mockReturnValue([]);
  });

  describe('基础渲染', () => {
    it('应该渲染子元素', async () => {
      mockUseServerPlayerIgns.mockReturnValue([]);

      render(
        <PlayerIgnTooltip serverId="survival" playerCount={0}>
          <span>0 在线</span>
        </PlayerIgnTooltip>
      );

      expect(screen.getByText('0 在线')).toBeInTheDocument();
    });

    it('应该在有玩家时应用help cursor样式', async () => {
      mockUseServerPlayerIgns.mockReturnValue(mockPlayers);

      const { container } = render(
        <PlayerIgnTooltip serverId="survival" playerCount={1}>
          <span>1 在线</span>
        </PlayerIgnTooltip>
      );

      const triggerElement = container.firstChild as HTMLElement;
      expect(triggerElement).toHaveStyle('cursor: help');
    });

    it('应该在无玩家时应用default cursor样式', async () => {
      mockUseServerPlayerIgns.mockReturnValue([]);

      const { container } = render(
        <PlayerIgnTooltip serverId="survival" playerCount={0}>
          <span>0 在线</span>
        </PlayerIgnTooltip>
      );

      const triggerElement = container.firstChild as HTMLElement;
      expect(triggerElement).toHaveStyle('cursor: default');
    });

    it('应该在disabled时应用default cursor样式', async () => {
      mockUseServerPlayerIgns.mockReturnValue(mockPlayers);

      const { container } = render(
        <PlayerIgnTooltip serverId="survival" playerCount={1} disabled>
          <span>1 在线</span>
        </PlayerIgnTooltip>
      );

      const triggerElement = container.firstChild as HTMLElement;
      expect(triggerElement).toHaveStyle('cursor: default');
    });
  });

  describe('数据绑定', () => {
    it('应该正确调用useServerPlayerIgns hook', async () => {
      mockUseServerPlayerIgns.mockReturnValue(mockPlayers);

      render(
        <PlayerIgnTooltip serverId="survival" playerCount={1}>
          <span>1 在线</span>
        </PlayerIgnTooltip>
      );

      expect(mockUseServerPlayerIgns).toHaveBeenCalledWith('survival');
    });

    it('应该处理空的玩家列表', async () => {
      mockUseServerPlayerIgns.mockReturnValue([]);

      render(
        <PlayerIgnTooltip serverId="survival" playerCount={0}>
          <span>0 在线</span>
        </PlayerIgnTooltip>
      );

      expect(mockUseServerPlayerIgns).toHaveBeenCalledWith('survival');
    });
  });

  describe('基础交互', () => {
    it('应该在鼠标悬停时触发onMouseEnter', async () => {
      mockUseServerPlayerIgns.mockReturnValue(mockPlayers);

      const { container } = render(
        <PlayerIgnTooltip serverId="survival" playerCount={1}>
          <span>1 在线</span>
        </PlayerIgnTooltip>
      );

      const triggerElement = container.firstChild as HTMLElement;

      expect(() => {
        fireEvent.mouseEnter(triggerElement);
      }).not.toThrow();
    });

    it('应该在鼠标离开时触发onMouseLeave', async () => {
      mockUseServerPlayerIgns.mockReturnValue(mockPlayers);

      const { container } = render(
        <PlayerIgnTooltip serverId="survival" playerCount={1}>
          <span>1 在线</span>
        </PlayerIgnTooltip>
      );

      const triggerElement = container.firstChild as HTMLElement;

      expect(() => {
        fireEvent.mouseEnter(triggerElement);
        fireEvent.mouseLeave(triggerElement);
      }).not.toThrow();
    });
  });

  describe('自定义样式', () => {
    it('应该应用自定义className', async () => {
      mockUseServerPlayerIgns.mockReturnValue([]);

      const { container } = render(
        <PlayerIgnTooltip serverId="survival" playerCount={0} className="custom-class">
          <span>0 在线</span>
        </PlayerIgnTooltip>
      );

      const triggerElement = container.firstChild as HTMLElement;
      expect(triggerElement).toHaveClass('custom-class');
    });
  });

  describe('组件集成', () => {
    it('应该正确处理不同的服务器ID', async () => {
      mockUseServerPlayerIgns.mockReturnValue(mockPlayers);

      const { rerender } = render(
        <PlayerIgnTooltip serverId="survival" playerCount={1}>
          <span>1 在线</span>
        </PlayerIgnTooltip>
      );

      expect(mockUseServerPlayerIgns).toHaveBeenCalledWith('survival');

      rerender(
        <PlayerIgnTooltip serverId="creative" playerCount={1}>
          <span>1 在线</span>
        </PlayerIgnTooltip>
      );

      expect(mockUseServerPlayerIgns).toHaveBeenCalledWith('creative');
    });
  });
});
