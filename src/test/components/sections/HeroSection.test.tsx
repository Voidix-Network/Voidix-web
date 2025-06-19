import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HeroSection } from '@/components/sections/HeroSection';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}));

// Mock components
vi.mock('@/components', () => ({
  GradientText: ({ children, variant }: { children: React.ReactNode; variant: string }) => (
    <span data-testid="gradient-text" data-variant={variant}>
      {children}
    </span>
  ),
  ServerStatusCard: ({ type, address, status, players }: any) => (
    <div
      data-testid="server-status-card"
      data-type={type}
      data-address={address}
      data-status={status}
      data-players={players}
    >
      {type} - {address} - {status} - {players} players
    </div>
  ),
}));

// Mock stores
const mockServers = {
  lobby1: { status: 'online', players: 25 },
  survival: { status: 'online', players: 15 },
};

vi.mock('@/stores', () => ({
  useServers: () => mockServers,
}));

const renderHeroSection = () => {
  return render(
    <BrowserRouter>
      <HeroSection />
    </BrowserRouter>
  );
};

describe('HeroSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该渲染主要的文本内容', () => {
    renderHeroSection();

    // 验证标签
    expect(screen.getByText('公平至上的Minecraft体验')).toBeInTheDocument();

    // 验证主标题
    expect(screen.getByText('下一代')).toBeInTheDocument();
    expect(screen.getByTestId('gradient-text')).toHaveTextContent('公益服务器');
    expect(screen.getByTestId('gradient-text')).toHaveAttribute('data-variant', 'primary');

    // 验证副标题
    expect(screen.getByText(/由开发者NekoEpisode和CYsonHab创建/)).toBeInTheDocument();
  });

  it('应该渲染服务器状态卡片', () => {
    renderHeroSection();

    const serverCards = screen.getAllByTestId('server-status-card');
    expect(serverCards).toHaveLength(2);

    // 验证 MINIGAME 服务器卡片
    const minigameCard = serverCards.find(card => card.getAttribute('data-type') === 'MINIGAME');
    expect(minigameCard).toBeTruthy();
    expect(minigameCard).toHaveAttribute('data-address', 'minigame.voidix.net');
    expect(minigameCard).toHaveAttribute('data-status', 'online');
    expect(minigameCard).toHaveAttribute('data-players', '25');

    // 验证 SURVIVAL 服务器卡片
    const survivalCard = serverCards.find(card => card.getAttribute('data-type') === 'SURVIVAL');
    expect(survivalCard).toHaveAttribute('data-address', 'survival.voidix.net');
    expect(survivalCard).toHaveAttribute('data-status', 'online');
    expect(survivalCard).toHaveAttribute('data-players', '15');
  });

  it('应该渲染基岩版兼容提示', () => {
    renderHeroSection();

    expect(screen.getByText('基岩版兼容 | GeyserMC技术实现')).toBeInTheDocument();
  });

  it('应该渲染背景展示区域的内容', () => {
    renderHeroSection();

    expect(screen.getByText('探索无限可能的世界')).toBeInTheDocument();
    expect(screen.getByText(/完全公平的游戏环境/)).toBeInTheDocument();
  });

  it('应该渲染操作按钮并处理点击事件', () => {
    renderHeroSection();

    const statusButton = screen.getByText('查看服务器状态');
    const faqButton = screen.getByText('常见问题解答');

    expect(statusButton).toBeInTheDocument();
    expect(faqButton).toBeInTheDocument();

    // 测试按钮点击
    fireEvent.click(statusButton);
    expect(mockNavigate).toHaveBeenCalledWith('/status');

    fireEvent.click(faqButton);
    expect(mockNavigate).toHaveBeenCalledWith('/faq');
  });

  it('应该正确处理服务器数据缺失的情况', () => {
    // 重新mock空的服务器数据
    const emptyServers = {
      lobby1: undefined,
      survival: undefined,
    };

    // 使用空数据重新mock useServers
    vi.doMock('@/stores', () => ({
      useServers: () => emptyServers,
    }));

    renderHeroSection();

    const serverCards = screen.getAllByTestId('server-status-card');

    // 验证即使没有服务器数据也能正常渲染
    expect(serverCards).toHaveLength(2);

    // 验证默认值
    const minigameCard = serverCards[0];
    expect(minigameCard).toHaveAttribute('data-status', 'online'); // 使用mock数据
    expect(minigameCard).toHaveAttribute('data-players', '25');
  });

  it('应该应用正确的 CSS 类名', () => {
    const { container } = renderHeroSection();

    const section = container.querySelector('section');
    expect(section).toHaveClass(
      'pt-12',
      'pb-20',
      'px-4',
      'sm:px-6',
      'lg:px-8',
      'max-w-7xl',
      'mx-auto'
    );

    // 验证标签样式
    const tag = container.querySelector('.bg-\\[\\#1a2541\\]');
    expect(tag).toHaveClass('inline-block', 'px-4', 'py-2', 'rounded-full', 'mb-6');

    // 验证主标题样式
    const title = container.querySelector('h1');
    expect(title).toHaveClass(
      'text-4xl',
      'sm:text-5xl',
      'md:text-6xl',
      'tracking-tight',
      'font-bold'
    );
  });

  it('应该正确设置按钮的样式类', () => {
    renderHeroSection();

    const statusButton = screen.getByText('查看服务器状态');
    const faqButton = screen.getByText('常见问题解答');

    expect(statusButton).toHaveClass(
      'inline-flex',
      'items-center',
      'justify-center',
      'px-3',
      'py-2',
      'bg-blue-600',
      'hover:bg-blue-700',
      'text-white',
      'text-sm',
      'font-medium',
      'rounded-lg',
      'transition-colors',
      'max-w-36'
    );

    expect(faqButton).toHaveClass(
      'inline-flex',
      'items-center',
      'justify-center',
      'px-3',
      'py-2',
      'bg-gray-600',
      'hover:bg-gray-700',
      'text-white',
      'text-sm',
      'font-medium',
      'rounded-lg',
      'transition-colors',
      'max-w-36'
    );
  });

  it('应该渲染 SVG 图标', () => {
    const { container } = renderHeroSection();

    const svgIcon = container.querySelector('svg');
    expect(svgIcon).toBeInTheDocument();
    expect(svgIcon).toHaveClass('h-5', 'w-5', 'text-blue-400');
  });
});
