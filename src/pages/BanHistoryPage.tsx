import { SEO } from '@/components/seo';
import { useWebSocketV2 } from '@/hooks/useWebSocketV2';
import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
// 添加 BreadcrumbNavigation 导入
import { BreadcrumbNavigation } from '@/components';

interface BanRecord {
  id: number;
  uuid: string;
  player_name?: string;
  reason: string;
  banned_by_name: string;
  time: number;
  until: number;
  active: boolean;
  removed_by_name?: string;
  removed_by_date?: number;
}

interface WarningRecord {
  id: number;
  uuid: string;
  player_name?: string;
  reason: string;
  banned_by_name: string;
  time: number;
  until: number;
  active: boolean;
  warned: boolean;
}

interface MuteRecord {
  id: number;
  uuid: string;
  player_name?: string;
  reason: string;
  banned_by_name: string;
  time: number;
  until: number;
  active: boolean;
}

interface HistoryRecord {
  id: number;
  date: number;
  name: string;
  uuid: string;
}

interface QueryParams {
  page: number;
  pageSize: number;
  search: string;
  activeOnly: boolean;
}

const BanHistoryPage: React.FC = () => {
  const { connectionStatus } = useWebSocketV2();
  const [activeTab, setActiveTab] = useState<'bans' | 'warnings' | 'mutes'>('bans');
  const [queryParams, setQueryParams] = useState<QueryParams>({
    page: 1,
    pageSize: 10,
    search: '',
    activeOnly: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    bans: BanRecord[];
    warnings: WarningRecord[];
    mutes: MuteRecord[];
    history: HistoryRecord[];
    total: number;
    totalPages: number;
  }>({
    bans: [],
    warnings: [],
    mutes: [],
    history: [],
    total: 0,
    totalPages: 0,
  });

  // WebSocket连接状态检查
  useEffect(() => {
    if (connectionStatus === 'failed' || connectionStatus === 'disconnected') {
      setError('无法连接到服务器,请检查网络');
    }
  }, [connectionStatus]);

  // 查询数据
  const fetchData = async () => {
    if (connectionStatus !== 'connected') {
      setError('WebSocket未连接');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const ws = new WebSocket('wss://api.voidix.net:10203');

      const timeout = setTimeout(() => {
        ws.close();
        setError('请求超时');
        setLoading(false);
      }, 10000);

      ws.onopen = () => {
        const payload: any = {
          type: 'get_litebans_data',
          action: activeTab,
          page: queryParams.page,
          page_size: queryParams.pageSize,
          echo: `ban_history_${Date.now()}`,
        };

        if (queryParams.search) {
          payload.search = queryParams.search;
        }

        ws.send(JSON.stringify(payload));
      };

      ws.onmessage = event => {
        clearTimeout(timeout);
        const response = JSON.parse(event.data);

        if (response.error) {
          setError(response.error);
          setData({ bans: [], warnings: [], mutes: [], history: [], total: 0, totalPages: 0 });
        } else {
          // 根据action类型处理不同响应
          if (response.type === 'litebans_bans_response') {
            setData({
              bans: response.records || [],
              warnings: [],
              mutes: [],
              history: [],
              total: response.total || 0,
              totalPages: response.total_pages || 0,
            });
          } else if (response.type === 'litebans_warnings_response') {
            setData({
              bans: [],
              warnings: response.records || [],
              mutes: [],
              history: [],
              total: response.total || 0,
              totalPages: response.total_pages || 0,
            });
          } else if (response.type === 'litebans_mutes_response') {
            setData({
              bans: [],
              warnings: [],
              mutes: response.records || [],
              history: [],
              total: response.total || 0,
              totalPages: response.total_pages || 0,
            });
          } else if (response.type === 'litebans_history_response') {
            setData({
              bans: [],
              warnings: [],
              mutes: [],
              history: response.records || [],
              total: response.total || 0,
              totalPages: response.total_pages || 0,
            });
          }
        }

        setLoading(false);
        ws.close();
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        setError('WebSocket连接错误');
        setLoading(false);
        ws.close();
      };

      ws.onclose = () => {
        if (!loading) return;
      };
    } catch (err) {
      setError('查询失败: ' + (err instanceof Error ? err.message : '未知错误'));
      setLoading(false);
    }
  };

  // 重置分页当搜索或标签改变时
  useEffect(() => {
    setQueryParams(prev => ({ ...prev, page: 1 }));
  }, [activeTab, queryParams.search, queryParams.activeOnly]);

  // 执行查询
  useEffect(() => {
    if (connectionStatus === 'connected') {
      fetchData();
    }
  }, [
    activeTab,
    queryParams.page,
    queryParams.pageSize,
    queryParams.search,
    queryParams.activeOnly,
    connectionStatus,
  ]);

  // 格式化时间戳 - 自动检测秒级或毫秒级
  const formatTime = (timestamp: number) => {
    if (!timestamp || timestamp === 0 || timestamp === -1) return '永久';

    // 智能检测时间戳格式
    // 秒级时间戳: 10位数字 (例如: 1735401600 = 2024-12-28)
    // 毫秒级时间戳: 13位数字 (例如: 1735401600000 = 2024-12-28)
    const ms = timestamp < 10000000000 ? timestamp * 1000 : timestamp;

    const date = new Date(ms);

    // 使用 Asia/Shanghai 时区确保显示正确的北京时间
    return date.toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  // 计算时间差
  const getTimeAgo = (timestamp: number) => {
    if (!timestamp || timestamp === 0 || timestamp === -1) return '';

    // 自动检测秒级或毫秒级时间戳
    const ms = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
    const now = Date.now();
    const diff = now - ms;

    // 调试信息（开发时可以取消注释查看）
    // console.log('Time debug:', {
    //   timestamp,
    //   ms,
    //   now,
    //   diff,
    //   date: new Date(ms).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
    //   diffMinutes: Math.floor(diff / 60000)
    // });

    // 如果是未来时间（差值为负）
    if (diff < 0) {
      const absDiff = Math.abs(diff);
      if (absDiff < 300000) return '刚刚'; // 5分钟内的误差当作"刚刚"（可能是服务器时间差）

      // 如果真的是未来时间，显示"将在X后"
      const seconds = Math.floor(absDiff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) return `${days}天后`;
      if (hours > 0) return `${hours}小时后`;
      if (minutes > 0) return `${minutes}分钟后`;
      return '即将';
    }

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years}年前`;
    if (months > 0) return `${months}个月前`;
    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    if (minutes > 0) return `${minutes}分钟前`;
    if (seconds > 10) return `${seconds}秒前`;
    return '刚刚';
  };

  // 渲染记录卡片
  const renderBanCard = (ban: BanRecord, index: number) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-gray-900/50"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2 flex-wrap">
            {ban.player_name && (
              <span className="text-white font-semibold text-base">{ban.player_name}</span>
            )}
            <span className="text-gray-400 font-mono text-xs">{ban.uuid}</span>
            {ban.active ? (
              <span className="px-2 py-0.5 bg-red-900/50 text-red-400 text-xs rounded border border-red-800">
                活跃
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded border border-gray-600">
                已解除
              </span>
            )}
          </div>
          <p className="text-gray-300 mb-2">{ban.reason}</p>
          <div className="text-xs text-gray-500 space-x-3">
            <span>管理员: {ban.banned_by_name}</span>
            <span>
              时间: {formatTime(ban.time)} ({getTimeAgo(ban.time)})
            </span>
            {ban.until > 0 && <span>到期: {formatTime(ban.until)}</span>}
          </div>
          {ban.removed_by_name && (
            <div className="text-xs text-gray-500 mt-1">
              <span>解除人: {ban.removed_by_name}</span>
              {ban.removed_by_date && <span> • 解除时间: {formatTime(ban.removed_by_date)}</span>}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  const renderWarningCard = (warning: WarningRecord, index: number) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-gray-900/50"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2 flex-wrap">
            {warning.player_name && (
              <span className="text-white font-semibold text-base">{warning.player_name}</span>
            )}
            <span className="text-gray-400 font-mono text-xs">{warning.uuid}</span>
            {warning.active ? (
              <span className="px-2 py-0.5 bg-yellow-900/50 text-yellow-400 text-xs rounded border border-yellow-800">
                活跃
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded border border-gray-600">
                已过期
              </span>
            )}
            {warning.warned && (
              <span className="px-2 py-0.5 bg-orange-900/50 text-orange-400 text-xs rounded border border-orange-800">
                已警告
              </span>
            )}
          </div>
          <p className="text-gray-300 mb-2">{warning.reason}</p>
          <div className="text-xs text-gray-500 space-x-3">
            <span>管理员: {warning.banned_by_name}</span>
            <span>
              时间: {formatTime(warning.time)} ({getTimeAgo(warning.time)})
            </span>
            {warning.until > 0 && <span>到期: {formatTime(warning.until)}</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderMuteCard = (mute: MuteRecord, index: number) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-gray-900/50"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2 flex-wrap">
            {mute.player_name && (
              <span className="text-white font-semibold text-base">{mute.player_name}</span>
            )}
            <span className="text-gray-400 font-mono text-xs">{mute.uuid}</span>
            {mute.active ? (
              <span className="px-2 py-0.5 bg-purple-900/50 text-purple-400 text-xs rounded border border-purple-800">
                活跃
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded border border-gray-600">
                已解除
              </span>
            )}
          </div>
          <p className="text-gray-300 mb-2">{mute.reason}</p>
          <div className="text-xs text-gray-500 space-x-3">
            <span>管理员: {mute.banned_by_name}</span>
            <span>
              时间: {formatTime(mute.time)} ({getTimeAgo(mute.time)})
            </span>
            {mute.until > 0 && <span>到期: {formatTime(mute.until)}</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );

  // 渲染分页控件
  const renderPagination = () => {
    const totalPages = data.totalPages;
    const currentPage = queryParams.page;

    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <button
          onClick={() => setQueryParams(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
          disabled={currentPage === 1}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700 hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          上一页
        </button>

        <span className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300">
          第 {currentPage} / {totalPages} 页
        </span>

        <button
          onClick={() =>
            setQueryParams(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))
          }
          disabled={currentPage === totalPages}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700 hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          下一页
        </button>
      </div>
    );
  };

  // @ts-ignore
  return (
    <>
      <SEO
        pageKey="ban-history"
        type="website"
        url="https://www.voidix.net/ban-history"
        canonicalUrl="https://www.voidix.net/ban-history"
      />

      <div className="min-h-screen bg-gray-900 py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* 添加面包屑导航 - 放在标题区域之前 */}
          <BreadcrumbNavigation className="mb-8" />

          {/* 标题区域 - 优化后与 StatusPage 保持一致 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-white mb-4">封禁查询系统</h1>
            <p className="text-gray-300 text-lg">查询封禁、警告、禁言和历史记录</p>

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
                    : '未连接'}
              </span>
            </div>
          </motion.div>

          {/* 搜索和过滤区域 - 优化布局 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8 shadow-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-gray-400 text-sm font-medium mb-2">搜索关键词</label>
                <input
                  type="text"
                  placeholder="UUID、用户名或原因..."
                  value={queryParams.search}
                  onChange={e => setQueryParams(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">每页显示</label>
                <select
                  value={queryParams.pageSize}
                  onChange={e =>
                    setQueryParams(prev => ({
                      ...prev,
                      pageSize: parseInt(e.target.value),
                      page: 1,
                    }))
                  }
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300 hover:border-gray-600 cursor-pointer appearance-none bg-no-repeat bg-right pr-10"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundSize: '1.5rem',
                    backgroundPosition: 'right 0.5rem center',
                  }}
                >
                  <option value={5}>5 条</option>
                  <option value={10}>10 条</option>
                  <option value={20}>20 条</option>
                  <option value={50}>50 条</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* 标签页 - 优化样式 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'bans', label: '封禁记录', color: 'red', icon: '🚫' },
                { key: 'warnings', label: '警告记录', color: 'yellow', icon: '⚠️' },
                { key: 'mutes', label: '禁言记录', color: 'purple', icon: '🔇' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap flex items-center space-x-2 ${
                    activeTab === tab.key
                      ? 'bg-gray-700 text-white shadow-lg border border-gray-600'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-750 hover:text-gray-200 border border-gray-700'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* 错误提示 */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6"
            >
              <div className="flex items-center space-x-2">
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
                <p className="text-red-400">{error}</p>
              </div>
            </motion.div>
          )}

          {/* 加载状态 */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-gray-400">正在查询数据...</p>
            </div>
          )}

          {/* 数据展示 */}
          {!loading && !error && (
            <>
              <div className="space-y-4">
                {/* 统计信息 - 优化样式 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6 shadow-lg"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">总记录数:</span>
                      <span className="text-white font-bold text-lg">{data.total}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">当前页:</span>
                      <span className="text-white font-semibold">{queryParams.page}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">每页:</span>
                      <span className="text-white font-semibold">{queryParams.pageSize}</span>
                    </div>
                  </div>
                </motion.div>

                {/* 记录列表 */}
                {activeTab === 'bans' && data.bans.length > 0 && (
                  <>
                    {data.bans.map((item, index) => (
                      <div key={item.id || `ban-${index}`}>{renderBanCard(item, index)}</div>
                    ))}
                  </>
                )}

                {activeTab === 'warnings' && data.warnings.length > 0 && (
                  <>
                    {data.warnings.map((item, index) => (
                      <div key={item.id || `warning-${index}`}>
                        {renderWarningCard(item, index)}
                      </div>
                    ))}
                  </>
                )}

                {activeTab === 'mutes' && data.mutes.length > 0 && (
                  <>
                    {data.mutes.map((item, index) => (
                      <div key={item.id || `mute-${index}`}>{renderMuteCard(item, index)}</div>
                    ))}
                  </>
                )}

                {/* 空状态 - 优化样式 */}
                {((activeTab === 'bans' && data.bans.length === 0) ||
                  (activeTab === 'warnings' && data.warnings.length === 0) ||
                  (activeTab === 'mutes' && data.mutes.length === 0)) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                  >
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 inline-block">
                      <svg
                        className="w-16 h-16 mx-auto mb-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-gray-300 text-lg font-medium mb-2">未找到符合条件的记录</p>
                      <p className="text-gray-500 text-sm">尝试调整搜索条件或过滤选项</p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* 分页 */}
              {renderPagination()}
            </>
          )}

          {/* 底部信息 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-16 text-center border-t border-gray-700 pt-8"
          >
            <p className="text-gray-500 text-xs">
              © 2025 Voidix Network. 封禁查询系统 | 数据实时同步
            </p>
            <p className="text-gray-600 text-xs mt-1">
              注意: 出于隐私保护，IP地址等敏感信息不会显示
            </p>
            <p className="text-gray-600 text-xs mt-1">由于时区问题，时间显示可能有误差</p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default BanHistoryPage;
