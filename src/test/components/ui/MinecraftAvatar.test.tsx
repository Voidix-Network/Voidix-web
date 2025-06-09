/**
 * MinecraftAvatar 组件测试
 * 测试 Minecraft 头像组件的头像加载、回退机制、尺寸支持等功能
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MinecraftAvatar } from '@/components/ui/MinecraftAvatar';

describe('MinecraftAvatar', () => {
  beforeEach(() => {
    // 清理所有mock
    vi.clearAllMocks();
  });

  describe('基础渲染', () => {
    it('应该渲染默认尺寸的头像', () => {
      render(<MinecraftAvatar username="testuser" />);

      const container = screen.getByRole('img', { name: /testuser的minecraft头像/i }).parentElement;
      expect(container).toHaveStyle({
        width: '64px',
        height: '64px',
      });
    });

    it('应该渲染自定义尺寸的头像', () => {
      render(<MinecraftAvatar username="testuser" size={128} />);

      const container = screen.getByRole('img', { name: /testuser的minecraft头像/i }).parentElement;
      expect(container).toHaveStyle({
        width: '128px',
        height: '128px',
      });
    });

    it('应该应用自定义className', () => {
      render(<MinecraftAvatar username="testuser" className="custom-class" />);

      const container = screen.getByRole('img', { name: /testuser的minecraft头像/i }).parentElement;
      expect(container).toHaveClass('custom-class');
    });

    it('应该设置正确的图片alt属性', () => {
      render(<MinecraftAvatar username="TestPlayer" />);

      const img = screen.getByRole('img', { name: 'TestPlayer的Minecraft头像' });
      expect(img).toBeInTheDocument();
    });
  });

  describe('API 回退机制', () => {
    it('应该首先尝试使用mc-heads.net API', () => {
      render(<MinecraftAvatar username="testuser" size={32} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', 'https://mc-heads.net/avatar/testuser/32');
    });

    it('应该在第一个API失败时尝试第二个API', async () => {
      render(<MinecraftAvatar username="testuser" size={32} />);

      const img = screen.getByRole('img');

      // 模拟第一个API失败 - 使用act包装状态更新
      await act(async () => {
        img.dispatchEvent(new Event('error'));
      });

      await waitFor(() => {
        expect(img).toHaveAttribute('src', 'https://minotar.net/helm/testuser/32');
      });
    });

    it('应该在前两个API失败时尝试第三个API', async () => {
      render(<MinecraftAvatar username="testuser" size={32} />);

      const img = screen.getByRole('img');

      // 模拟第一个API失败 - 使用act包装状态更新
      await act(async () => {
        img.dispatchEvent(new Event('error'));
      });

      await waitFor(() => {
        expect(img).toHaveAttribute('src', 'https://minotar.net/helm/testuser/32');
      });

      // 模拟第二个API也失败 - 使用act包装状态更新
      await act(async () => {
        img.dispatchEvent(new Event('error'));
      });

      await waitFor(() => {
        expect(img).toHaveAttribute(
          'src',
          'https://crafatar.com/avatars/testuser?size=32&overlay=true'
        );
      });
    });
  });

  describe('回退显示', () => {
    it('应该在所有API失败时显示回退内容', async () => {
      render(<MinecraftAvatar username="testuser" size={64} />);

      const img = screen.getByRole('img');

      // 模拟所有API都失败 - 需要连续触发所有错误
      // 第一个API失败
      await act(async () => {
        img.dispatchEvent(new Event('error'));
      });

      // 等待状态更新，然后继续下一个API
      await waitFor(() => {
        expect(img).toHaveAttribute('src', expect.stringContaining('minotar.net'));
      });

      // 第二个API失败
      await act(async () => {
        img.dispatchEvent(new Event('error'));
      });

      // 等待状态更新，然后继续下一个API
      await waitFor(() => {
        expect(img).toHaveAttribute('src', expect.stringContaining('crafatar.com'));
      });

      // 第三个API失败，这时应该进入hasError状态
      await act(async () => {
        img.dispatchEvent(new Event('error'));
      });

      await waitFor(() => {
        // 当所有API都失败时，组件会返回一个新的div结构
        // 检查回退内容是否显示
        const fallback = screen.getByText('T'); // testuser的首字母大写
        expect(fallback).toBeInTheDocument();

        // 检查回退容器的样式（顶级div）
        const fallbackContainer = fallback.parentElement;
        expect(fallbackContainer).toHaveClass('bg-gradient-to-br', 'from-gray-600', 'to-gray-700');
        expect(fallbackContainer).toHaveStyle({
          width: '64px',
          height: '64px',
        });

        // 确保图片元素不在DOM中（因为hasError=true时会更换整个结构）
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
      });
    });

    it('应该使用自定义回退文本', async () => {
      render(<MinecraftAvatar username="testuser" size={64} fallbackText="TU" />);

      const img = screen.getByRole('img');

      // 模拟所有API都失败
      for (let i = 0; i < 3; i++) {
        await act(async () => {
          img.dispatchEvent(new Event('error'));
        });
        await waitFor(() => {});
      }

      await waitFor(() => {
        const fallback = screen.getByText('TU');
        expect(fallback).toBeInTheDocument();
      });
    });

    it('应该在回退状态下应用渐变背景', async () => {
      render(<MinecraftAvatar username="testuser" size={64} />);

      const img = screen.getByRole('img');

      // 模拟所有API都失败
      for (let i = 0; i < 3; i++) {
        await act(async () => {
          img.dispatchEvent(new Event('error'));
        });
        await waitFor(() => {});
      }

      await waitFor(() => {
        const fallbackDiv = screen.getByText('T').parentElement;
        expect(fallbackDiv).toHaveClass('bg-gradient-to-br', 'from-gray-600', 'to-gray-700');
      });
    });
  });

  describe('加载状态', () => {
    it('应该在图片加载期间显示占位符', () => {
      render(<MinecraftAvatar username="testuser" />);

      // 在图片加载完成前，应该有占位符
      const placeholder = screen.getByText('T'); // 占位符文本
      expect(placeholder).toBeInTheDocument();

      const img = screen.getByRole('img');
      expect(img).toHaveClass('opacity-0'); // 图片应该是透明的
    });

    it('应该在图片加载完成后隐藏占位符', async () => {
      render(<MinecraftAvatar username="testuser" />);

      const img = screen.getByRole('img');

      // 模拟图片加载完成 - 使用act包装状态更新
      await act(async () => {
        img.dispatchEvent(new Event('load'));
      });

      await waitFor(() => {
        expect(img).toHaveClass('opacity-100'); // 图片应该变为不透明
      });
    });

    it('应该在占位符中显示用户名首字母', () => {
      render(<MinecraftAvatar username="minecraft_player" />);

      const placeholder = screen.getByText('M');
      expect(placeholder).toBeInTheDocument();
    });
  });

  describe('图片样式', () => {
    it('应该应用像素化渲染样式', () => {
      render(<MinecraftAvatar username="testuser" />);

      const img = screen.getByRole('img');
      expect(img).toHaveStyle({
        imageRendering: 'pixelated',
      });
    });

    it('应该应用阴影效果', () => {
      render(<MinecraftAvatar username="testuser" />);

      const img = screen.getByRole('img');
      expect(img).toHaveStyle({
        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
      });
    });

    it('应该设置懒加载属性', () => {
      render(<MinecraftAvatar username="testuser" />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('loading', 'lazy');
    });
  });

  describe('用户名处理', () => {
    it('应该正确处理包含下划线的用户名', () => {
      render(<MinecraftAvatar username="test_user_123" />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', expect.stringContaining('test_user_123'));
    });

    it('应该正确处理大小写混合的用户名', () => {
      render(<MinecraftAvatar username="TestUser" />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', expect.stringContaining('TestUser'));

      const altText = screen.getByRole('img', { name: 'TestUser的Minecraft头像' });
      expect(altText).toBeInTheDocument();
    });

    it('应该正确处理特殊字符用户名', () => {
      render(<MinecraftAvatar username="user-123" />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', expect.stringContaining('user-123'));
    });
  });

  describe('尺寸变体', () => {
    it.each([
      [16, '16px'],
      [32, '32px'],
      [64, '64px'],
      [128, '128px'],
      [256, '256px'],
    ])('应该正确处理尺寸 %dpx', (size, expectedSize) => {
      render(<MinecraftAvatar username="testuser" size={size} />);

      const container = screen.getByRole('img').parentElement;
      expect(container).toHaveStyle({
        width: expectedSize,
        height: expectedSize,
      });

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', expect.stringContaining(`/${size}`));
    });
  });
});
