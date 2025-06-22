import { EnhancedMonitor } from '@/services/uptimeRobotApi';
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface MonitorStructuredDataProps {
  monitors: EnhancedMonitor[];
  lastUpdate?: Date;
}

/**
 * 监控页面结构化数据组件
 * 提供服务监控相关的Schema.org标记
 */
export const MonitorStructuredData: React.FC<MonitorStructuredDataProps> = ({
  monitors,
  lastUpdate,
}) => {
  // 计算总体状态
  const calculateOverallStatus = () => {
    if (!monitors || monitors.length === 0) return 'unknown';

    const downCount = monitors.filter(m => m.status === 'down').length;
    const upCount = monitors.filter(m => m.status === 'ok').length;

    if (downCount > 0) return 'partial';
    if (upCount === monitors.length) return 'operational';
    return 'degraded';
  };

  // 服务状态页面Schema
  const serviceStatusSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Voidix服务器监控系统',
    description: 'Voidix Minecraft服务器实时监控状态，显示过去90天的运行时间统计和服务可用性。',
    url: typeof window !== 'undefined' ? window.location.href : 'https://voidix.com/monitor',
    inLanguage: 'zh-CN',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Voidix',
      url: 'https://voidix.com',
    },
    lastReviewed: lastUpdate?.toISOString() || new Date().toISOString(),
    about: {
      '@type': 'Service',
      name: 'Voidix Minecraft服务器',
      provider: {
        '@type': 'Organization',
        name: 'Voidix',
        url: 'https://voidix.com',
      },
      serviceType: 'Minecraft游戏服务器',
      areaServed: 'China',
    },
  };

  // 监控服务Schema
  const monitoringServiceSchema = {
    '@context': 'https://schema.org',
    '@type': 'MonitoringService',
    name: 'Voidix服务器监控',
    description: '24/7实时监控Voidix Minecraft服务器的运行状态、延迟和可用性',
    provider: {
      '@type': 'Organization',
      name: 'Voidix',
    },
    serviceOutput: {
      '@type': 'Dataset',
      name: '服务器运行时间数据',
      description: '过去90天的服务器运行时间统计和性能数据',
      dateModified: lastUpdate?.toISOString() || new Date().toISOString(),
      measurementTechnique: 'HTTP状态检查',
      temporalCoverage: '过去90天',
    },
    monitoredService: monitors.map(monitor => ({
      '@type': 'Service',
      name: monitor.name,
      url: monitor.url,
      serviceStatus: monitor.status === 'ok' ? 'Active' : 'Inactive',
      provider: {
        '@type': 'Organization',
        name: 'Voidix',
      },
    })),
  };

  // 可用性统计Schema
  const availabilitySchema = {
    '@context': 'https://schema.org',
    '@type': 'DataFeed',
    name: 'Voidix服务器可用性统计',
    description: 'Voidix Minecraft服务器运行时间和可用性的历史数据',
    url: typeof window !== 'undefined' ? window.location.href : 'https://voidix.com/monitor',
    dateModified: lastUpdate?.toISOString() || new Date().toISOString(),
    license: 'https://voidix.com/privacy',
    provider: {
      '@type': 'Organization',
      name: 'Voidix',
    },
    dataFeedElement: monitors.map(monitor => ({
      '@type': 'DataFeedItem',
      '@id': `monitor-${monitor.id}`,
      name: monitor.name,
      description: `${monitor.name}的运行时间监控数据`,
      item: {
        '@type': 'Service',
        name: monitor.name,
        url: monitor.url,
        serviceStatus: monitor.status === 'ok' ? 'Active' : 'Inactive',
        availabilityStarts: monitor.daily?.[0]?.date
          ? monitor.daily[0].date.toISOString()
          : undefined,
        availabilityEnds: monitor.daily?.[monitor.daily.length - 1]?.date
          ? monitor.daily[monitor.daily.length - 1].date.toISOString()
          : undefined,
      },
    })),
  };

  // 状态页面Schema（类似Github Status）
  const statusPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'StatusPage',
    name: 'Voidix服务状态',
    description: 'Voidix Minecraft服务器的实时状态和历史可用性数据',
    url: typeof window !== 'undefined' ? window.location.href : 'https://voidix.com/monitor',
    lastReviewed: lastUpdate?.toISOString() || new Date().toISOString(),
    status: calculateOverallStatus(),
    services: monitors.map(monitor => ({
      '@type': 'Service',
      name: monitor.name,
      status: monitor.status === 'ok' ? 'operational' : 'down',
      uptime: monitor.average ? `${monitor.average}%` : 'N/A',
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(serviceStatusSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(monitoringServiceSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(availabilitySchema)}</script>
      <script type="application/ld+json">{JSON.stringify(statusPageSchema)}</script>
    </Helmet>
  );
};

export default MonitorStructuredData;
