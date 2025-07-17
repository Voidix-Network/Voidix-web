import { SEOProvider } from '@/components/seo';
import { TermsPage } from '@/pages/TermsPage';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

// Mock analytics服务
vi.mock('@/services/analytics', () => ({
  analytics: {
    page: vi.fn(),
  },
}));

describe('TermsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderTermsPage = () => {
    return render(
      <SEOProvider>
        <MemoryRouter>
          <TermsPage />
        </MemoryRouter>
      </SEOProvider>
    );
  };

  describe('基础渲染', () => {
    it('应该正确渲染服务条款页面', () => {
      renderTermsPage();

      // 验证页面能够成功渲染
      expect(screen.getByText('服务条款')).toBeInTheDocument();
    });

    it('应该包含所有必需的内容区块', () => {
      renderTermsPage();

      // 验证主要内容区块
      expect(screen.getByText('服务概述')).toBeInTheDocument();
      expect(screen.getByText('用户行为准则')).toBeInTheDocument();
      expect(screen.getByText('账户安全与责任')).toBeInTheDocument();
      expect(screen.getByText('公益性质与免费服务')).toBeInTheDocument();
      expect(screen.getByText('知识产权与内容使用')).toBeInTheDocument();
      expect(screen.getByText('免责声明')).toBeInTheDocument();
      expect(screen.getByText('条款修改与终止')).toBeInTheDocument();
    });
  });

  describe('SEO组件配置', () => {
    it('应该正确配置SEO组件', () => {
      renderTermsPage();

      // 验证页面标题
      expect(screen.getByText('服务条款')).toBeInTheDocument();
      expect(screen.getByText('使用Voidix服务需要遵守的规则和条款')).toBeInTheDocument();
    });
  });

  describe('联系信息', () => {
    it('应该显示正确的联系信息', () => {
      renderTermsPage();

      expect(screen.getByText(/QQ群：186438621/)).toBeInTheDocument();
      expect(screen.getByText(/Discord：/)).toBeInTheDocument();
      expect(screen.getByText(/邮箱：/)).toBeInTheDocument();
    });
  });
});
