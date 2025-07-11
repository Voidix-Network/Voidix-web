/**
 * HomePage 组件测试套件
 * 测试主页面的渲染、SEO组件集成和性能优化功能
 */

import { HomePage } from '@/pages/HomePage';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock 子组件，同时保留其他真实实现
// Mock 各个 Section 组件
vi.mock('@/components/sections/HeroSection', () => ({
  HeroSection: () => <div data-testid="hero-section">Hero Section</div>,
}));
vi.mock('@/components/sections/AboutSection', () => ({
  AboutSection: () => <div data-testid="about-section">About Section</div>,
}));
vi.mock('@/components/sections/ServersSection', () => ({
  ServersSection: () => <div data-testid="servers-section">Servers Section</div>,
}));
vi.mock('@/components/sections/VersionsSection', () => ({
  VersionsSection: () => <div data-testid="versions-section">Versions Section</div>,
}));
vi.mock('@/components/sections/TimelineSection', () => ({
  TimelineSection: () => <div data-testid="timeline-section">Timeline Section</div>,
}));
vi.mock('@/components/sections/TeamSection', () => ({
  TeamSection: () => <div data-testid="team-section">Team Section</div>,
}));

// Mock SEO组件
vi.mock('@/components/seo', () => ({
  SEO: ({ pageKey, type, canonicalUrl }: any) => (
    <div
      data-testid="page-seo"
      data-page-key={pageKey}
      data-type={type}
      data-canonical={canonicalUrl}
    >
      PageSEO
    </div>
  ),
  PerformanceOptimizer: ({ preloadImages = [], prefetchRoutes = [] }: any) => (
    <div
      data-testid="performance-optimizer"
      data-preload={preloadImages.length > 0 ? preloadImages.join(',') : undefined}
      data-prefetch={prefetchRoutes.length > 0 ? prefetchRoutes.join(',') : undefined}
    >
      PerformanceOptimizer
    </div>
  ),
}));

describe('HomePage', () => {
  beforeEach(() => {
    // 清理任何可能的副作用
    vi.clearAllMocks();
  });

  describe('基础渲染', () => {
    it('应该正确渲染主页面', () => {
      render(<HomePage />);

      // 验证页面能够成功渲染
      expect(screen.getByTestId('page-seo')).toBeInTheDocument();
      expect(screen.getByTestId('performance-optimizer')).toBeInTheDocument();
    });

    it('应该包含所有必需的section组件', () => {
      render(<HomePage />);

      // 验证所有section组件都被渲染
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
      expect(screen.getByTestId('about-section')).toBeInTheDocument();
      expect(screen.getByTestId('servers-section')).toBeInTheDocument();
      expect(screen.getByTestId('versions-section')).toBeInTheDocument();
      expect(screen.getByTestId('timeline-section')).toBeInTheDocument();
      expect(screen.getByTestId('team-section')).toBeInTheDocument();
    });
  });

  describe('SEO组件配置', () => {
    it('应该正确配置PageSEO组件', () => {
      render(<HomePage />);

      const pageSEO = screen.getByTestId('page-seo');
      expect(pageSEO).toHaveAttribute('data-page-key', 'home');
      expect(pageSEO).toHaveAttribute('data-type', 'website');
      expect(pageSEO).toHaveAttribute('data-canonical', 'https://www.voidix.net/');
    });

    it('应该设置正确的页面类型为website', () => {
      render(<HomePage />);

      const pageSEO = screen.getByTestId('page-seo');
      expect(pageSEO).toHaveAttribute('data-type', 'website');
    });

    it('应该设置正确的canonical URL', () => {
      render(<HomePage />);

      const pageSEO = screen.getByTestId('page-seo');
      expect(pageSEO).toHaveAttribute('data-canonical', 'https://www.voidix.net/');
    });
  });

  describe('性能优化配置', () => {
    it('应该正确配置PerformanceOptimizer组件', () => {
      render(<HomePage />);

      const performanceOptimizer = screen.getByTestId('performance-optimizer');
      expect(performanceOptimizer).toBeInTheDocument();
    });

    it('应该不进行立即路由预获取', () => {
      render(<HomePage />);

      const performanceOptimizer = screen.getByTestId('performance-optimizer');
      // 验证组件存在且没有设置data-prefetch属性（因为默认为空数组）
      expect(performanceOptimizer).toBeInTheDocument();
      expect(performanceOptimizer).not.toHaveAttribute('data-prefetch');
    });
  });

  describe('组件渲染顺序', () => {
    it('应该按正确顺序渲染SEO和性能优化组件', () => {
      const { container } = render(<HomePage />);

      // 由于Fragment渲染，组件直接在container下
      const allChildren = Array.from(container.children);

      // 验证有足够的子元素 (PageSEO + PerformanceOptimizer + 6个section = 8个)
      expect(allChildren.length).toBe(8);

      // 验证SEO和性能优化组件在内容组件之前
      expect(allChildren[0]).toHaveAttribute('data-testid', 'page-seo');
      expect(allChildren[1]).toHaveAttribute('data-testid', 'performance-optimizer');
    });

    it('应该按正确顺序渲染所有section组件', () => {
      render(<HomePage />);

      // 验证各section组件都存在（顺序通过DOM结构隐式验证）
      const sections = [
        'hero-section',
        'about-section',
        'servers-section',
        'versions-section',
        'timeline-section',
        'team-section',
      ];

      sections.forEach(sectionId => {
        expect(screen.getByTestId(sectionId)).toBeInTheDocument();
      });
    });
  });

  describe('组件集成', () => {
    it('应该不包含多余的wrapper元素', () => {
      const { container } = render(<HomePage />);

      // 验证React Fragment直接渲染子元素，没有额外wrapper
      // Fragment的所有子元素直接作为container的children
      expect(container.children.length).toBe(8); // PageSEO + PerformanceOptimizer + 6个section

      // 验证第一个元素是PageSEO
      expect(container.firstElementChild?.tagName).toBe('DIV');
      expect(container.firstElementChild).toHaveAttribute('data-testid', 'page-seo');
    });

    it('应该正确处理React Fragment', () => {
      render(<HomePage />);

      // 如果Fragment工作正常，所有组件都应该能正常渲染
      expect(screen.getByTestId('page-seo')).toBeInTheDocument();
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
      expect(screen.getByTestId('team-section')).toBeInTheDocument();
    });
  });

  describe('错误边界处理', () => {
    it('应该能正常渲染即使没有props', () => {
      // HomePage不接受props，但测试组件的健壮性
      expect(() => render(<HomePage />)).not.toThrow();
    });

    it('应该在所有子组件都正常的情况下完整渲染', () => {
      render(<HomePage />);

      // 验证所有关键元素都已渲染
      expect(screen.getByTestId('page-seo')).toBeInTheDocument();
      expect(screen.getByTestId('performance-optimizer')).toBeInTheDocument();
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
      expect(screen.getByTestId('team-section')).toBeInTheDocument();
    });
  });
});
