import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { VoidixLogo } from '@/components/ui/VoidixLogo';
import { LOGO_ASSETS } from '@/constants';

// Mock GradientText 组件
vi.mock('@/components/ui/GradientText', () => ({
  GradientText: ({ children, variant, className }: any) => (
    <span data-testid="gradient-text" data-variant={variant} className={className}>
      {children}
    </span>
  ),
}));

describe('VoidixLogo', () => {
  describe('基础渲染', () => {
    it('应该默认渲染full variant', () => {
      render(<VoidixLogo />);

      // full variant 应该包含图标和文本
      expect(screen.getByAltText('Voidix Logo')).toBeInTheDocument();
      expect(screen.getByText('Voidix')).toBeInTheDocument();
      expect(screen.getByText('Open, Free, Harmonious')).toBeInTheDocument();
    });

    it('应该应用默认md尺寸', () => {
      render(<VoidixLogo />);

      const iconContainer = screen.getByAltText('Voidix Logo').parentElement;
      expect(iconContainer).toHaveClass('w-16', 'h-16');
    });

    it('应该正确传递自定义className', () => {
      render(<VoidixLogo className="custom-logo-class" />);

      const container = screen.getByAltText('Voidix Logo').closest('div')?.parentElement;
      expect(container).toHaveClass('custom-logo-class');
    });
  });

  describe('size配置', () => {
    it('应该应用sm尺寸样式', () => {
      render(<VoidixLogo size="sm" />);

      const iconContainer = screen.getByAltText('Voidix Logo').parentElement;
      expect(iconContainer).toHaveClass('w-12', 'h-12');

      const textSpan = screen.getByText('Voidix');
      expect(textSpan).toHaveClass('text-lg');
    });

    it('应该应用md尺寸样式', () => {
      render(<VoidixLogo size="md" />);

      const iconContainer = screen.getByAltText('Voidix Logo').parentElement;
      expect(iconContainer).toHaveClass('w-16', 'h-16');

      const textSpan = screen.getByText('Voidix');
      expect(textSpan).toHaveClass('text-xl');
    });

    it('应该应用lg尺寸样式', () => {
      render(<VoidixLogo size="lg" />);

      const iconContainer = screen.getByAltText('Voidix Logo').parentElement;
      expect(iconContainer).toHaveClass('w-20', 'h-20');

      const textSpan = screen.getByText('Voidix');
      expect(textSpan).toHaveClass('text-2xl');
    });

    it('应该应用xl尺寸样式', () => {
      render(<VoidixLogo size="xl" />);

      const iconContainer = screen.getByAltText('Voidix Logo').parentElement;
      expect(iconContainer).toHaveClass('w-24', 'h-24');

      const textSpan = screen.getByText('Voidix');
      expect(textSpan).toHaveClass('text-3xl');
    });
  });

  describe('variant变体', () => {
    it('应该在icon变体中只显示图标', () => {
      render(<VoidixLogo variant="icon" />);

      expect(screen.getByAltText('Voidix Logo')).toBeInTheDocument();
      expect(screen.queryByTestId('gradient-text')).not.toBeInTheDocument();
      expect(screen.queryByText('Open, Free, Harmonious')).not.toBeInTheDocument();
    });

    it('应该在text变体中只显示GradientText', () => {
      render(<VoidixLogo variant="text" />);

      const gradientText = screen.getByTestId('gradient-text');
      expect(gradientText).toBeInTheDocument();
      expect(gradientText).toHaveTextContent('Voidix');
      expect(gradientText).toHaveAttribute('data-variant', 'primary');

      expect(screen.queryByAltText('Voidix Logo')).not.toBeInTheDocument();
      expect(screen.queryByText('Open, Free, Harmonious')).not.toBeInTheDocument();
    });

    it('应该在full变体中显示完整logo结构', () => {
      render(<VoidixLogo variant="full" />);

      expect(screen.getByAltText('Voidix Logo')).toBeInTheDocument();
      expect(screen.getByText('Voidix')).toBeInTheDocument();
      expect(screen.getByText('Open, Free, Harmonious')).toBeInTheDocument();
    });
  });

  describe('icon子组件', () => {
    it('应该渲染正确的图片元素', () => {
      render(<VoidixLogo variant="icon" />);

      const img = screen.getByAltText('Voidix Logo');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', LOGO_ASSETS.BRAND_LOGO);
      expect(img.tagName).toBe('IMG');
    });

    it('应该设置正确的alt属性', () => {
      render(<VoidixLogo variant="icon" />);

      const img = screen.getByAltText('Voidix Logo');
      expect(img).toHaveAttribute('alt', 'Voidix Logo');
    });

    it('应该应用filter样式', () => {
      render(<VoidixLogo variant="icon" />);

      const img = screen.getByAltText('Voidix Logo');
      expect(img.style.filter).toBe('drop-shadow(0 0 8px rgba(147, 51, 234, 0.3))');
    });

    it('应该应用正确的容器样式', () => {
      render(<VoidixLogo variant="icon" />);

      const iconContainer = screen.getByAltText('Voidix Logo').parentElement;
      expect(iconContainer).toHaveClass(
        'bg-gradient-to-br',
        'from-purple-500/10',
        'via-blue-500/10',
        'to-cyan-400/10',
        'rounded-2xl',
        'flex',
        'items-center',
        'justify-center',
        'backdrop-blur-sm',
        'border',
        'border-white/10',
        'shadow-lg'
      );
    });
  });

  describe('动画和样式', () => {
    it('应该在full变体中包含内联CSS动画定义', () => {
      render(<VoidixLogo variant="full" />);

      // 检查是否有style标签被插入
      const styleElement = document.querySelector('style');
      expect(styleElement).toBeInTheDocument();
      expect(styleElement?.textContent).toContain('@keyframes voidix-gradient-flow');
      expect(styleElement?.textContent).toContain('background-position: 0% 50%');
      expect(styleElement?.textContent).toContain('background-position: 100% 50%');
    });

    it('应该在full变体的文本上应用渐变动画', () => {
      render(<VoidixLogo variant="full" />);

      const textSpan = screen.getByText('Voidix');

      expect(textSpan.style.background).toContain('linear-gradient(45deg');
      expect(textSpan.style.backgroundSize).toBe('300% 300%');
      expect(textSpan.style.animation).toContain('voidix-gradient-flow 6s linear infinite');
    });

    it('应该设置正确的文本渐变样式属性', () => {
      render(<VoidixLogo variant="full" />);

      const textSpan = screen.getByText('Voidix');

      expect(textSpan.style.backgroundClip).toBe('text');
      // 使用更适合测试环境的检查方式
      expect(
        textSpan.style.getPropertyValue('-webkit-background-clip') || textSpan.style.backgroundClip
      ).toBe('text');
      expect(textSpan.style.color).toBe('transparent');
      expect(
        textSpan.style.getPropertyValue('-webkit-text-fill-color') || textSpan.style.color
      ).toBe('transparent');
    });
  });

  describe('Props传递', () => {
    it('应该在icon变体中传递className', () => {
      render(<VoidixLogo variant="icon" className="icon-custom-class" />);

      const iconContainer = screen.getByAltText('Voidix Logo').parentElement;
      expect(iconContainer).toHaveClass('icon-custom-class');
    });

    it('应该在text变体中传递className', () => {
      render(<VoidixLogo variant="text" className="text-custom-class" />);

      const gradientText = screen.getByTestId('gradient-text');
      expect(gradientText).toHaveClass('text-custom-class');
    });

    it('应该正确组合尺寸相关的className', () => {
      render(<VoidixLogo size="lg" variant="text" className="custom-class" />);

      const gradientText = screen.getByTestId('gradient-text');
      expect(gradientText).toHaveClass('text-2xl', 'font-bold', 'custom-class');
    });

    it('应该在full变体中正确设置容器spacing', () => {
      render(<VoidixLogo size="sm" />);

      const container = screen.getByAltText('Voidix Logo').closest('div')?.parentElement;
      expect(container).toHaveClass('gap-2'); // sm size 对应 gap-2
    });

    it('应该处理不同尺寸的spacing配置', () => {
      const { rerender } = render(<VoidixLogo size="md" />);
      let container = screen.getByAltText('Voidix Logo').closest('div')?.parentElement;
      expect(container).toHaveClass('gap-3');

      rerender(<VoidixLogo size="lg" />);
      container = screen.getByAltText('Voidix Logo').closest('div')?.parentElement;
      expect(container).toHaveClass('gap-4');

      rerender(<VoidixLogo size="xl" />);
      container = screen.getByAltText('Voidix Logo').closest('div')?.parentElement;
      expect(container).toHaveClass('gap-4');
    });
  });

  describe('边界情况', () => {
    it('应该处理未定义的props', () => {
      // 测试传入undefined values是否会导致错误
      expect(() => {
        render(<VoidixLogo size={undefined as any} variant={undefined as any} />);
      }).not.toThrow();
    });

    it('应该在没有props时使用默认值', () => {
      render(<VoidixLogo />);

      // 验证默认值是否正确应用
      expect(screen.getByAltText('Voidix Logo')).toBeInTheDocument();
      expect(screen.getByText('Voidix')).toBeInTheDocument();
      expect(screen.getByText('Open, Free, Harmonious')).toBeInTheDocument();
    });
  });
});
