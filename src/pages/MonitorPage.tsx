/**
 * 监控页面组件
 * 参考 https://github.com/yb/uptime-status 实现
 * 显示UptimeRobot监控状态的主页面，类似Discord状态页面的设计风格
 */

import { BreadcrumbNavigation } from '@/components';
import { ServiceItem } from '@/components/business/ServiceItem';
import { SEO } from '@/components/seo';
import { EnhancedMonitor, uptimeRobotApi } from '@/services/uptimeRobotApi';
import React, { useCallback, useEffect, useState } from 'react';

export const MonitorPage: React.FC = () => {
  const [monitors, setMonitors] = useState<EnhancedMonitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // 区分初始加载和刷新
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // 获取监控数据
  const fetchMonitors = useCallback(async () => {
    try {
      setError(null);
      const monitorData = await uptimeRobotApi.getMonitors(90);
      setMonitors(monitorData);
      setLastUpdate(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取监控数据失败';
      setError(errorMessage);
      console.error('获取监控数据失败:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    fetchMonitors();
  }, [fetchMonitors]);

  // 定期刷新（每5分钟）
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !refreshing) {
        setRefreshing(true);
        fetchMonitors();
      }
    }, 300000); // 5分钟 = 300000毫秒

    return () => clearInterval(interval);
  }, [fetchMonitors, loading, refreshing]);

  // 手动刷新
  const handleRefresh = () => {
    if (!loading && !refreshing) {
      setRefreshing(true);
      fetchMonitors();
    }
  };

  // 计算总体状态
  const getOverallStatus = () => {
    if (!monitors || monitors.length === 0) return { text: '检查中', color: 'text-blue-400' };

    const downCount = monitors.filter(m => m.status === 'down').length;
    const upCount = monitors.filter(m => m.status === 'ok').length;

    if (downCount > 0) {
      return { text: '部分故障', color: 'text-red-400' };
    } else if (upCount === monitors.length) {
      return { text: '全部正常', color: 'text-green-400' };
    } else {
      return { text: '检查中', color: 'text-yellow-400' };
    }
  };

  const overallStatus = getOverallStatus();

  if (loading && (!monitors || monitors.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-white mb-2">加载监控数据</h3>
          <p className="text-gray-400">正在获取最新监控状态...</p>
        </div>
      </div>
    );
  }

  if (error && (!monitors || monitors.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">加载失败</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        pageKey="monitor"
        type="website"
        url="https://www.voidix.net/monitor"
        canonicalUrl="https://www.voidix.net/monitor"
        enableAnalytics={true}
      />
      <div className="min-h-screen bg-gray-900 pt-12 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <BreadcrumbNavigation className="mb-8" />
          {/* 页面标题和描述 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">过去90天运行时间</h2>
            <p className="text-gray-300">实时监控所有服务的运行状态</p>
          </div>

          {/* 服务状态列表 */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
            {monitors && monitors.length > 0 ? (
              <div className="space-y-0">
                {monitors.map((monitor, index) => (
                  <ServiceItem
                    key={monitor.id}
                    monitor={monitor}
                    className={index === monitors.length - 1 ? 'border-b-0' : ''}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-white mb-2">暂无监控数据</h3>
                <p className="text-gray-300">请检查API配置或稍后重试</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
