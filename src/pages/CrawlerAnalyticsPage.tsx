import { AdminAuth } from '@/components/admin/AdminAuth';
import { SEO } from '@/components/seo';
import { motion } from 'framer-motion';
import { Activity, Bot, Clock, Globe, RefreshCw, Search, Shield, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface CrawlerVisit {
  id: string;
  timestamp: number;
  userAgent: string;
  ip?: string;
  url: string;
  crawler: string;
  isBot: boolean;
  referrer?: string;
  viewport?: string;
}

interface CrawlerStats {
  totalVisits: number;
  uniqueCrawlers: string[];
  lastVisit?: CrawlerVisit;
  crawlerCounts: Record<string, number>;
  pageVisits: Record<string, number>;
}

export const CrawlerAnalyticsPage: React.FC = () => {
  const [visits, setVisits] = useState<CrawlerVisit[]>([]);
  const [stats, setStats] = useState<CrawlerStats | null>(null);
  const [loading, setLoading] = useState(true);

  // 检测爬虫类型
  const detectCrawler = (userAgent: string): { crawler: string; isBot: boolean } => {
    const ua = userAgent.toLowerCase();

    if (ua.includes('googlebot')) return { crawler: 'Googlebot', isBot: true };
    if (ua.includes('bingbot')) return { crawler: 'Bingbot', isBot: true };
    if (ua.includes('baiduspider')) return { crawler: 'Baiduspider', isBot: true };
    if (ua.includes('sosospider') || ua.includes('sogou'))
      return { crawler: 'Sogou Spider', isBot: true };
    if (ua.includes('yandexbot')) return { crawler: 'YandexBot', isBot: true };
    if (ua.includes('facebookexternalhit')) return { crawler: 'Facebook Crawler', isBot: true };
    if (ua.includes('twitterbot')) return { crawler: 'TwitterBot', isBot: true };
    if (ua.includes('whatsapp')) return { crawler: 'WhatsApp', isBot: true };
    if (ua.includes('telegrambot')) return { crawler: 'Telegram Bot', isBot: true };
    if (ua.includes('discordbot')) return { crawler: 'Discord Bot', isBot: true };
    if (ua.includes('slackbot')) return { crawler: 'SlackBot', isBot: true };
    if (ua.includes('linkedinbot')) return { crawler: 'LinkedIn Bot', isBot: true };
    if (ua.includes('applebot')) return { crawler: 'AppleBot', isBot: true };
    if (ua.includes('duckduckbot')) return { crawler: 'DuckDuckBot', isBot: true };
    if (ua.includes('ahrefsbot')) return { crawler: 'AhrefsBot', isBot: true };
    if (ua.includes('semrushbot')) return { crawler: 'SemrushBot', isBot: true };
    if (ua.includes('mj12bot')) return { crawler: 'MJ12Bot', isBot: true };
    if (ua.includes('dotbot')) return { crawler: 'DotBot', isBot: true };
    if (ua.includes('bot') || ua.includes('spider') || ua.includes('crawler')) {
      return { crawler: 'Unknown Bot', isBot: true };
    }

    return { crawler: 'Human User', isBot: false };
  };

  // 记录当前访问
  const recordVisit = () => {
    const now = Date.now();
    const userAgent = navigator.userAgent;
    const url = window.location.href;
    const referrer = document.referrer;
    const viewport = `${window.innerWidth}x${window.innerHeight}`;
    const { crawler, isBot } = detectCrawler(userAgent);

    const visit: CrawlerVisit = {
      id: `${now}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: now,
      userAgent,
      url,
      crawler,
      isBot,
      referrer: referrer || undefined,
      viewport,
    };

    // 获取现有访问记录
    const existingVisits = JSON.parse(localStorage.getItem('voidix_crawler_visits') || '[]');
    const updatedVisits = [visit, ...existingVisits].slice(0, 1000); // 保留最近1000条记录

    localStorage.setItem('voidix_crawler_visits', JSON.stringify(updatedVisits));
    setVisits(updatedVisits);
  };

  // 加载访问记录
  const loadVisits = () => {
    setLoading(true);
    try {
      const savedVisits = JSON.parse(localStorage.getItem('voidix_crawler_visits') || '[]');
      setVisits(savedVisits);

      // 计算统计数据
      const crawlerCounts: Record<string, number> = {};
      const pageVisits: Record<string, number> = {};
      const uniqueCrawlers = new Set<string>();

      savedVisits.forEach((visit: CrawlerVisit) => {
        crawlerCounts[visit.crawler] = (crawlerCounts[visit.crawler] || 0) + 1;
        uniqueCrawlers.add(visit.crawler);

        const url = new URL(visit.url);
        const page = url.pathname;
        pageVisits[page] = (pageVisits[page] || 0) + 1;
      });

      setStats({
        totalVisits: savedVisits.length,
        uniqueCrawlers: Array.from(uniqueCrawlers),
        lastVisit: savedVisits[0],
        crawlerCounts,
        pageVisits,
      });
    } catch (error) {
      console.error('加载访问记录失败:', error);
    }
    setLoading(false);
  };

  // 清除记录
  const clearVisits = () => {
    if (confirm('确定要清除所有访问记录吗？')) {
      localStorage.removeItem('voidix_crawler_visits');
      setVisits([]);
      setStats(null);
    }
  };

  useEffect(() => {
    loadVisits();
    recordVisit();
  }, []);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  const getCrawlerIcon = (crawler: string) => {
    if (crawler.includes('Google')) return '🔍';
    if (crawler.includes('Bing')) return '🅱️';
    if (crawler.includes('Baidu')) return '🐾';
    if (crawler.includes('Sogou')) return '🦮';
    if (crawler.includes('Yandex')) return '🇷🇺';
    if (crawler.includes('Facebook')) return '📘';
    if (crawler.includes('Twitter')) return '🐦';
    if (crawler.includes('Human')) return '👤';
    return '🤖';
  };

  return (
    <AdminAuth onAuthSuccess={() => console.log('Admin authenticated successfully')}>
      <>
        <SEO
          pageKey="crawler-analytics"
          type="website"
          url="https://www.voidix.net/admin/crawler-analytics"
          canonicalUrl="https://www.voidix.net/admin/crawler-analytics"
          title="爬虫访问分析 - Voidix管理后台"
          description="搜索引擎爬虫访问情况监控和诊断工具"
          enableAnalytics={false}
          additionalMeta={[{ name: 'robots', content: 'noindex, nofollow' }]}
        />

        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4">
          <div className="max-w-7xl mx-auto">
            {/* 页面标题 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Shield className="h-8 w-8 text-blue-400" />
                <h1 className="text-4xl font-bold text-white">搜索引擎爬虫分析</h1>
              </div>
              <p className="text-gray-300 text-lg">监控和诊断搜索引擎爬虫访问情况</p>
            </motion.div>

            {/* 操作按钮 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex gap-4 mb-8 justify-center"
            >
              <button
                onClick={loadVisits}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                刷新数据
              </button>
              <button
                onClick={clearVisits}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <Activity className="h-4 w-4" />
                清除记录
              </button>
            </motion.div>

            {loading ? (
              <div className="text-center text-white">
                <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>加载数据中...</p>
              </div>
            ) : (
              <>
                {/* 统计概览 */}
                {stats && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
                  >
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-8 w-8 text-green-400" />
                        <div>
                          <p className="text-gray-300 text-sm">总访问量</p>
                          <p className="text-2xl font-bold text-white">{stats.totalVisits}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                      <div className="flex items-center gap-3">
                        <Bot className="h-8 w-8 text-blue-400" />
                        <div>
                          <p className="text-gray-300 text-sm">爬虫类型</p>
                          <p className="text-2xl font-bold text-white">
                            {stats.uniqueCrawlers.length}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                      <div className="flex items-center gap-3">
                        <Globe className="h-8 w-8 text-purple-400" />
                        <div>
                          <p className="text-gray-300 text-sm">页面数量</p>
                          <p className="text-2xl font-bold text-white">
                            {Object.keys(stats.pageVisits).length}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                      <div className="flex items-center gap-3">
                        <Clock className="h-8 w-8 text-orange-400" />
                        <div>
                          <p className="text-gray-300 text-sm">最近访问</p>
                          <p className="text-sm font-medium text-white">
                            {stats.lastVisit ? formatTime(stats.lastVisit.timestamp) : '无记录'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 爬虫分布统计 */}
                {stats && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
                  >
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        爬虫类型分布
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(stats.crawlerCounts)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 10)
                          .map(([crawler, count]) => (
                            <div key={crawler} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{getCrawlerIcon(crawler)}</span>
                                <span className="text-gray-300">{crawler}</span>
                              </div>
                              <span className="text-white font-medium">{count}</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        页面访问统计
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(stats.pageVisits)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 10)
                          .map(([page, count]) => (
                            <div key={page} className="flex items-center justify-between">
                              <span className="text-gray-300 truncate">{page}</span>
                              <span className="text-white font-medium">{count}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 访问记录列表 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden"
                >
                  <div className="p-6 border-b border-white/20">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      最近访问记录 (最新{Math.min(visits.length, 50)}条)
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            时间
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            爬虫类型
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            页面
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            User Agent
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            来源
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {visits.slice(0, 50).map(visit => (
                          <tr key={visit.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {formatTime(visit.timestamp)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{getCrawlerIcon(visit.crawler)}</span>
                                <span
                                  className={`text-sm font-medium ${visit.isBot ? 'text-green-400' : 'text-blue-400'}`}
                                >
                                  {visit.crawler}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300">
                              {new URL(visit.url).pathname}
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-400 max-w-xs truncate">
                              {visit.userAgent}
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-400">
                              {visit.referrer ? new URL(visit.referrer).hostname : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {visits.length === 0 && (
                    <div className="p-12 text-center">
                      <Bot className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">暂无访问记录</p>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </div>
        </div>
      </>
    </AdminAuth>
  );
};
