import { GradientText } from '@/components';
import { MINIGAME_KEYS } from '@/constants';
import { motion } from 'framer-motion';
import { useWebSocketV2 } from '@/hooks/useWebSocketV2';

/**
 * 智能格式化运行时间显示
 * 根据时间长度采用不同的显示精度：
 * - < 1天：显示小时分钟
 * - 1天 ≤ t < 100天：显示天和小时
 * - 100天 ≤ t < 1年：只显示天
 * - 1年 ≤ t < 100年：显示年和天
 * - ≥ 100年：只显示年
 */
const formatUptimeDisplay = (
  seconds: number | null | undefined,
  isConnectionFailed: boolean
): string => {
  if (isConnectionFailed) {
    return '连接失败';
  }

  if (!seconds || seconds <= 0) {
    return '0分';
  }

  // 时间常量
  const MINUTE = 60;
  const HOUR = 3600;
  const DAY = 86400;
  const YEAR = 365 * DAY; // 31536000秒
  const HUNDRED_DAYS = 100 * DAY; // 8640000秒
  const HUNDRED_YEARS = 100 * YEAR; // 3153600000秒

  const totalSeconds = Math.floor(seconds);

  // ≥ 100年：只显示年
  if (totalSeconds >= HUNDRED_YEARS) {
    const years = Math.floor(totalSeconds / YEAR);
    return `${years}年`;
  }

  // 1年 ≤ t < 100年：显示年和天
  if (totalSeconds >= YEAR) {
    const years = Math.floor(totalSeconds / YEAR);
    const remainingSeconds = totalSeconds % YEAR;
    const days = Math.floor(remainingSeconds / DAY);
    return `${years}年${days}天`;
  }

  // 100天 ≤ t < 1年：只显示天
  if (totalSeconds >= HUNDRED_DAYS) {
    const days = Math.floor(totalSeconds / DAY);
    return `${days}天`;
  }

  // 1天 ≤ t < 100天：显示天和小时
  if (totalSeconds >= DAY) {
    const days = Math.floor(totalSeconds / DAY);
    const remainingSeconds = totalSeconds % DAY;
    const hours = Math.floor(remainingSeconds / HOUR);
    return `${days}天${hours}小时`;
  }

  // < 1天：显示小时分钟
  if (totalSeconds >= HOUR) {
    const hours = Math.floor(totalSeconds / HOUR);
    const remainingSeconds = totalSeconds % HOUR;
    const minutes = Math.floor(remainingSeconds / MINUTE);
    return `${hours}小时${minutes}分`;
  }

  // < 1小时：显示分钟
  if (totalSeconds >= MINUTE) {
    const minutes = Math.floor(totalSeconds / MINUTE);
    return `${minutes}分`;
  }

  // < 1分钟：显示秒
  return `${totalSeconds}秒`;
};

/**
 * 获取服务器状态
 */
const getServerStatus = (server: any): 'online' | 'offline' | 'maintenance' => {
  if (!server) return 'offline';

  // 如果有明确的维护状态字段
  if (server.maintenance) return 'maintenance';

  // 根据 online 字段判断
  return server.online ? 'online' : 'offline';
};

/**
 * 获取服务器玩家数量
 */
const getServerPlayerCount = (server: any): number => {
  if (!server) return 0;
  return server.players_count || 0;
};

/**
 * 服务器状态行组件
 */
interface ServerStatusRowProps {
  title: string;
  status: 'online' | 'offline' | 'maintenance';
  players: number;
  id: string;
  isConnectionFailed?: boolean;
}

const ServerStatusRow: React.FC<ServerStatusRowProps> = ({
                                                           title,
                                                           status,
                                                           players,
                                                           id,
                                                           isConnectionFailed,
                                                         }) => {
  const getDisplayText = () => {
    if (isConnectionFailed) {
      return '连接失败';
    }
    if (status === 'maintenance') {
      return '维护中';
    }
    if (status === 'offline') {
      return '离线';
    }
    return `${players} 在线`;
  };

  const getStatusDotColor = () => {
    if (isConnectionFailed || status === 'offline') {
      return 'bg-red-500';
    }
    if (status === 'maintenance') {
      return 'bg-yellow-500 animate-pulse';
    }
    return 'bg-green-500';
  };

  const getTextColor = () => {
    if (isConnectionFailed || status === 'offline') {
      return 'text-red-400';
    }
    if (status === 'maintenance') {
      return 'text-yellow-400';
    }
    return 'text-blue-400';
  };

  return (
    <div className="px-5 py-4 bg-[#151b2d]/80 rounded-lg border border-[#2a365c]/70">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3 mr-3 flex-shrink-1">
          <div
            className={`w-4 h-4 flex-shrink-0 rounded-full ${getStatusDotColor()}`}
            id={`${id}-status-dot-desktop`}
          />
          <span className="text-sm md:text-base font-medium text-gray-200">{title}</span>
        </div>
        <div
          className={`text-sm md:text-base font-mono font-semibold whitespace-nowrap flex-shrink-0 min-w-[70px] text-right ${getTextColor()}`}
          id={`${id}-status-badge-desktop`}
        >
          {getDisplayText()}
        </div>
      </div>
    </div>
  );
};

/**
 * 关于我们组件 - 适配新版 API
 */
export const AboutSection: React.FC = () => {
  const {
    connectionStatus,
    servers,
    aggregateStats,
    runtimeInfo
  } = useWebSocketV2();

  // 检查连接状态
  const isConnectionFailed = connectionStatus !== 'connected';

  // 计算小游戏聚合统计
  const calculateMinigameStats = () => {
    let totalPlayers = 0;
    let onlineCount = 0;
    let hasOnlineServer = false;

    MINIGAME_KEYS.forEach(serverId => {
      const server = servers[serverId];
      if (server) {
        if (server.online) {
          totalPlayers += getServerPlayerCount(server);
          onlineCount++;
          hasOnlineServer = true;
        }
      }
    });

    // 检查登录服务器和大厅
    const loginServer = servers.login;
    const lobbyServer = servers.lobby1;

    if (loginServer && loginServer.online) {
      hasOnlineServer = true;
    }
    if (lobbyServer && lobbyServer.online) {
      hasOnlineServer = true;
    }

    return {
      totalPlayers,
      status: (hasOnlineServer ? 'online' : 'offline') as 'online' | 'offline' | 'maintenance',
      isOnline: hasOnlineServer,
    };
  };

  const minigameStats = calculateMinigameStats();

  // 从 runtimeInfo 获取运行时间，如果没有则使用直接返回的值
  const runningTime = runtimeInfo?.current_uptime_seconds || 0;
  const totalRunningTime = runtimeInfo?.total_uptime_seconds || 0;

  return (
    <section className="mb-32 2xl:mb-24 scroll-mt-32" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 2xl:py-16">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
          {/* 左侧内容 */}
          <div className="md:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6">
                关于
                <span className="ml-2">
                  <GradientText variant="primary">Voidix</GradientText>
                </span>
              </h2>
              <p className="text-gray-400 mb-6">
                Voidix是一个由开发者NekoSora和CYsonHab创建的公益小游戏Minecraft服务器，继承VBPIXEL和EternalStar的精神。我们坚持无商业化运营，致力于为所有玩家提供公平与和谐的游戏环境。
              </p>

              {/* 桌面端统计 */}
              <div className="hidden sm:grid grid-cols-3 gap-3 mt-6">
                <div className="px-4 py-3 bg-[#1a1f2e] rounded-lg border border-[#2a365c] hover:bg-[#1f2538]/60 transition-colors duration-200">
                  <div className="text-xs text-gray-400 mb-1 whitespace-nowrap">在线玩家</div>
                  <div
                    className={`text-base font-bold text-center ${isConnectionFailed ? 'text-red-400' : 'text-white'}`}
                  >
                    {isConnectionFailed ? '连接失败' : `${aggregateStats?.totalPlayers || 0}人`}
                  </div>
                </div>
                <div className="px-4 py-3 bg-[#1a1f2e] rounded-lg border border-[#2a365c] hover:bg-[#1f2538]/60 transition-colors duration-200">
                  <div className="text-xs text-gray-400 mb-1 whitespace-nowrap">运行时间</div>
                  <div
                    className={`text-base font-bold flex justify-center items-center whitespace-nowrap ${isConnectionFailed ? 'text-red-400' : 'text-white'}`}
                  >
                    {formatUptimeDisplay(runningTime, isConnectionFailed)}
                  </div>
                </div>
                <div className="px-4 py-3 bg-[#1a1f2e] rounded-lg border border-[#2a365c] hover:bg-[#1f2538]/60 transition-colors duration-200">
                  <div className="text-xs text-gray-400 mb-1 whitespace-nowrap">总运行时长</div>
                  <div
                    className={`text-base font-bold flex justify-center items-center whitespace-nowrap ${isConnectionFailed ? 'text-red-400' : 'text-white'}`}
                  >
                    {formatUptimeDisplay(totalRunningTime, isConnectionFailed)}
                  </div>
                </div>
              </div>

              {/* 移动端统计 */}
              <div className="sm:hidden grid grid-cols-3 gap-2 mt-6">
                <div className="px-3 py-3 bg-[#1a1f2e] rounded-lg border border-[#2a365c]">
                  <div className="text-xs text-gray-400 mb-1 text-center">在线玩家</div>
                  <div
                    className={`text-base font-bold flex justify-center items-center whitespace-nowrap ${isConnectionFailed ? 'text-red-400' : 'text-white'}`}
                  >
                    {isConnectionFailed ? '连接失败' : `${aggregateStats?.totalPlayers || 0}人`}
                  </div>
                </div>
                <div className="px-3 py-3 bg-[#1a1f2e] rounded-lg border border-[#2a365c]">
                  <div className="text-xs text-gray-400 mb-1 text-center">运行时间</div>
                  <div
                    className={`text-base font-bold flex justify-center items-center whitespace-nowrap ${isConnectionFailed ? 'text-red-400' : 'text-white'}`}
                  >
                    {formatUptimeDisplay(runningTime, isConnectionFailed)}
                  </div>
                </div>
                <div className="px-3 py-3 bg-[#1a1f2e] rounded-lg border border-[#2a365c]">
                  <div className="text-xs text-gray-400 mb-1 text-center">总运行时间</div>
                  <div
                    className={`text-base font-bold flex justify-center items-center whitespace-nowrap ${isConnectionFailed ? 'text-red-400' : 'text-white'}`}
                  >
                    {formatUptimeDisplay(totalRunningTime, isConnectionFailed)}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 右侧服务器状态 */}
          <div className="md:w-1/2 relative mt-10 md:mt-0">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="absolute -top-8 -left-8 w-32 h-32 bg-blue-600 rounded-full filter blur-3xl opacity-20"></div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-indigo-600 rounded-full filter blur-3xl opacity-20"></div>
              <div className="relative bg-[#1a1f2e]/50 border border-[#2a365c] rounded-2xl p-6 md:p-8 backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-5 text-center md:text-left">服务器状态</h3>
                <div className="space-y-4">
                  {/* 小游戏大厅 */}
                  <ServerStatusRow
                    title="小游戏大厅"
                    status={getServerStatus(servers.lobby1)}
                    players={getServerPlayerCount(servers.lobby1)}
                    id="lobby"
                    isConnectionFailed={isConnectionFailed}
                  />

                  {/* 小游戏服务器 */}
                  <ServerStatusRow
                    title="小游戏服务器"
                    status={minigameStats.status}
                    players={minigameStats.totalPlayers}
                    id="minigame"
                    isConnectionFailed={isConnectionFailed}
                  />

                  {/* 生存服务器 */}
                  <ServerStatusRow
                    title="生存服务器"
                    status="maintenance"
                    players={0}
                    id="survival"
                    isConnectionFailed={isConnectionFailed}
                  />
                </div>

                {/* 查看完整状态按钮 */}
                <div className="mt-6 text-center">
                  <a
                    href="/status"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    查看完整状态
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
