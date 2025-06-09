/**
 * Button组件测试套件
 * 测试按钮的变体、尺寸、状态和用户交互
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基础渲染', () => {
    it('应该正确渲染基础按钮', () => {
      render(<Button>点击我</Button>);

      const button = screen.getByRole('button', { name: '点击我' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('点击我');
    });

    it('应该应用默认的variant和size', () => {
      render(<Button>默认按钮</Button>);

      const button = screen.getByRole('button');
      // 验证默认primary变体的样式类
      expect(button).toHaveClass('bg-gradient-to-r', 'from-blue-500', 'to-purple-600');
      // 验证默认md尺寸的样式类
      expect(button).toHaveClass('px-4', 'py-2', 'text-base');
    });
  });

  describe('变体测试', () => {
    it('应该正确渲染primary变体', () => {
      render(<Button variant="primary">Primary</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'bg-gradient-to-r',
        'from-blue-500',
        'to-purple-600',
        'text-white'
      );
    });

    it('应该正确渲染secondary变体', () => {
      render(<Button variant="secondary">Secondary</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-600', 'text-white');
    });

    it('应该正确渲染outline变体', () => {
      render(<Button variant="outline">Outline</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('border', 'border-gray-600', 'text-gray-300');
    });

    it('应该正确渲染ghost变体', () => {
      render(<Button variant="ghost">Ghost</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-gray-300');
    });
  });

  describe('尺寸测试', () => {
    it('应该正确渲染small尺寸', () => {
      render(<Button size="sm">Small</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');
    });

    it('应该正确渲染medium尺寸', () => {
      render(<Button size="md">Medium</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2', 'text-base');
    });

    it('应该正确渲染large尺寸', () => {
      render(<Button size="lg">Large</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
    });
  });

  describe('状态测试', () => {
    it('应该正确处理disabled状态', () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });

    it('应该正确显示loading状态', () => {
      render(<Button loading>Loading</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled(); // loading时应该禁用
      expect(button).toHaveTextContent('加载中...');

      // 验证loading spinner存在
      const spinner =
        button.querySelector('div[style*="animation"]') ||
        button.querySelector('.animate-spin') ||
        button.querySelector('div.w-4.h-4');
      expect(spinner).toBeInTheDocument();
    });

    it('loading状态应该覆盖children内容', () => {
      render(<Button loading>原始内容</Button>);

      const button = screen.getByRole('button');
      expect(button).not.toHaveTextContent('原始内容');
      expect(button).toHaveTextContent('加载中...');
    });
  });

  describe('用户交互', () => {
    it('应该正确处理点击事件', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>点击测试</Button>);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('disabled状态下不应该触发点击事件', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('loading状态下不应该触发点击事件', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Button onClick={handleClick} loading>
          Loading
        </Button>
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('无障碍性', () => {
    it('应该支持键盘导航', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Keyboard Test</Button>);

      const button = screen.getByRole('button');
      button.focus();

      expect(button).toHaveFocus();

      // 测试回车键
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);

      // 测试空格键
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it('应该有正确的focus样式', () => {
      render(<Button>Focus Test</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500');
    });

    it('应该正确传递ARIA属性', () => {
      render(
        <Button aria-label="自定义标签" aria-describedby="help-text">
          按钮
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', '自定义标签');
      expect(button).toHaveAttribute('aria-describedby', 'help-text');
    });
  });

  describe('自定义样式', () => {
    it('应该正确应用自定义className', () => {
      render(<Button className="custom-class">Custom</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('自定义className应该与默认样式合并', () => {
      render(
        <Button className="custom-class" variant="primary">
          Custom
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('bg-gradient-to-r'); // 保持默认样式
    });
  });

  describe('HTML属性传递', () => {
    it('应该正确传递标准button属性', () => {
      render(
        <Button type="submit" form="test-form" data-testid="custom-button">
          Submit
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('form', 'test-form');
      expect(button).toHaveAttribute('data-testid', 'custom-button');
    });
  });
});
