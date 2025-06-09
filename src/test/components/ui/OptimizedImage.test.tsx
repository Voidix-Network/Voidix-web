/**
 * OptimizedImage 组件测试
 * 测试优化图片组件的懒加载、WebP支持、响应式图片、错误处理等功能
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

// Mock useInView hook
const mockUseInView = vi.fn();
vi.mock('@/hooks/useInView', () => ({
  useInView: () => mockUseInView(),
}));

describe('OptimizedImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 默认设置 mock 为不在视口内
    mockUseInView.mockReturnValue({
      ref: { current: null },
      isInView: false,
    });
  });

  describe('基础渲染', () => {
    it('应该渲染基本的图片元素', () => {
      render(<OptimizedImage src="/test-image.jpg" alt="Test image" priority={true} />);

      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('alt', 'Test image');
    });

    it('应该应用自定义className', () => {
      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          className="custom-image"
          priority={true}
        />
      );

      const img = screen.getByRole('img');
      expect(img).toHaveClass('custom-image');
    });

    it('应该设置宽度和高度属性', () => {
      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          width={800}
          height={600}
          priority={true}
        />
      );

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('width', '800');
      expect(img).toHaveAttribute('height', '600');
    });

    it('应该设置sizes属性', () => {
      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={true}
        />
      );

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('sizes', '(max-width: 768px) 100vw, 50vw');
    });
  });

  describe('优先级加载', () => {
    it('应该在priority=true时立即加载图片', () => {
      render(<OptimizedImage src="/test-image.jpg" alt="Test image" priority={true} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('loading', 'eager');
      expect(img).toHaveAttribute('src', expect.stringContaining('/test-image.webp'));
    });

    it('应该在priority=false时使用懒加载', () => {
      render(<OptimizedImage src="/test-image.jpg" alt="Test image" priority={false} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('loading', 'lazy');
    });
  });

  describe('懒加载功能', () => {
    it('应该在不在视口时显示占位符', () => {
      mockUseInView.mockReturnValue({
        ref: { current: null },
        isInView: false,
      });

      render(<OptimizedImage src="/test-image.jpg" alt="Test image" />);

      // 应该显示占位符而不是实际图片源
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', expect.stringContaining('data:image/svg+xml'));
    });

    it('应该在进入视口时加载实际图片', async () => {
      // 首先设置为不在视口
      mockUseInView.mockReturnValue({
        ref: { current: null },
        isInView: false,
      });

      const { rerender } = render(<OptimizedImage src="/test-image.jpg" alt="Test image" />);

      // 验证初始状态显示占位符
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', expect.stringContaining('data:image/svg+xml'));

      // 模拟进入视口
      mockUseInView.mockReturnValue({
        ref: { current: null },
        isInView: true,
      });

      rerender(<OptimizedImage src="/test-image.jpg" alt="Test image" />);

      // 应该开始加载实际图片
      await waitFor(() => {
        const updatedImg = screen.getByRole('img');
        expect(updatedImg).toHaveAttribute('src', expect.stringContaining('/test-image.webp'));
      });
    });
  });

  describe('加载状态', () => {
    it('应该在图片加载期间显示占位符背景', () => {
      render(<OptimizedImage src="/test-image.jpg" alt="Test image" priority={true} />);

      // 检查是否存在占位符背景
      const placeholder = document.querySelector('.bg-gray-300.animate-pulse');
      expect(placeholder).toBeInTheDocument();
    });

    it('应该在图片加载完成后触发onLoad回调', async () => {
      const onLoadMock = vi.fn();

      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          priority={true}
          onLoad={onLoadMock}
        />
      );

      const img = screen.getByRole('img');

      // 模拟图片加载完成 - 使用act包装状态更新
      await act(async () => {
        img.dispatchEvent(new Event('load'));
      });

      await waitFor(() => {
        expect(onLoadMock).toHaveBeenCalledTimes(1);
      });
    });

    it('应该设置正确的decoding属性', () => {
      render(<OptimizedImage src="/test-image.jpg" alt="Test image" priority={true} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('decoding', 'async');
    });
  });

  describe('错误处理', () => {
    it('应该在图片加载失败时显示错误提示', async () => {
      render(<OptimizedImage src="/nonexistent-image.jpg" alt="Test image" priority={true} />);

      const img = screen.getByRole('img');

      // 模拟图片加载失败 - 使用act包装状态更新
      await act(async () => {
        img.dispatchEvent(new Event('error'));
      });

      await waitFor(() => {
        const errorMessage = screen.getByText('图片加载失败');
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it('应该在图片加载失败时回退到占位图', async () => {
      render(<OptimizedImage src="/nonexistent-image.jpg" alt="Test image" priority={true} />);

      const img = screen.getByRole('img');

      // 模拟图片加载失败 - 使用act包装状态更新
      await act(async () => {
        img.dispatchEvent(new Event('error'));
      });

      await waitFor(() => {
        expect(img).toHaveAttribute('src', expect.stringContaining('data:image/svg+xml'));
      });
    });

    it('应该在图片加载失败时触发onError回调', async () => {
      const onErrorMock = vi.fn();

      render(
        <OptimizedImage
          src="/nonexistent-image.jpg"
          alt="Test image"
          priority={true}
          onError={onErrorMock}
        />
      );

      const img = screen.getByRole('img');

      // 模拟图片加载失败 - 使用act包装状态更新
      await act(async () => {
        img.dispatchEvent(new Event('error'));
      });

      await waitFor(() => {
        expect(onErrorMock).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('WebP 优化', () => {
    it('应该为内部图片资源尝试WebP格式', () => {
      render(<OptimizedImage src="/internal-image.jpg" alt="Test image" priority={true} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', expect.stringContaining('.webp'));
    });

    it('应该为voidix.net域名的图片尝试WebP格式', () => {
      render(
        <OptimizedImage src="https://cdn.voidix.net/image.png" alt="Test image" priority={true} />
      );

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', expect.stringContaining('.webp'));
    });

    it('应该保持外部图片源不变', () => {
      render(
        <OptimizedImage src="https://external.com/image.jpg" alt="Test image" priority={true} />
      );

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', 'https://external.com/image.jpg');
    });
  });

  describe('响应式图片', () => {
    it('应该为占位符跳过srcSet生成', () => {
      render(<OptimizedImage src="/test-image.jpg" alt="Test image" />);

      const img = screen.getByRole('img');
      // 当显示占位符时，不应该有srcSet
      expect(img).not.toHaveAttribute('srcset');
    });

    it('应该为实际图片生成srcSet', async () => {
      mockUseInView.mockReturnValue({
        ref: { current: null },
        isInView: true,
      });

      render(<OptimizedImage src="/test-image.jpg" alt="Test image" />);

      const img = screen.getByRole('img');

      await waitFor(() => {
        // 当加载实际图片时，应该有srcSet
        expect(img).toHaveAttribute('srcset');
        expect(img.getAttribute('srcset')).toContain('320w');
        expect(img.getAttribute('srcset')).toContain('640w');
        expect(img.getAttribute('srcset')).toContain('1280w');
        expect(img.getAttribute('srcset')).toContain('1920w');
      });
    });
  });

  describe('自定义占位符', () => {
    it('应该使用自定义占位符', () => {
      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          placeholder="custom-placeholder.svg"
        />
      );

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', 'custom-placeholder.svg');
    });
  });

  describe('容器样式', () => {
    it('应该应用宽高比样式到占位符', () => {
      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          width={800}
          height={600}
          className="test-class"
        />
      );

      const placeholder = document.querySelector('.bg-gray-300.animate-pulse');
      expect(placeholder).toHaveClass('test-class');
      expect(placeholder).toHaveStyle({ aspectRatio: '800/600' });
    });

    it('应该在没有宽高时使用auto宽高比', () => {
      render(<OptimizedImage src="/test-image.jpg" alt="Test image" />);

      const placeholder = document.querySelector('.bg-gray-300.animate-pulse');
      expect(placeholder).toHaveStyle({ aspectRatio: 'auto' });
    });
  });
});
