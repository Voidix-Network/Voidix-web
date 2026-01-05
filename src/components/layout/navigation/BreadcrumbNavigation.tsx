import { useSchema } from '@/hooks/useSchema';
import { ChevronRight, Home } from 'lucide-react';
import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

interface BreadcrumbNavigationProps {
  items?: BreadcrumbItem[];
  className?: string;
}

/**
 * 面包屑导航组件
 * 支持SEO优化的结构化数据和无障碍访问
 */
export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  items,
  className = '',
}) => {
  const location = useLocation();
  const { addSchema, removeSchema } = useSchema();

  const breadcrumbs = useMemo(() => {
    if (items) {
      return items;
    }

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const generatedBreadcrumbs: BreadcrumbItem[] = [{ label: '首页', href: '/' }];

    // 路径映射
    const pathMap: Record<string, string> = {
      status: '服务器状态',
      faq: '常见问题',
      'bug-report': 'Bug反馈',
      privacy: '隐私政策',
      'ban-history': '封禁查询',
      issue: 'Issue系统',
    };

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;

      generatedBreadcrumbs.push({
        label: pathMap[segment] || segment,
        href: isLast ? undefined : currentPath,
        isCurrentPage: isLast,
      });
    });

    return generatedBreadcrumbs;
  }, [location.pathname, items]);

  // 生成结构化数据（全局唯一，强化去重）
  React.useEffect(() => {
    if (breadcrumbs.length <= 1) return;

    // 获取正确的域名（强制使用生产域名避免测试URL）
    const getBaseUrl = () => {
      // 始终使用生产域名，避免测试域名出现在结构化数据中
      return 'https://www.voidix.net';
    };

    const baseUrl = getBaseUrl();

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item, index) => {
        const listItem: any = {
          '@type': 'ListItem',
          position: index + 1,
          name: item.label,
        };

        // 为每个面包屑项添加item属性，确保URL正确
        if (item.href) {
          listItem.item = {
            '@type': 'Thing',
            '@id': `${baseUrl}${item.href}`,
          };
        } else if (item.isCurrentPage && index > 0) {
          // 当前页面使用当前路径
          listItem.item = {
            '@type': 'Thing',
            '@id': `${baseUrl}${location.pathname}`,
          };
        }

        return listItem;
      }),
    };

    // 使用SchemaManager设置面包屑结构化数据
    addSchema('BreadcrumbList', breadcrumbSchema);
    console.log('[BreadcrumbNavigation] 已通过useSchema设置面包屑结构化数据');

    // 清理函数
    return () => {
      removeSchema('BreadcrumbList');
    };
  }, [breadcrumbs, addSchema, removeSchema]);

  // 不显示面包屑如果只有首页
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="面包屑导航" className={`flex items-center space-x-2 text-sm ${className}`}>
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((item, index) => (
          <li key={index} className="flex items-center space-x-2">
            {/* 分隔符 */}
            {index > 0 && <ChevronRight className="w-4 h-4 text-gray-300" aria-hidden="true" />}

            {/* 面包屑项 */}
            {item.href && !item.isCurrentPage ? (
              <Link
                to={item.href}
                className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1"
              >
                {index === 0 && <Home className="w-4 h-4" />}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span
                className={`${
                  item.isCurrentPage ? 'text-white font-medium' : 'text-gray-300'
                } flex items-center space-x-1`}
                aria-current={item.isCurrentPage ? 'page' : undefined}
              >
                {index === 0 && <Home className="w-4 h-4" />}
                <span>{item.label}</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default BreadcrumbNavigation;
