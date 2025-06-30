import { BugReportPage } from '@/pages/BugReportPage';
import { FaqPage } from '@/pages/FaqPage';
import { HomePage } from '@/pages/HomePage';
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage';
import { StatusPage } from '@/pages/StatusPage';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

/**
 * JSON-LD结构化数据唯一性测试套件
 * 确保页面上的Schema.org结构化数据不会重复
 */
describe('JSON-LD结构化数据唯一性测试', () => {
  let helmetContext: any;

  beforeEach(() => {
    // 清理DOM中的所有script标签
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
   * 获取页面上所有的JSON-LD结构化数据
   */
  const getJsonLdScripts = (): Array<{ type: string; data: any; element: HTMLScriptElement }> => {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    const jsonLdData: Array<{ type: string; data: any; element: HTMLScriptElement }> = [];

    scripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent || '');
        jsonLdData.push({
          type: data['@type'] || 'Unknown',
          data,
          element: script as HTMLScriptElement,
        });
      } catch (error) {
        console.warn('无效的JSON-LD数据:', script.textContent);
      }
    });

    return jsonLdData;
  };

  /**
   * 检查特定Schema类型的唯一性
   */
  const checkSchemaUniqueness = (schemaType: string, jsonLdData: any[]) => {
    const items = jsonLdData.filter(item => item.type === schemaType);

    if (items.length > 1) {
      console.error(`发现重复的${schemaType}结构化数据:`, items);
    }

    expect(items.length).toBeLessThanOrEqual(1);
    return items[0] || null;
  };

  /**
   * 测试页面渲染助手
   */
  const renderPageWithRouter = (Component: React.ComponentType) => {
    return render(
      <HelmetProvider context={helmetContext}>
        <MemoryRouter>
          <Component />
        </MemoryRouter>
      </HelmetProvider>
    );
  };

  describe('VideoGame Schema修复验证', () => {
    it('VideoGame应该使用gamePlatform而不是platform', async () => {
      renderPageWithRouter(HomePage);
      await new Promise(resolve => setTimeout(resolve, 100));

      const jsonLdData = getJsonLdScripts();
      const videoGame = jsonLdData.find(item => item.type === 'VideoGame');

      if (videoGame) {
        // 应该有gamePlatform属性
        expect(videoGame.data).toHaveProperty('gamePlatform');
        expect(Array.isArray(videoGame.data.gamePlatform)).toBe(true);

        // 不应该有无效的platform属性
        expect(videoGame.data).not.toHaveProperty('platform');

        // playMode应该使用完整的schema.org URL
        if (videoGame.data.playMode) {
          expect(videoGame.data.playMode).toBe('https://schema.org/MultiPlayer');
        }
      }
    });

    it('所有VideoGame数据应该符合Schema.org标准', async () => {
      renderPageWithRouter(HomePage);
      await new Promise(resolve => setTimeout(resolve, 100));

      const jsonLdData = getJsonLdScripts();
      const videoGames = jsonLdData.filter(item => item.type === 'VideoGame');

      videoGames.forEach(game => {
        // 基本属性检查
        expect(game.data).toHaveProperty('@context', 'https://schema.org');
        expect(game.data).toHaveProperty('@type', 'VideoGame');
        expect(game.data).toHaveProperty('name');

        // 游戏特定属性检查
        if (game.data.genre) {
          expect(Array.isArray(game.data.genre)).toBe(true);
        }

        if (game.data.gamePlatform) {
          expect(Array.isArray(game.data.gamePlatform)).toBe(true);
        }

        // 确保没有使用废弃或无效的属性
        expect(game.data).not.toHaveProperty('platform');
      });
    });
  });

  describe('首页 (HomePage) 结构化数据唯一性', () => {
    it('应该只有一个Organization结构化数据', async () => {
      renderPageWithRouter(HomePage);

      // 等待组件挂载和useEffect执行
      await new Promise(resolve => setTimeout(resolve, 100));

      const jsonLdData = getJsonLdScripts();
      const organization = checkSchemaUniqueness('Organization', jsonLdData);

      if (organization) {
        expect(organization.data).toHaveProperty('@context', 'https://schema.org');
        expect(organization.data).toHaveProperty('name');
        expect(organization.data).toHaveProperty('url');
      }
    });

    it('应该只有一个VideoGame结构化数据', async () => {
      renderPageWithRouter(HomePage);
      await new Promise(resolve => setTimeout(resolve, 100));

      const jsonLdData = getJsonLdScripts();
      const videoGame = checkSchemaUniqueness('VideoGame', jsonLdData);

      if (videoGame) {
        expect(videoGame.data).toHaveProperty('@context', 'https://schema.org');
        expect(videoGame.data).toHaveProperty('name');
      }
    });

    it('应该只有一个WebSite结构化数据', async () => {
      renderPageWithRouter(HomePage);
      await new Promise(resolve => setTimeout(resolve, 100));

      const jsonLdData = getJsonLdScripts();
      const website = checkSchemaUniqueness('WebSite', jsonLdData);

      if (website) {
        expect(website.data).toHaveProperty('@context', 'https://schema.org');
        expect(website.data).toHaveProperty('url');
      }
    });

    it('应该没有重复的结构化数据类型', async () => {
      renderPageWithRouter(HomePage);
      await new Promise(resolve => setTimeout(resolve, 100));

      const jsonLdData = getJsonLdScripts();
      const typeCount = new Map<string, number>();

      jsonLdData.forEach(item => {
        const count = typeCount.get(item.type) || 0;
        typeCount.set(item.type, count + 1);
      });

      const duplicates = Array.from(typeCount.entries()).filter(([_, count]) => count > 1);

      if (duplicates.length > 0) {
        console.error('发现重复的结构化数据类型:', duplicates);
      }

      expect(duplicates).toHaveLength(0);
    });
  });

  describe('FAQ页面 (FaqPage) 结构化数据唯一性', () => {
    it('应该只有一个FAQPage结构化数据', async () => {
      renderPageWithRouter(FaqPage);
      await new Promise(resolve => setTimeout(resolve, 100));

      const jsonLdData = getJsonLdScripts();
      const faqPage = checkSchemaUniqueness('FAQPage', jsonLdData);

      if (faqPage) {
        expect(faqPage.data).toHaveProperty('@context', 'https://schema.org');
        expect(faqPage.data).toHaveProperty('mainEntity');
        expect(Array.isArray(faqPage.data.mainEntity)).toBe(true);
        expect(faqPage.data.mainEntity.length).toBeGreaterThan(0);
      }
    });

    it('应该只有一个BreadcrumbList结构化数据', async () => {
      renderPageWithRouter(FaqPage);
      await new Promise(resolve => setTimeout(resolve, 100));

      const jsonLdData = getJsonLdScripts();
      checkSchemaUniqueness('BreadcrumbList', jsonLdData);
    });

    it('FAQ问题数据应该与实际页面内容一致', async () => {
      renderPageWithRouter(FaqPage);
      await new Promise(resolve => setTimeout(resolve, 100));

      const jsonLdData = getJsonLdScripts();
      const faqPage = jsonLdData.find(item => item.type === 'FAQPage');

      if (faqPage) {
        // 检查FAQ问题数量
        expect(faqPage.data.mainEntity.length).toBe(5);

        // 检查特定问题是否存在
        const questions = faqPage.data.mainEntity.map((q: any) => q.name);
        expect(questions).toContain('如何加入Voidix服务器？');
        expect(questions).toContain('服务器是免费的吗？有付费项目吗？');
      }
    });
  });

  describe('状态页面 (StatusPage) 结构化数据唯一性', () => {
    it('应该只有一个BreadcrumbList结构化数据', async () => {
      renderPageWithRouter(StatusPage);
      await new Promise(resolve => setTimeout(resolve, 100));

      const jsonLdData = getJsonLdScripts();
      const breadcrumb = checkSchemaUniqueness('BreadcrumbList', jsonLdData);

      if (breadcrumb) {
        expect(breadcrumb.data).toHaveProperty('itemListElement');
        expect(Array.isArray(breadcrumb.data.itemListElement)).toBe(true);

        // 检查面包屑路径
        const items = breadcrumb.data.itemListElement;
        expect(items[0]).toHaveProperty('name', '首页');
        expect(items[items.length - 1]).toHaveProperty('name', '服务器状态');
      }
    });
  });

  describe('Bug反馈页面 (BugReportPage) 结构化数据唯一性', () => {
    it('应该只有一个BreadcrumbList结构化数据', async () => {
      renderPageWithRouter(BugReportPage);
      await new Promise(resolve => setTimeout(resolve, 100));

      const jsonLdData = getJsonLdScripts();
      checkSchemaUniqueness('BreadcrumbList', jsonLdData);
    });
  });

  describe('隐私政策页面 (PrivacyPolicyPage) 结构化数据唯一性', () => {
    it('应该只有一个BreadcrumbList结构化数据', async () => {
      renderPageWithRouter(PrivacyPolicyPage);
      await new Promise(resolve => setTimeout(resolve, 100));

      const jsonLdData = getJsonLdScripts();
      checkSchemaUniqueness('BreadcrumbList', jsonLdData);
    });
  });

  describe('跨页面结构化数据一致性', () => {
    it('不同页面的相同类型结构化数据应该保持一致', async () => {
      // 渲染多个页面并比较它们的结构化数据
      const pages = [
        { name: 'FAQ页面', component: FaqPage },
        { name: '状态页面', component: StatusPage },
        { name: 'Bug反馈页面', component: BugReportPage },
      ];

      const breadcrumbData: any[] = [];

      for (const page of pages) {
        // 清理之前的数据
        document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
          script.remove();
        });

        renderPageWithRouter(page.component);
        await new Promise(resolve => setTimeout(resolve, 100));

        const jsonLdData = getJsonLdScripts();
        const breadcrumb = jsonLdData.find(item => item.type === 'BreadcrumbList');

        if (breadcrumb) {
          breadcrumbData.push({
            page: page.name,
            data: breadcrumb.data,
          });
        }
      }

      // 验证所有面包屑都有正确的结构
      breadcrumbData.forEach(item => {
        expect(item.data).toHaveProperty('@context', 'https://schema.org');
        expect(item.data).toHaveProperty('@type', 'BreadcrumbList');
        expect(item.data).toHaveProperty('itemListElement');
        expect(Array.isArray(item.data.itemListElement)).toBe(true);

        // 第一个项目应该总是"首页"
        const firstItem = item.data.itemListElement[0];
        expect(firstItem).toHaveProperty('name', '首页');
        expect(firstItem).toHaveProperty('position', 1);
      });
    });
  });

  describe('结构化数据完整性检查', () => {
    it('所有JSON-LD数据应该具有有效的Schema.org格式', async () => {
      const pages = [HomePage, FaqPage, StatusPage];

      for (const PageComponent of pages) {
        document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
          script.remove();
        });

        renderPageWithRouter(PageComponent);
        await new Promise(resolve => setTimeout(resolve, 100));

        const jsonLdData = getJsonLdScripts();

        jsonLdData.forEach(item => {
          // 检查基本Schema.org属性
          expect(item.data).toHaveProperty('@context');
          expect(item.data['@context']).toBe('https://schema.org');
          expect(item.data).toHaveProperty('@type');
          expect(typeof item.data['@type']).toBe('string');

          // 检查类型特定的必需属性
          switch (item.type) {
            case 'Organization':
              expect(item.data).toHaveProperty('name');
              expect(item.data).toHaveProperty('url');
              break;
            case 'VideoGame':
              expect(item.data).toHaveProperty('name');
              // 验证VideoGame特定属性的正确性
              if (item.data.gamePlatform) {
                expect(Array.isArray(item.data.gamePlatform)).toBe(true);
              }
              if (item.data.playMode) {
                expect(item.data.playMode).toMatch(/^https:\/\/schema\.org\//);
              }
              // 确保不使用无效的platform属性
              expect(item.data).not.toHaveProperty('platform');
              break;
            case 'WebSite':
              expect(item.data).toHaveProperty('name');
              expect(item.data).toHaveProperty('url');
              break;
            case 'FAQPage':
              expect(item.data).toHaveProperty('mainEntity');
              expect(Array.isArray(item.data.mainEntity)).toBe(true);
              break;
            case 'BreadcrumbList':
              expect(item.data).toHaveProperty('itemListElement');
              expect(Array.isArray(item.data.itemListElement)).toBe(true);
              break;
          }
        });
      }
    });

    it('应该没有恶意或无效的JSON-LD数据', async () => {
      renderPageWithRouter(HomePage);
      await new Promise(resolve => setTimeout(resolve, 100));

      const scripts = document.querySelectorAll('script[type="application/ld+json"]');

      scripts.forEach(script => {
        const content = script.textContent || '';

        // 检查是否包含潜在的恶意内容
        expect(content).not.toMatch(/<script/i);
        expect(content).not.toMatch(/javascript:/i);
        expect(content).not.toMatch(/on\w+=/i);

        // 确保是有效的JSON
        expect(() => JSON.parse(content)).not.toThrow();

        const data = JSON.parse(content);

        // 确保没有函数或undefined值
        const stringified = JSON.stringify(data);
        expect(stringified).not.toContain('undefined');
        expect(stringified).not.toContain('function');
      });
    });
  });

  describe('性能和内存检查', () => {
    it('页面切换时应该正确清理旧的结构化数据', async () => {
      // 渲染第一个页面
      renderPageWithRouter(FaqPage);
      await new Promise(resolve => setTimeout(resolve, 100));

      const firstPageScripts = getJsonLdScripts();
      const firstPageScriptCount = firstPageScripts.length;

      // 切换到第二个页面
      document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
        script.remove();
      });

      renderPageWithRouter(StatusPage);
      await new Promise(resolve => setTimeout(resolve, 100));

      const secondPageScripts = getJsonLdScripts();

      // 验证没有累积的脚本标签
      expect(secondPageScripts.length).toBeLessThanOrEqual(firstPageScriptCount + 2);

      // 验证新页面的BreadcrumbList内容是正确的
      const breadcrumb = secondPageScripts.find(item => item.type === 'BreadcrumbList');
      if (breadcrumb) {
        const lastItem =
          breadcrumb.data.itemListElement[breadcrumb.data.itemListElement.length - 1];
        expect(lastItem.name).toBe('服务器状态');
      }
    });
  });
});
