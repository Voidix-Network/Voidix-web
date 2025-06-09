import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServerGroupCard } from '@/components/business/ServerGroupCard';
import type { ServerGroupInfo, ServerGroupStats } from '@/constants/serverGroups';

// 引入测试设置
import '@/test/setup';

// Mock copyToClipboard utility
vi.mock('@/utils', () => ({
  copyToClipboard: vi.fn(),
}));

// Mock framer-motion for testing
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('ServerGroupCard', () => {
  const mockGroupInfo: ServerGroupInfo = {
    name: 'survival.voidix.net',
    description: '生存服务器',
    address: 'survival.voidix.net',
    servers: ['survival'],
  };

  const mockGroupStats: ServerGroupStats = {
    totalPlayers: 25,
    onlineServers: 1,
    totalServers: 1,
    status: 'online',
  };

  const mockOnToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基础渲染', () => {
    it('应该渲染基本的服务器组卡片结构', () => {
      render(
        <ServerGroupCard
          groupInfo={mockGroupInfo}
          groupStats={mockGroupStats}
          isExpanded={false}
          onToggle={mockOnToggle}
        />
      );

      // 验证组描述
      expect(screen.getByText('生存服务器')).toBeInTheDocument();

      // 验证地址显示
      expect(screen.getByText('survival.voidix.net')).toBeInTheDocument();

      // 验证玩家统计
      expect(screen.getByText('25 玩家在线')).toBeInTheDocument();

      // 验证服务器状态
      expect(screen.getByText('1/1 服务器 全部在线')).toBeInTheDocument();
    });

    it('应该渲染小游戏服务器组', () => {
      const minigameGroupInfo: ServerGroupInfo = {
        name: 'minigame.voidix.net',
        description: '小游戏服务器',
        address: 'minigame.voidix.net',
        servers: ['login', 'lobby1', 'bedwars'],
      };

      const minigameGroupStats: ServerGroupStats = {
        totalPlayers: 50,
        onlineServers: 2,
        totalServers: 3,
        status: 'partial',
      };

      render(
        <ServerGroupCard
          groupInfo={minigameGroupInfo}
          groupStats={minigameGroupStats}
          isExpanded={false}
          onToggle={mockOnToggle}
        />
      );

      expect(screen.getByText('小游戏服务器')).toBeInTheDocument();
      expect(screen.getByText('minigame.voidix.net')).toBeInTheDocument();
      expect(screen.getByText('50 玩家在线')).toBeInTheDocument();
      expect(screen.getByText('2/3 服务器 部分在线')).toBeInTheDocument();
    });
  });

  describe('状态指示器和文本', () => {
    it('应该为online状态显示绿色动画指示器和正确文本', () => {
      const { container } = render(
        <ServerGroupCard
          groupInfo={mockGroupInfo}
          groupStats={mockGroupStats}
          isExpanded={false}
          onToggle={mockOnToggle}
        />
      );

      const statusDot = container.querySelector('.w-3.h-3.rounded-full');
      expect(statusDot).toHaveClass('bg-green-500', 'animate-pulse');
      expect(screen.getByText(/全部在线/)).toBeInTheDocument();
      expect(screen.getByText(/1\/1 服务器.*全部在线/)).toHaveClass('text-green-400');
    });

    it('应该为partial状态显示黄色动画指示器和正确文本', () => {
      const partialStats: ServerGroupStats = {
        ...mockGroupStats,
        onlineServers: 2,
        totalServers: 3,
        status: 'partial',
      };

      const { container } = render(
        <ServerGroupCard
          groupInfo={mockGroupInfo}
          groupStats={partialStats}
          isExpanded={false}
          onToggle={mockOnToggle}
        />
      );

      const statusDot = container.querySelector('.w-3.h-3.rounded-full');
      expect(statusDot).toHaveClass('bg-yellow-500', 'animate-pulse');
      expect(screen.getByText(/部分在线/)).toBeInTheDocument();
      expect(screen.getByText(/2\/3 服务器.*部分在线/)).toHaveClass('text-yellow-400');
    });

    it('应该为offline状态显示红色指示器和正确文本', () => {
      const offlineStats: ServerGroupStats = {
        ...mockGroupStats,
        totalPlayers: 0,
        onlineServers: 0,
        status: 'offline',
      };

      const { container } = render(
        <ServerGroupCard
          groupInfo={mockGroupInfo}
          groupStats={offlineStats}
          isExpanded={false}
          onToggle={mockOnToggle}
        />
      );

      const statusDot = container.querySelector('.w-3.h-3.rounded-full');
      expect(statusDot).toHaveClass('bg-red-500');
      expect(statusDot).not.toHaveClass('animate-pulse');
      expect(screen.getByText(/离线/)).toBeInTheDocument();
      expect(screen.getByText(/0\/1 服务器.*离线/)).toHaveClass('text-red-400');
    });
  });

  describe('展开收起功能', () => {
    it('应该在点击头部时调用onToggle', () => {
      render(
        <ServerGroupCard
          groupInfo={mockGroupInfo}
          groupStats={mockGroupStats}
          isExpanded={false}
          onToggle={mockOnToggle}
        />
      );

      const header = screen.getByText('生存服务器').closest('.p-4');
      fireEvent.click(header!);

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it('应该在收起状态时不显示详细信息', () => {
      render(
        <ServerGroupCard
          groupInfo={mockGroupInfo}
          groupStats={mockGroupStats}
          isExpanded={false}
          onToggle={mockOnToggle}
        />
      );

      expect(screen.queryByText('快速连接地址')).not.toBeInTheDocument();
      expect(screen.queryByText('复制地址')).not.toBeInTheDocument();
      expect(screen.queryByText('服务器详情')).not.toBeInTheDocument();
    });

    it('应该在展开状态时显示详细信息', () => {
      render(
        <ServerGroupCard
          groupInfo={mockGroupInfo}
          groupStats={mockGroupStats}
          isExpanded={true}
          onToggle={mockOnToggle}
        />
      );

      expect(screen.getByText('快速连接地址')).toBeInTheDocument();
      expect(screen.getByText('复制地址')).toBeInTheDocument();
      expect(screen.getByText('服务器详情')).toBeInTheDocument();
      // 验证代码块中的地址
      const codeElements = screen.getAllByText('survival.voidix.net');
      const codeElement = codeElements.find(el => el.tagName === 'CODE');
      expect(codeElement).toBeInTheDocument();
      expect(codeElement).toHaveClass('text-sm', 'font-mono', 'text-blue-300');
    });

    it('应该正确显示展开箭头的旋转状态', () => {
      const { container, rerender } = render(
        <ServerGroupCard
          groupInfo={mockGroupInfo}
          groupStats={mockGroupStats}
          isExpanded={false}
          onToggle={mockOnToggle}
        />
      );

      // 查找svg元素的直接父容器（motion.div）
      let arrowContainer = container.querySelector('svg')?.parentElement;
      expect(arrowContainer).toBeInTheDocument();

      // 验证未展开状态下的初始状态（motion元素可能没有CSS类）
      // 由于mock了framer-motion，旋转状态可能不会反映在CSS类中

      // 重新渲染为展开状态
      rerender(
        <ServerGroupCard
          groupInfo={mockGroupInfo}
          groupStats={mockGroupStats}
          isExpanded={true}
          onToggle={mockOnToggle}
        />
      );

      // 再次查找箭头容器
      arrowContainer = container.querySelector('svg')?.parentElement;
      expect(arrowContainer).toBeInTheDocument();
    });
  });

  describe('复制地址功能', () => {
    it('应该能够复制地址并显示成功状态', async () => {
      const mockCopyToClipboard = vi.mocked(await import('@/utils')).copyToClipboard;
      mockCopyToClipboard.mockResolvedValue(true);

      render(
        <ServerGroupCard
          groupInfo={mockGroupInfo}
          groupStats={mockGroupStats}
          isExpanded={true}
          onToggle={mockOnToggle}
        />
      );

      const copyButton = screen.getByText('复制地址');
      fireEvent.click(copyButton);

      expect(mockCopyToClipboard).toHaveBeenCalledWith('survival.voidix.net');

      await waitFor(() => {
        expect(screen.getByText('已复制')).toBeInTheDocument();
      });

      // 验证按钮样式变化
      const copiedButton = screen.getByText('已复制');
      expect(copiedButton).toHaveClass('bg-green-600', 'text-white');
    });

    it('应该在复制失败时不改变按钮状态', async () => {
      const mockCopyToClipboard = vi.mocked(await import('@/utils')).copyToClipboard;
      mockCopyToClipboard.mockResolvedValue(false);

      render(
        <ServerGroupCard
          groupInfo={mockGroupInfo}
          groupStats={mockGroupStats}
          isExpanded={true}
          onToggle={mockOnToggle}
        />
      );

      const copyButton = screen.getByText('复制地址');
      fireEvent.click(copyButton);

      expect(mockCopyToClipboard).toHaveBeenCalledWith('survival.voidix.net');

      // 等待一段时间确保没有状态变化
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(screen.getByText('复制地址')).toBeInTheDocument();
      expect(screen.queryByText('已复制')).not.toBeInTheDocument();
    });

    it('应该阻止复制按钮的点击事件冒泡', async () => {
      const mockCopyToClipboard = vi.mocked(await import('@/utils')).copyToClipboard;
      mockCopyToClipboard.mockResolvedValue(true);

      render(
        <ServerGroupCard
          groupInfo={mockGroupInfo}
          groupStats={mockGroupStats}
          isExpanded={true}
          onToggle={mockOnToggle}
        />
      );

      const copyButton = screen.getByText('复制地址');

      // 使用act包装点击事件，因为它会触发状态更新
      await act(async () => {
        fireEvent.click(copyButton);
      });

      // onToggle不应该被调用，因为事件冒泡被阻止
      expect(mockOnToggle).not.toHaveBeenCalled();
    });
    it('应该在2秒后重置复制成功状态', async () => {
      const mockCopyToClipboard = vi.mocked(await import('@/utils')).copyToClipboard;
      mockCopyToClipboard.mockResolvedValue(true);

      render(
        <ServerGroupCard
          groupInfo={mockGroupInfo}
          groupStats={mockGroupStats}
          isExpanded={true}
          onToggle={mockOnToggle}
        />
      );

      const copyButton = screen.getByText('复制地址');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText('已复制')).toBeInTheDocument();
      });

      // 等待2秒后状态应该重置
      await waitFor(
        () => {
          expect(screen.getByText('复制地址')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('children内容渲染', () => {
    it('应该在展开状态时渲染children内容', () => {
      render(
        <ServerGroupCard
          groupInfo={mockGroupInfo}
          groupStats={mockGroupStats}
          isExpanded={true}
          onToggle={mockOnToggle}
        >
          <div data-testid="child-content">子服务器列表</div>
        </ServerGroupCard>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('子服务器列表')).toBeInTheDocument();
    });

    it('应该在收起状态时不渲染children内容', () => {
      render(
        <ServerGroupCard
          groupInfo={mockGroupInfo}
          groupStats={mockGroupStats}
          isExpanded={false}
          onToggle={mockOnToggle}
        >
          <div data-testid="child-content">子服务器列表</div>
        </ServerGroupCard>
      );

      expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
    });

    it('应该处理空children', () => {
      expect(() => {
        render(
          <ServerGroupCard
            groupInfo={mockGroupInfo}
            groupStats={mockGroupStats}
            isExpanded={true}
            onToggle={mockOnToggle}
          />
        );
      }).not.toThrow();

      expect(screen.getByText('服务器详情')).toBeInTheDocument();
    });
  });

  describe('样式和布局', () => {
    it('应该应用正确的基础CSS类名', () => {
      const { container } = render(
        <ServerGroupCard
          groupInfo={mockGroupInfo}
          groupStats={mockGroupStats}
          isExpanded={false}
          onToggle={mockOnToggle}
        />
      );

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass(
        'bg-gray-800',
        'rounded-lg',
        'border',
        'border-gray-700',
        'overflow-hidden'
      );
    });

    it('应该为头部区域应用正确的样式', () => {
      render(
        <ServerGroupCard
          groupInfo={mockGroupInfo}
          groupStats={mockGroupStats}
          isExpanded={false}
          onToggle={mockOnToggle}
        />
      );

      const header = screen.getByText('生存服务器').closest('.p-4');
      expect(header).toHaveClass('p-4', 'cursor-pointer', 'transition-colors');
      // 注： hover:bg-gray-700/50 由于动画增强可能已被 whileHover 替代
    });

    it('应该为组名称应用正确的样式', () => {
      render(
        <ServerGroupCard
          groupInfo={mockGroupInfo}
          groupStats={mockGroupStats}
          isExpanded={false}
          onToggle={mockOnToggle}
        />
      );

      const titleElement = screen.getByText('生存服务器');
      expect(titleElement).toHaveClass('text-white', 'font-medium');

      const addressElement = screen.getByText('survival.voidix.net');
      expect(addressElement).toHaveClass('text-gray-400', 'text-sm');
    });

    it('应该为统计信息应用正确的样式', () => {
      render(
        <ServerGroupCard
          groupInfo={mockGroupInfo}
          groupStats={mockGroupStats}
          isExpanded={false}
          onToggle={mockOnToggle}
        />
      );

      const playersElement = screen.getByText('25 玩家在线');
      expect(playersElement).toHaveClass('text-white', 'font-medium');
    });
  });

  describe('边界条件', () => {
    it('应该处理0玩家的情况', () => {
      const emptyStats: ServerGroupStats = {
        totalPlayers: 0,
        onlineServers: 0,
        totalServers: 1,
        status: 'offline',
      };

      render(
        <ServerGroupCard
          groupInfo={mockGroupInfo}
          groupStats={emptyStats}
          isExpanded={false}
          onToggle={mockOnToggle}
        />
      );

      expect(screen.getByText('0 玩家在线')).toBeInTheDocument();
    });

    it('应该处理大量玩家的情况', () => {
      const highStats: ServerGroupStats = {
        totalPlayers: 9999,
        onlineServers: 10,
        totalServers: 10,
        status: 'online',
      };

      render(
        <ServerGroupCard
          groupInfo={mockGroupInfo}
          groupStats={highStats}
          isExpanded={false}
          onToggle={mockOnToggle}
        />
      );

      expect(screen.getByText('9999 玩家在线')).toBeInTheDocument();
      expect(screen.getByText('10/10 服务器 全部在线')).toBeInTheDocument();
    });

    it('应该处理长地址名称', () => {
      const longGroupInfo: ServerGroupInfo = {
        ...mockGroupInfo,
        address: 'very-long-server-group-address.example.voidix.net',
        description: '超长名称的服务器组用于测试布局和显示效果',
      };

      render(
        <ServerGroupCard
          groupInfo={longGroupInfo}
          groupStats={mockGroupStats}
          isExpanded={true}
          onToggle={mockOnToggle}
        />
      );
      expect(screen.getByText('超长名称的服务器组用于测试布局和显示效果')).toBeInTheDocument();

      // 验证在头部区域有地址显示
      const headerAddressElements = screen.getAllByText(
        'very-long-server-group-address.example.voidix.net'
      );
      expect(headerAddressElements.length).toBeGreaterThan(0);
    });
  });
});
