import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServerCard } from '@/components/business/ServerCard';
import type { ServerCardProps } from '@/components/business/ServerCard';
import { useServerPlayerIgns } from '@/stores/serverStore';

// 引入测试设置
import '@/test/setup';

// Mock useServerPlayerIgns hook
vi.mock('@/stores/serverStore', () => ({
  useServerPlayerIgns: vi.fn(),
}));

// Mock framer-motion for testing
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('ServerCard', () => {
  // 获取mock函数的引用
  const mockUseServerPlayerIgns = vi.mocked(useServerPlayerIgns);

  beforeEach(() => {
    // Reset mocks before each test
    mockUseServerPlayerIgns.mockReturnValue([]);
  });

  describe('基础渲染', () => {
    it('应该渲染基本的服务器卡片结构', () => {
      const mockServerInfo = {
        isOnline: true,
        players: 10,
      };

      render(
        <ServerCard serverId="survival" serverInfo={mockServerInfo} displayName="生存服务器" />
      );

      // 验证显示名称
      expect(screen.getByText('生存服务器')).toBeInTheDocument();

      // 验证在线状态显示
      expect(screen.getByText('10 在线')).toBeInTheDocument();

      // 验证玩家信息初始不显示（现在需要hover才显示）
      expect(screen.queryByText('加载玩家信息中...')).not.toBeInTheDocument();
    });

    it('应该渲染带有类别标题的服务器卡片', () => {
      const mockServerInfo = {
        isOnline: true,
        players: 15,
      };

      render(
        <ServerCard
          serverId="creative"
          serverInfo={mockServerInfo}
          displayName="创造服务器"
          categoryTitle="创造世界"
        />
      );

      expect(screen.getByText('创造服务器')).toBeInTheDocument();
      expect(screen.getByText('15 在线')).toBeInTheDocument();
    });
  });

  describe('在线状态处理', () => {
    it('应该正确显示在线服务器状态', () => {
      const { container } = render(
        <ServerCard
          serverId="lobby"
          serverInfo={{ isOnline: true, players: 25 }}
          displayName="大厅服务器"
        />
      );

      // 检查状态指示器
      const statusDot = container.querySelector('.w-2.h-2.rounded-full');
      expect(statusDot).toHaveClass('bg-green-500', 'animate-pulse');

      // 检查玩家数量显示
      expect(screen.getByText('25 在线')).toBeInTheDocument();
      expect(screen.getByText('25 在线')).toHaveClass('text-green-400');
    });

    it('应该正确显示离线服务器状态', () => {
      const { container } = render(
        <ServerCard
          serverId="minigame"
          serverInfo={{ isOnline: false, players: 0 }}
          displayName="小游戏服务器"
        />
      );

      // 检查状态指示器
      const statusDot = container.querySelector('.w-2.h-2.rounded-full');
      expect(statusDot).toHaveClass('bg-red-500');
      expect(statusDot).not.toHaveClass('animate-pulse');

      // 检查离线状态显示
      expect(screen.getByText('离线')).toBeInTheDocument();
      expect(screen.getByText('离线')).toHaveClass('text-red-400');
    });

    it('应该处理玩家数量为undefined的情况', () => {
      render(
        <ServerCard serverId="test" serverInfo={{ isOnline: true }} displayName="测试服务器" />
      );

      // 玩家数量应该默认为0
      expect(screen.getByText('0 在线')).toBeInTheDocument();
    });

    it('应该处理玩家数量为null的情况', () => {
      render(
        <ServerCard
          serverId="test"
          serverInfo={{ isOnline: true, players: null }}
          displayName="测试服务器"
        />
      );

      // 玩家数量应该回退到0
      expect(screen.getByText('0 在线')).toBeInTheDocument();
    });
  });

  describe('样式和布局', () => {
    it('应该应用默认的CSS类名', () => {
      const { container } = render(
        <ServerCard
          serverId="test"
          serverInfo={{ isOnline: true, players: 5 }}
          displayName="测试服务器"
        />
      );

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass(
        'bg-gray-700/50',
        'rounded',
        'p-3',
        'hover:bg-gray-700/70',
        'transition-colors',
        'duration-200'
      );
    });

    it('应该为没有categoryTitle的服务器名称应用font-medium', () => {
      render(
        <ServerCard
          serverId="test"
          serverInfo={{ isOnline: true, players: 8 }}
          displayName="主要服务器"
        />
      );

      const nameElement = screen.getByText('主要服务器');
      expect(nameElement).toHaveClass('font-medium');
      expect(nameElement).not.toHaveClass('font-normal');
    });

    it('应该为有categoryTitle的服务器名称应用font-normal', () => {
      render(
        <ServerCard
          serverId="test"
          serverInfo={{ isOnline: true, players: 12 }}
          displayName="子服务器"
          categoryTitle="分类标题"
        />
      );

      const nameElement = screen.getByText('子服务器');
      expect(nameElement).toHaveClass('font-normal');
      expect(nameElement).not.toHaveClass('font-medium');
    });

    it('应该为玩家数量文本应用正确的样式', () => {
      render(
        <ServerCard
          serverId="test"
          serverInfo={{ isOnline: true, players: 20 }}
          displayName="样式测试服务器"
        />
      );

      const playersElement = screen.getByText('20 在线');
      expect(playersElement).toHaveClass('text-sm', 'font-mono', 'transition-colors');
    });

    it('应该为服务器名称应用正确的基础样式', () => {
      render(
        <ServerCard
          serverId="test"
          serverInfo={{ isOnline: false, players: 0 }}
          displayName="样式测试"
        />
      );

      const nameElement = screen.getByText('样式测试');
      expect(nameElement).toHaveClass('text-sm', 'text-white');
    });
  });

  describe('Props处理', () => {
    it('应该处理所有必需的props', () => {
      const requiredProps: ServerCardProps = {
        serverId: 'required-test',
        serverInfo: { isOnline: true, players: 30 },
        displayName: '必需参数测试',
      };

      expect(() => {
        render(<ServerCard {...requiredProps} />);
      }).not.toThrow();

      expect(screen.getByText('必需参数测试')).toBeInTheDocument();
      expect(screen.getByText('30 在线')).toBeInTheDocument();
    });

    it('应该处理可选的categoryTitle prop', () => {
      const propsWithCategory: ServerCardProps = {
        serverId: 'category-test',
        serverInfo: { isOnline: false, players: 0 },
        displayName: '类别测试',
        categoryTitle: '测试类别',
      };

      expect(() => {
        render(<ServerCard {...propsWithCategory} />);
      }).not.toThrow();

      expect(screen.getByText('类别测试')).toBeInTheDocument();
    });
  });

  describe('边界条件和错误处理', () => {
    it('应该在serverInfo为null时不渲染任何内容', () => {
      const { container } = render(
        <ServerCard serverId="null-test" serverInfo={null} displayName="空信息测试" />
      );

      expect(container.firstChild).toBeNull();
    });

    it('应该在serverInfo为undefined时不渲染任何内容', () => {
      const { container } = render(
        <ServerCard serverId="undefined-test" serverInfo={undefined} displayName="未定义测试" />
      );

      expect(container.firstChild).toBeNull();
    });

    it('应该处理空的serverInfo对象', () => {
      render(<ServerCard serverId="empty-test" serverInfo={{}} displayName="空对象测试" />);

      // 没有isOnline字段时应该被视为离线
      expect(screen.getByText('离线')).toBeInTheDocument();
      expect(screen.getByText('空对象测试')).toBeInTheDocument();
    });

    it('应该处理isOnline为false且没有players字段的情况', () => {
      render(
        <ServerCard
          serverId="offline-test"
          serverInfo={{ isOnline: false }}
          displayName="离线测试"
        />
      );

      expect(screen.getByText('离线')).toBeInTheDocument();
      expect(screen.getByText('离线测试')).toBeInTheDocument();
    });

    it('应该处理长服务器名称', () => {
      const longName = '非常长的服务器名称用于测试文本显示和布局处理能力';
      render(
        <ServerCard
          serverId="long-name-test"
          serverInfo={{ isOnline: true, players: 100 }}
          displayName={longName}
        />
      );

      expect(screen.getByText(longName)).toBeInTheDocument();
      expect(screen.getByText('100 在线')).toBeInTheDocument();
    });

    it('应该处理大玩家数量', () => {
      render(
        <ServerCard
          serverId="high-players-test"
          serverInfo={{ isOnline: true, players: 9999 }}
          displayName="高玩家数测试"
        />
      );

      expect(screen.getByText('9999 在线')).toBeInTheDocument();
    });
  });

  describe('Hover交互功能', () => {
    const user = userEvent.setup();

    it('应该在鼠标悬停时显示玩家信息', async () => {
      // Mock玩家数据
      mockUseServerPlayerIgns.mockReturnValue([
        { uuid: '1', ign: 'Player1', serverId: 'test', joinTime: new Date(), lastSeen: new Date() },
        { uuid: '2', ign: 'Player2', serverId: 'test', joinTime: new Date(), lastSeen: new Date() },
      ]);

      const { container } = render(
        <ServerCard
          serverId="test"
          serverInfo={{ isOnline: true, players: 2 }}
          displayName="测试服务器"
        />
      );

      const serverCard = container.firstChild as HTMLElement;

      // 初始状态不显示玩家信息
      expect(screen.queryByText('Player1')).not.toBeInTheDocument();
      expect(screen.queryByText('Player2')).not.toBeInTheDocument();

      // 悬停触发显示
      await user.hover(serverCard);

      // 等待玩家信息显示
      await waitFor(() => {
        expect(screen.getByText('Player1')).toBeInTheDocument();
        expect(screen.getByText('Player2')).toBeInTheDocument();
      });
    });

    it('应该在鼠标离开时隐藏玩家信息', async () => {
      mockUseServerPlayerIgns.mockReturnValue([
        {
          uuid: '1',
          ign: 'TestPlayer',
          serverId: 'test',
          joinTime: new Date(),
          lastSeen: new Date(),
        },
      ]);

      const { container } = render(
        <ServerCard
          serverId="test"
          serverInfo={{ isOnline: true, players: 1 }}
          displayName="测试服务器"
        />
      );

      const serverCard = container.firstChild as HTMLElement;

      // 悬停显示玩家信息
      await user.hover(serverCard);
      await waitFor(() => {
        expect(screen.getByText('TestPlayer')).toBeInTheDocument();
      });

      // 离开隐藏玩家信息
      await user.unhover(serverCard);
      await waitFor(() => {
        expect(screen.queryByText('TestPlayer')).not.toBeInTheDocument();
      });
    });
  });

  describe('玩家信息条件渲染', () => {
    const user = userEvent.setup();

    it('只在hover+online+有玩家时显示玩家信息', async () => {
      mockUseServerPlayerIgns.mockReturnValue([
        {
          uuid: '1',
          ign: 'OnlinePlayer',
          serverId: 'test',
          joinTime: new Date(),
          lastSeen: new Date(),
        },
      ]);

      const { container } = render(
        <ServerCard
          serverId="test"
          serverInfo={{ isOnline: true, players: 1 }}
          displayName="在线服务器"
        />
      );

      const serverCard = container.firstChild as HTMLElement;

      // 满足所有条件时应该显示
      await user.hover(serverCard);
      await waitFor(() => {
        expect(screen.getByText('OnlinePlayer')).toBeInTheDocument();
      });
    });

    it('离线服务器hover时不显示玩家信息', async () => {
      mockUseServerPlayerIgns.mockReturnValue([
        {
          uuid: '1',
          ign: 'OfflinePlayer',
          serverId: 'test',
          joinTime: new Date(),
          lastSeen: new Date(),
        },
      ]);

      const { container } = render(
        <ServerCard
          serverId="test"
          serverInfo={{ isOnline: false, players: 0 }}
          displayName="离线服务器"
        />
      );

      const serverCard = container.firstChild as HTMLElement;

      // 离线状态hover不应该显示玩家信息
      await user.hover(serverCard);
      expect(screen.queryByText('OfflinePlayer')).not.toBeInTheDocument();
    });

    it('无玩家的在线服务器hover时不显示玩家信息', async () => {
      mockUseServerPlayerIgns.mockReturnValue([]);

      const { container } = render(
        <ServerCard
          serverId="test"
          serverInfo={{ isOnline: true, players: 0 }}
          displayName="空服务器"
        />
      );

      const serverCard = container.firstChild as HTMLElement;

      // 无玩家时hover不应该显示玩家信息区域
      await user.hover(serverCard);
      expect(screen.queryByText('加载玩家信息中...')).not.toBeInTheDocument();
    });
  });

  describe('玩家列表显示', () => {
    const user = userEvent.setup();

    it('应该显示所有玩家不限制数量', async () => {
      // 创建超过10个玩家的列表
      const manyPlayers = Array.from({ length: 15 }, (_, i) => ({
        uuid: `uuid-${i}`,
        ign: `Player${i + 1}`,
        serverId: 'test',
        joinTime: new Date(),
        lastSeen: new Date(),
      }));

      mockUseServerPlayerIgns.mockReturnValue(manyPlayers);

      const { container } = render(
        <ServerCard
          serverId="test"
          serverInfo={{ isOnline: true, players: 15 }}
          displayName="热门服务器"
        />
      );

      const serverCard = container.firstChild as HTMLElement;
      await user.hover(serverCard);

      // 验证所有玩家都显示，没有数量限制
      await waitFor(() => {
        expect(screen.getByText('Player1')).toBeInTheDocument();
        expect(screen.getByText('Player10')).toBeInTheDocument();
        expect(screen.getByText('Player15')).toBeInTheDocument();
      });

      // 验证不应该有"更多"提示
      expect(screen.queryByText(/更多/)).not.toBeInTheDocument();
    });

    it('应该正确渲染每个玩家标签', async () => {
      mockUseServerPlayerIgns.mockReturnValue([
        {
          uuid: '1',
          ign: 'TestPlayer',
          serverId: 'test',
          joinTime: new Date(),
          lastSeen: new Date(),
        },
      ]);

      const { container } = render(
        <ServerCard
          serverId="test"
          serverInfo={{ isOnline: true, players: 1 }}
          displayName="测试服务器"
        />
      );

      const serverCard = container.firstChild as HTMLElement;
      await user.hover(serverCard);

      await waitFor(() => {
        const playerTag = screen.getByText('TestPlayer');
        expect(playerTag).toBeInTheDocument();
        expect(playerTag).toHaveClass(
          'text-xs',
          'text-gray-400',
          'bg-gray-600/30',
          'px-1.5',
          'py-0.5',
          'rounded'
        );
        expect(playerTag).toHaveAttribute('title', 'TestPlayer');
      });
    });

    it('应该显示加载状态当玩家列表为空但有玩家数量时', async () => {
      // Mock空的玩家列表但服务器显示有玩家
      mockUseServerPlayerIgns.mockReturnValue([]);

      const { container } = render(
        <ServerCard
          serverId="test"
          serverInfo={{ isOnline: true, players: 5 }}
          displayName="加载中服务器"
        />
      );

      const serverCard = container.firstChild as HTMLElement;
      await user.hover(serverCard);

      await waitFor(() => {
        expect(screen.getByText('加载玩家信息中...')).toBeInTheDocument();
      });
    });
  });

  describe('动画组件渲染', () => {
    it('应该正确渲染motion.div和AnimatePresence', async () => {
      mockUseServerPlayerIgns.mockReturnValue([
        {
          uuid: '1',
          ign: 'AnimationTest',
          serverId: 'test',
          joinTime: new Date(),
          lastSeen: new Date(),
        },
      ]);

      const { container } = render(
        <ServerCard
          serverId="test"
          serverInfo={{ isOnline: true, players: 1 }}
          displayName="动画测试"
        />
      );

      const serverCard = container.firstChild as HTMLElement;
      const user = userEvent.setup();

      await user.hover(serverCard);

      // 验证motion.div存在（由于mock，会渲染为普通div）
      await waitFor(() => {
        // 选择正确的motion.div容器，而不是玩家标签的父容器
        const motionContainer = container.querySelector('.mt-2.pl-5.overflow-hidden');
        expect(motionContainer).toBeInTheDocument();
        expect(motionContainer).toHaveClass('mt-2', 'pl-5', 'overflow-hidden');

        // 验证玩家标签确实在motion容器内
        const playerTag = screen.getByText('AnimationTest');
        expect(motionContainer).toContainElement(playerTag);
      });
    });
  });
});
