import { ChevronRight, Home } from 'lucide-react';
import React from 'react';
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

  // 自动生成面包屑（如果没有提供items）
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ label: '首页', href: '/' }];

    // 路径映射
    const pathMap: Record<string, string> = {
      status: '服务器状态',
      faq: '常见问题',
      'bug-report': 'Bug反馈',
    };

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;

      breadcrumbs.push({
        label: pathMap[segment] || segment,
        href: isLast ? undefined : currentPath,
        isCurrentPage: isLast,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = items || generateBreadcrumbs();

  // 生成结构化数据
  React.useEffect(() => {
    if (breadcrumbs.length <= 1) return;

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        ...(item.href && { item: `https://www.voidix.net${item.href}` }),
      })),
    };

    // 创建或更新面包屑结构化数据
    const existingScript = document.querySelector('script[data-schema="breadcrumb"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', 'breadcrumb');
    script.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(script);

    // 清理函数
    return () => {
      const scriptToRemove = document.querySelector('script[data-schema="breadcrumb"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [breadcrumbs]);

  // 不显示面包屑如果只有首页
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="面包屑导航" className={`flex items-center space-x-2 text-sm ${className}`}>
      <ol
        className="flex items-center space-x-2"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {breadcrumbs.map((item, index) => (
          <li
            key={index}
            className="flex items-center space-x-2"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            {/* 分隔符 */}
            {index > 0 && <ChevronRight className="w-4 h-4 text-gray-300" aria-hidden="true" />}

            {/* 面包屑项 */}
            {item.href && !item.isCurrentPage ? (
              <Link
                to={item.href}
                className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1"
                itemProp="item"
              >
                {index === 0 && <Home className="w-4 h-4" />}
                <span itemProp="name">{item.label}</span>
              </Link>
            ) : (
              <span
                className={`${
                  item.isCurrentPage ? 'text-white font-medium' : 'text-gray-300'
                } flex items-center space-x-1`}
                itemProp="name"
                aria-current={item.isCurrentPage ? 'page' : undefined}
              >
                {index === 0 && <Home className="w-4 h-4" />}
                <span>{item.label}</span>
              </span>
            )}

            {/* 隐藏的位置信息用于结构化数据 */}
            <meta itemProp="position" content={String(index + 1)} />
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default BreadcrumbNavigation;
