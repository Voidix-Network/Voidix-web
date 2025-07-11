import { SEOProvider } from '@/components/seo';
import { FaqPage } from '@/pages/FaqPage';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

/**
 * BreadcrumbList URL正确性测试
 * 确保面包屑导航中的URL使用正确的域名
 */
describe('BreadcrumbList URL正确性测试', () => {
  let helmetContext: any;

  beforeEach(() => {
    // 清理DOM中的所有JSON-LD script标签
    document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
      script.remove();
    });

    helmetContext = {};
  });

  afterEach(() => {
    // 测试后清理
    document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
      script.remove();
    });
  });

  /**
   * 获取页面上的BreadcrumbList数据
   */
  const getBreadcrumbListData = () => {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');

    for (const script of scripts) {
      try {
        const data = JSON.parse(script.textContent || '');
        if (data['@type'] === 'BreadcrumbList') {
          return data;
        }
      } catch (error) {
        // 忽略无效JSON
      }
    }

    return null;
  };

  /**
   * 渲染页面助手
   */
  const renderPageWithRouter = (Component: React.ComponentType, initialPath = '/faq') => {
    return render(
      <HelmetProvider context={helmetContext}>
        <MemoryRouter initialEntries={[initialPath]}>
          <SEOProvider>
            <Component />
          </SEOProvider>
        </MemoryRouter>
      </HelmetProvider>
    );
  };

  it('BreadcrumbList应该使用正确的生产域名', async () => {
    renderPageWithRouter(FaqPage, '/faq');

    // 等待组件挂载和useEffect执行
    await new Promise(resolve => setTimeout(resolve, 200));

    const breadcrumbData = getBreadcrumbListData();

    expect(breadcrumbData).toBeTruthy();
    expect(breadcrumbData['@type']).toBe('BreadcrumbList');
    expect(breadcrumbData.itemListElement).toHaveLength(2);

    // 检查首页链接
    const homeItem = breadcrumbData.itemListElement[0];
    expect(homeItem.name).toBe('首页');
    expect(homeItem.position).toBe(1);
    expect(homeItem.item).toBeTruthy();
    expect(homeItem.item['@type']).toBe('Thing');
    expect(homeItem.item['@id']).toBe('https://www.voidix.net/');

    // 检查FAQ页链接
    const faqItem = breadcrumbData.itemListElement[1];
    expect(faqItem.name).toBe('常见问题');
    expect(faqItem.position).toBe(2);
    // 当前页面也应该有item属性指向正确的URL
    expect(faqItem.item).toBeTruthy();
    expect(faqItem.item['@type']).toBe('Thing');
    expect(faqItem.item['@id']).toBe('https://www.voidix.net/faq');
  });

  it('应该不包含测试域名或错误的URL', async () => {
    renderPageWithRouter(FaqPage, '/faq');
    await new Promise(resolve => setTimeout(resolve, 200));

    const breadcrumbData = getBreadcrumbListData();
    const jsonString = JSON.stringify(breadcrumbData);

    // 确保不包含错误的测试URL
    expect(jsonString).not.toContain('example-test.site');
    expect(jsonString).not.toContain('example.com');
    expect(jsonString).not.toContain('localhost');
    expect(jsonString).not.toContain('127.0.0.1');

    // 确保使用正确的生产域名
    expect(jsonString).toContain('https://www.voidix.net');
  });

  it('只应该有一个BreadcrumbList数据', async () => {
    renderPageWithRouter(FaqPage, '/faq');
    await new Promise(resolve => setTimeout(resolve, 200));

    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    let breadcrumbCount = 0;

    scripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent || '');
        if (data['@type'] === 'BreadcrumbList') {
          breadcrumbCount++;
        }
      } catch (error) {
        // 忽略无效JSON
      }
    });

    expect(breadcrumbCount).toBe(1);
  });

  it('BreadcrumbList数据应该符合Schema.org标准', async () => {
    renderPageWithRouter(FaqPage, '/faq');
    await new Promise(resolve => setTimeout(resolve, 200));

    const breadcrumbData = getBreadcrumbListData();

    expect(breadcrumbData).toBeTruthy();

    // 基本Schema.org属性
    expect(breadcrumbData['@context']).toBe('https://schema.org');
    expect(breadcrumbData['@type']).toBe('BreadcrumbList');
    expect(breadcrumbData.itemListElement).toBeTruthy();
    expect(Array.isArray(breadcrumbData.itemListElement)).toBe(true);

    // 检查每个面包屑项
    breadcrumbData.itemListElement.forEach((item: any, index: number) => {
      expect(item['@type']).toBe('ListItem');
      expect(item.position).toBe(index + 1);
      expect(item.name).toBeTruthy();
      expect(typeof item.name).toBe('string');

      // 如果有item属性，检查其格式
      if (item.item) {
        expect(item.item['@type']).toBe('Thing');
        expect(item.item['@id']).toBeTruthy();
        expect(typeof item.item['@id']).toBe('string');
        expect(item.item['@id']).toMatch(/^https:\/\//);
      }
    });
  });
});
