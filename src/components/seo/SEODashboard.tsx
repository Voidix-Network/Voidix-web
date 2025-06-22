import React, { useState, useEffect } from 'react';

interface SEOMetric {
  name: string;
  value: number | string;
  status: 'good' | 'warning' | 'error';
  description: string;
  improvement?: string;
}

interface SEODashboardProps {
  className?: string;
  showDetailedMetrics?: boolean;
  enableRealTimeMonitoring?: boolean;
}

/**
 * SEO监控仪表板组件
 *
 * 功能特性：
 * - 实时SEO状态检查
 * - SEO问题检测和建议
 * - 搜索引擎优化得分
 * - 可操作的改进建议
 *
 * 注意：Core Web Vitals由WebVitalsMonitor组件负责
 */
export const SEODashboard: React.FC<SEODashboardProps> = ({
  className = '',
  showDetailedMetrics = true,
  enableRealTimeMonitoring = true,
}) => {
  const [seoMetrics, setSeoMetrics] = useState<SEOMetric[]>([]);
  const [overallScore, setOverallScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // 检测页面SEO状态
  const checkPageSEO = (): SEOMetric[] => {
    const metrics: SEOMetric[] = [];

    // 检查标题标签
    const title = document.querySelector('title')?.textContent;
    metrics.push({
      name: '页面标题',
      value: title ? `${title.length} 字符` : '未设置',
      status: !title
        ? 'error'
        : title.length < 30
          ? 'warning'
          : title.length > 60
            ? 'warning'
            : 'good',
      description: '页面标题是SEO的重要因素',
      improvement: !title
        ? '添加页面标题'
        : title.length < 30
          ? '标题过短，建议30-60字符'
          : title.length > 60
            ? '标题过长，可能被截断'
            : undefined,
    });

    // 检查描述标签
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content');
    metrics.push({
      name: 'Meta描述',
      value: description ? `${description.length} 字符` : '未设置',
      status: !description
        ? 'error'
        : description.length < 120
          ? 'warning'
          : description.length > 160
            ? 'warning'
            : 'good',
      description: 'Meta描述影响搜索结果点击率',
      improvement: !description
        ? '添加Meta描述'
        : description.length < 120
          ? '描述过短，建议120-160字符'
          : description.length > 160
            ? '描述过长，可能被截断'
            : undefined,
    });

    // 检查H1标签
    const h1Elements = document.querySelectorAll('h1');
    metrics.push({
      name: 'H1标题',
      value: `${h1Elements.length} 个`,
      status: h1Elements.length === 0 ? 'error' : h1Elements.length > 1 ? 'warning' : 'good',
      description: '每个页面应该有且仅有一个H1标题',
      improvement:
        h1Elements.length === 0
          ? '添加H1标题'
          : h1Elements.length > 1
            ? '每页只应有一个H1标题'
            : undefined,
    });

    // 检查图片Alt属性
    const images = document.querySelectorAll('img');
    const imagesWithoutAlt = Array.from(images).filter(img => !img.getAttribute('alt'));
    metrics.push({
      name: '图片Alt属性',
      value: `${images.length - imagesWithoutAlt.length}/${images.length}`,
      status:
        imagesWithoutAlt.length === 0
          ? 'good'
          : imagesWithoutAlt.length < images.length * 0.2
            ? 'warning'
            : 'error',
      description: '图片Alt属性提高可访问性和SEO',
      improvement:
        imagesWithoutAlt.length > 0 ? `${imagesWithoutAlt.length} 张图片缺少Alt属性` : undefined,
    });

    // 检查内部链接
    const links = document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');
    metrics.push({
      name: '内部链接',
      value: `${links.length} 个`,
      status: links.length < 3 ? 'warning' : 'good',
      description: '内部链接有助于SEO和用户导航',
      improvement: links.length < 3 ? '建议增加更多内部链接' : undefined,
    });

    // 检查结构化数据
    const structuredData = document.querySelectorAll('script[type="application/ld+json"]');
    metrics.push({
      name: '结构化数据',
      value: `${structuredData.length} 个`,
      status: structuredData.length === 0 ? 'warning' : 'good',
      description: '结构化数据帮助搜索引擎理解内容',
      improvement: structuredData.length === 0 ? '添加结构化数据标记' : undefined,
    });

    // 检查页面速度（简化版，避免与WebVitalsMonitor重复）
    const loadTime = getBasicLoadTime();
    if (loadTime !== null) {
      metrics.push({
        name: '页面加载时间',
        value: `${(loadTime / 1000).toFixed(2)}秒`,
        status: loadTime < 2000 ? 'good' : loadTime < 4000 ? 'warning' : 'error',
        description: '页面加载速度影响用户体验和SEO',
        improvement: loadTime >= 2000 ? '优化页面加载速度' : undefined,
      });
    }

    return metrics;
  };

  // 获取基础加载时间（简化版，避免与其他性能监控组件重复）
  const getBasicLoadTime = (): number | null => {
    try {
      const navigationTiming = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      if (navigationTiming) {
        return (
          navigationTiming.loadEventEnd -
          (navigationTiming.fetchStart || navigationTiming.startTime)
        );
      }
    } catch (error) {
      console.warn('Performance timing not available');
    }
    return null;
  };

  // 计算SEO得分（移除Web Vitals部分）
  const calculateSEOScore = (metrics: SEOMetric[]): number => {
    const seoScore = metrics.reduce((score, metric) => {
      switch (metric.status) {
        case 'good':
          return score + 10;
        case 'warning':
          return score + 6;
        case 'error':
          return score + 0;
        default:
          return score;
      }
    }, 0);

    const maxScore = metrics.length * 10;
    return Math.round((seoScore / maxScore) * 100);
  };

  // 初始化和更新监控数据
  useEffect(() => {
    const updateMetrics = async () => {
      setIsLoading(true);

      const seoData = checkPageSEO();
      setSeoMetrics(seoData);
      setOverallScore(calculateSEOScore(seoData));

      setIsLoading(false);
    };

    updateMetrics();

    // 实时监控
    if (enableRealTimeMonitoring) {
      const interval = setInterval(updateMetrics, 30000); // 每30秒更新
      return () => clearInterval(interval);
    }
  }, [enableRealTimeMonitoring]);

  // 状态颜色映射
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-100';
      case 'warning':
      case 'needs-improvement':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
      case 'poor':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // 得分颜色
  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Web Vitals单位格式化（移除，由WebVitalsMonitor组件负责）

  if (isLoading) {
    return (
      <div className={`p-6 bg-white rounded-lg shadow-sm border ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-white rounded-lg shadow-sm border ${className}`}>
      {/* 标题和总分 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">SEO状态监控</h3>
        <div className="text-right">
          <div className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}</div>
          <div className="text-sm text-gray-500">SEO得分</div>
        </div>
      </div>

      {/* 提示信息 */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          💡 Core Web Vitals性能指标由专门的WebVitalsMonitor组件监控
        </p>
      </div>

      {/* SEO指标 */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">SEO检查</h4>
        <div className="space-y-3">
          {seoMetrics.map((metric, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="font-medium text-gray-900">{metric.name}</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(metric.status)}`}
                  >
                    {metric.status === 'good'
                      ? '良好'
                      : metric.status === 'warning'
                        ? '警告'
                        : '错误'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">{metric.description}</div>
                {metric.improvement && (
                  <div className="text-sm text-blue-600 mt-1">💡 {metric.improvement}</div>
                )}
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">{metric.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 详细指标 */}
      {showDetailedMetrics && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <p>• SEO数据每30秒自动更新</p>
            <p>• SEO得分基于页面优化检查项计算</p>
            <p>• 建议关注标记为"警告"或"错误"的项目</p>
            <p>• Core Web Vitals由WebVitalsMonitor组件单独监控</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SEODashboard;
