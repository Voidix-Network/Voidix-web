// filepath: src/pages/StatusPage.tsx
import {
  AnimatedSection,
  BreadcrumbNavigation,
} from '@/components';
import { SEO } from '@/components/seo';
import { useWebSocketV2 } from '@/hooks/useWebSocketV2';
import { analytics } from '@/services/analytics';
import { formatRunningTime } from '@/utils';
import React, { useEffect, useMemo, useState } from 'react';

// 添加动画样式
const animationStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

// 注入样式
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = animationStyles;
  if (!document.head.querySelector('style[data-animations="status-page"]')) {
    styleElement.setAttribute('data-animations', 'status-page');
    document.head.appendChild(styleElement);
  }
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, className = '' }) => (
  <div
    className={`bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors ${className}`}
  >
    <h3 className="text-gray-400 text-sm font-medium mb-2">{title}</h3>
    <p className="text-white text-2xl font-bold">{value}</p>
    {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
  </div>
);

const StatCardSkeleton: React.FC = () => (
  <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 animate-pulse">
    <div className="w-20 h-4 bg-gray-600 rounded mb-2" />
    <div className="w-16 h-8 bg-gray-600 rounded" />
  </div>
);

const ServerCardSkeleton: React.FC = () => (
  <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden animate-pulse">
    <div className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-gray-600" />
          <div>
            <div className="w-32 h-4 bg-gray-600 rounded mb-2" />
            <div className="w-24 h-3 bg-gray-700 rounded" />
          </div>
        </div>
        <div className="text-right">
          <div className="w-20 h-4 bg-gray-600 rounded mb-2" />
          <div className="w-12 h-3 bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  </div>
);

// 玩家卡片组件 - 带鼠标跟随提示框
interface PlayerCardProps {
  player: any;
  isPremium: boolean;
  avatarUrl: string;
  fallbackSvg: string;
  index: number;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, isPremium, avatarUrl, fallbackSvg, index }) => {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; show: boolean }>({
    x: 0,
    y: 0,
    show: false,
  });

  const handleBadgeMouseMove = (e: React.MouseEvent) => {
    const cardRect = e.currentTarget.closest('.player-card')?.getBoundingClientRect();
    if (!cardRect) return;

    setTooltip({
      x: e.clientX - cardRect.left,
      y: e.clientY - cardRect.top - 10, // 提示框显示在鼠标上方10px
      show: true,
    });
  };

  const handleBadgeMouseLeave = () => {
    setTooltip(prev => ({ ...prev, show: false }));
  };

  return (
    <div
      className="player-card bg-gray-700 rounded px-3 py-2 text-sm text-gray-300 flex items-center space-x-2 hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 relative"
      style={{
        animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`,
      }}
    >
      <div className="relative">
        <img
          src={avatarUrl}
          alt={player.name}
          className="w-4 h-4 rounded-sm"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackSvg;
          }}
          loading="lazy"
        />
        {/* 正版玩家标识 - 只在悬停绿点时显示提示框 */}
        {isPremium && (
          <div
            className="absolute -top-1 -right-1"
            onMouseMove={handleBadgeMouseMove}
            onMouseLeave={handleBadgeMouseLeave}
          >
            <div className="w-2 h-2 bg-green-500 rounded-full border border-gray-800 cursor-help transition-all duration-200 hover:bg-green-400 hover:scale-110" />
          </div>
        )}
      </div>
      <span className="font-medium">{player.name}</span>

      {/* 跟随鼠标的提示框 */}
      {isPremium && tooltip.show && (
        <div
          className="absolute z-50 px-2 py-1 bg-gray-800/95 backdrop-blur-sm border border-green-500/50 text-green-400 text-xs rounded-md shadow-lg whitespace-nowrap pointer-events-none"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          正版玩家
        </div>
      )}
    </div>
  );
};

interface ServerCardProps {
  serverId: string;
  serverInfo: any;
  displayName: string;
  categoryTitle: string;
}

const ServerCard: React.FC<ServerCardProps> = ({ serverInfo, displayName }) => {
  const [showPlayers, setShowPlayers] = useState(false);
  const isOnline = serverInfo.online ?? false;
  const players = serverInfo.players || [];
  const playersCount = serverInfo.players_count || 0;

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-gray-900/50">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                isOnline
                  ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50'
                  : 'bg-red-500 shadow-lg shadow-red-500/50'
              }`}
            />
            <div>
              <h3 className="text-white font-semibold">{displayName}</h3>
              <p className="text-gray-400 text-sm">
                {isOnline ? '在线' : '离线'}
                {serverInfo.ping?.version && ` • ${serverInfo.ping.version}`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white font-semibold">{playersCount} 玩家</p>
            {isOnline && players.length > 0 && (
              <button
                onClick={() => setShowPlayers(!showPlayers)}
                className="text-blue-400 hover:text-blue-300 text-sm transition-all duration-200 hover:scale-105"
              >
                {showPlayers ? '隐藏列表' : '查看列表'}
              </button>
            )}
          </div>
        </div>

        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            showPlayers && players.length > 0 ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="pt-4 border-t border-gray-700">
            <h4 className="text-gray-400 text-sm font-medium mb-2">在线玩家：</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {players.map((player: any, index: number) => {
                // 使用 UUID 版本判断是否为正版玩家
                const isPremium = (() => {
                  if (!player.uuid || player.uuid.length !== 36) return false;

                  const uuidParts = player.uuid.split('-');
                  if (uuidParts.length !== 5) return false;

                  // 检查版本号：UUID第三部分的第一个字符
                  // 版本4 = 正版，版本3 = 离线
                  const versionChar = uuidParts[2]?.[0];
                  return versionChar === '4';
                })();

                // 直接使用 Crafatar 获取头像
                const avatarUrl = `https://crafatar.com/avatars/${player.uuid}?size=32&overlay=true`;
                const fallbackSvg = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"%3E%3Crect fill="%234a5568" width="16" height="16"/%3E%3C/svg%3E';

                return (
                  <PlayerCard
                    key={player.uuid}
                    player={player}
                    isPremium={isPremium}
                    avatarUrl={avatarUrl}
                    fallbackSvg={fallbackSvg}
                    index={index}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {!isOnline && serverInfo.error && (
          <div className="mt-3 p-2 bg-red-900/20 border border-red-800 rounded animate-fadeIn">
            <p className="text-red-400 text-xs">{serverInfo.error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface ServerGroupCardProps {
  groupInfo: any;
  groupStats: any;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const ServerGroupCard: React.FC<ServerGroupCardProps> = ({
                                                           groupInfo,
                                                           groupStats,
                                                           isExpanded,
                                                           onToggle,
                                                           children,
                                                         }) => {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden transition-all duration-300 hover:border-gray-600 hover:shadow-lg hover:shadow-gray-900/30">
      <div
        className="p-4 cursor-pointer hover:bg-gray-750 transition-all duration-200"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg
              className={`w-5 h-5 text-gray-400 transition-all duration-300 ease-out ${
                isExpanded ? 'rotate-90 text-blue-400' : 'rotate-0'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <div>
              <h3 className="text-white font-bold text-lg transition-colors duration-200">
                {groupInfo.name}
              </h3>
              <p className="text-gray-400 text-sm">{groupInfo.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white font-semibold text-lg">{groupStats.totalPlayers} 玩家</p>
            <p className="text-gray-400 text-sm">
              {groupStats.onlineServers}/{groupStats.totalServers} 服务器在线
            </p>
          </div>
        </div>
      </div>

      <div
        className={`border-t border-gray-700 bg-gray-850 transition-all duration-500 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{
          overflow: isExpanded ? 'visible' : 'hidden',
        }}
      >
        <div className="p-4 space-y-3">
          {React.Children.map(children, (child, index) => (
            <div
              key={index}
              style={{
                animation: isExpanded ? `slideInLeft 0.4s ease-out ${index * 0.08}s both` : 'none'
              }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const StatusPage: React.FC = () => {
  const {
    connectionStatus,
    servers,
    serverTree,
    isMaintenance,
    runningTime,
    totalRunningTime,
  } = useWebSocketV2();

  const aggregateStats = useMemo(() => {
    const serverList = Object.values(servers);
    const totalPlayers = serverList.reduce((sum, s) => sum + (s.players_count || 0), 0);
    const onlineServers = serverList.filter(s => s.online).length;
    const totalServers = serverList.length;

    return { totalPlayers, onlineServers, totalServers };
  }, [servers]);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
        analytics.track('server_group_expand', {
          groupId,
          source: 'status_page_v2',
        });
      }
      return newSet;
    });
  };

  useEffect(() => {
    analytics.page('ServerStatusV2', {
      pageType: 'monitoring',
      totalServers: Object.keys(servers).length,
    });
  }, [servers]);

  useEffect(() => {
    const serverList = Object.values(servers);
    const onlineCount = serverList.filter((server: any) => server.online).length;

    analytics.track('server_status_view', {
      onlineServers: onlineCount,
      totalServers: serverList.length,
      totalPlayers: aggregateStats.totalPlayers,
      timestamp: Date.now(),
    });
  }, [servers, aggregateStats]);

  // 递归收集服务器并计算统计
  const collectServersAndStats = (node: any): { servers: any[], stats: any } => {
    const result: any[] = [];

    const traverse = (n: any) => {
      if (n.type === 'server' && servers[n.id]) {
        result.push({ id: n.id, name: n.name, data: servers[n.id] });
      } else if (n.type === 'category' && n.children) {
        n.children.forEach(traverse);
      }
    };

    traverse(node);

    const totalPlayers = result.reduce((sum, s) => sum + (s.data.players_count || 0), 0);
    const onlineServers = result.filter(s => s.data.online).length;

    return {
      servers: result,
      stats: {
        totalPlayers,
        onlineServers,
        totalServers: result.length,
      }
    };
  };

  const renderServerTree = () => {
    if (!serverTree || !serverTree.children) return null;

    const renderNode = (node: any, depth: number = 0): React.ReactNode => {
      if (node.type === 'server') {
        const serverData = servers[node.id];
        if (!serverData) return null;

        return (
          <ServerCard
            key={node.id}
            serverId={node.id}
            serverInfo={serverData}
            displayName={node.name}
            categoryTitle=""
          />
        );
      }

      if (node.type === 'category') {
        const { stats } = collectServersAndStats(node);

        // 如果是深层嵌套，添加缩进样式
        const marginLeft = '';

        return (
          <div key={node.id} className={marginLeft}>
            <ServerGroupCard
              groupInfo={{
                name: node.name,
                description: `${stats.onlineServers}/${stats.totalServers} 服务器在线`,
              }}
              groupStats={stats}
              isExpanded={expandedGroups.has(node.id)}
              onToggle={() => toggleGroupExpansion(node.id)}
            >
              {node.children?.map((child: any) => renderNode(child, depth + 1))}
            </ServerGroupCard>
          </div>
        );
      }

      return null;
    };

    return serverTree.children.map((node: any) => renderNode(node));
  };

  return (
    <>
      <SEO
        pageKey="status"
        type="website"
        url="https://www.voidix.net/status"
        canonicalUrl="https://www.voidix.net/status"
      />
      <div className="min-h-screen bg-gray-900 py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <BreadcrumbNavigation className="mb-8" />

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">服务器状态</h1>
            <p className="text-gray-300 text-lg">实时查看 Voidix 网络的服务器状态和统计信息</p>

            <div className="mt-6 flex items-center justify-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected'
                    ? 'bg-green-500 animate-pulse'
                    : connectionStatus === 'reconnecting'
                      ? 'bg-yellow-500 animate-pulse'
                      : 'bg-red-500'
                }`}
              />
              <span className="text-gray-400 text-sm">
                {connectionStatus === 'connected'
                  ? '已连接'
                  : connectionStatus === 'reconnecting'
                    ? '重连中...'
                    : connectionStatus === 'failed'
                      ? '连接失败'
                      : '已断开'}
              </span>
            </div>
          </div>

          {isMaintenance && (
            <div className="bg-gradient-to-r from-yellow-800 to-orange-800 border border-yellow-500 rounded-lg p-6 mb-8 shadow-lg">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                  <svg
                    className="w-4 h-4 text-yellow-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-yellow-100 font-bold text-lg">🚧 服务器维护中</h3>
              </div>
              <p className="text-yellow-100 mb-2">服务器正在进行维护，部分功能可能暂时不可用。</p>
              <p className="text-yellow-200 text-sm">
                💡 请访问官网 www.voidix.net 获取最新信息，或加群 186438621 联系管理员
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {connectionStatus === 'connected' && Object.keys(servers).length > 0 ? (
              <>
                <StatCard
                  title="总在线玩家"
                  value={aggregateStats.totalPlayers}
                  subtitle="跨所有服务器"
                />
                <StatCard
                  title="在线服务器"
                  value={`${aggregateStats.onlineServers}/${aggregateStats.totalServers}`}
                  subtitle="正常运行中"
                />
                <StatCard
                  title="总运行时间"
                  value={formatRunningTime(totalRunningTime || 0)}
                  subtitle="自启动以来"
                />
              </>
            ) : (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            )}
          </div>

          <AnimatedSection className="mb-12">
            <div className="bg-gradient-to-r from-blue-800 to-purple-800 border border-blue-500 rounded-lg p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-blue-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-blue-100 font-bold text-lg">📢 公告系统维护中</h3>
              </div>
              <p className="text-blue-100">公告系统正在升级维护，敬请期待新版本！</p>
            </div>
          </AnimatedSection>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">服务器详情</h2>

            {connectionStatus !== 'connected' ? (
              <div className="text-center py-12">
                <div className="space-y-4">
                  {connectionStatus === 'reconnecting' ? (
                    <>
                      <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                      <div className="text-gray-300">正在连接到服务器...</div>
                    </>
                  ) : connectionStatus === 'failed' ? (
                    <>
                      <svg
                        className="w-12 h-12 text-red-400 mx-auto"
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
                      <div className="text-gray-300">无法连接到服务器</div>
                      <p className="text-gray-300 text-sm">请检查网络连接或稍后再试</p>
                    </>
                  ) : (
                    <>
                      <div className="text-gray-400">正在加载服务器数据...</div>
                      <div className="space-y-4">
                        <ServerCardSkeleton />
                        <ServerCardSkeleton />
                        <ServerCardSkeleton />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : Object.keys(servers).length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400">正在加载服务器数据...</div>
                <div className="space-y-4 mt-6">
                  <ServerCardSkeleton />
                  <ServerCardSkeleton />
                  <ServerCardSkeleton />
                </div>
              </div>
            ) : (
              <div className="space-y-4">{renderServerTree()}</div>
            )}
          </div>

          {runningTime !== null && (
            <div className="mt-12 text-center">
              <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg border border-gray-600 p-6 inline-block shadow-lg">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <svg
                    className="w-5 h-5 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-gray-400 text-sm font-medium">当前运行时间</h3>
                </div>
                <p className="text-green-400 text-2xl font-mono font-bold">
                  {formatRunningTime(runningTime)}
                </p>
                <p className="text-gray-500 text-xs mt-1">自启动以来持续运行</p>
              </div>
            </div>
          )}

          <div className="mt-16 text-center border-t border-gray-700 pt-8">
            <div className="space-y-4">
              <p className="text-gray-500 text-xs">
                © 2025 Voidix Network. 实时服务器状态监控系统
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
