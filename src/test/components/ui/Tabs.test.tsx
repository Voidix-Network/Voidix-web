/**
 * Tabs 组件测试
 * 测试标签组件的切换、受控模式、基础功能等
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Tabs } from '@/components/ui/Tabs';

// Mock framer-motion 以简化测试
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, layoutId, ...props }: any) => (
      <div {...props} data-testid={layoutId ? `motion-${layoutId}` : 'motion-div'}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('Tabs', () => {
  const mockItems = [
    { value: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
    { value: 'tab2', label: 'Tab 2', content: <div>Content 2</div> },
    { value: 'tab3', label: 'Tab 3', content: <div>Content 3</div> },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基础渲染', () => {
    it('应该渲染标签列表和内容面板', () => {
      render(<Tabs items={mockItems} />);

      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Tab 2')).toBeInTheDocument();
      expect(screen.getByText('Tab 3')).toBeInTheDocument();
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('应该渲染多个标签项', () => {
      render(<Tabs items={mockItems} />);

      const tabs = screen.getAllByRole('button');
      expect(tabs).toHaveLength(3);
    });

    it('应该应用自定义className', () => {
      render(<Tabs items={mockItems} className="custom-tabs" />);

      // 根容器应该包含自定义className和默认w-full类
      const container = screen.getByText('Tab 1').closest('div')?.parentElement?.parentElement;
      expect(container).toHaveClass('w-full', 'custom-tabs');
    });

    it('应该设置正确的CSS类', () => {
      render(<Tabs items={mockItems} />);

      const container = screen.getByText('Tab 1').closest('div')?.parentElement?.parentElement;
      expect(container).toHaveClass('w-full');

      // 验证标签头部容器
      const tabHeader = screen.getByText('Tab 1').closest('div')?.parentElement;
      expect(tabHeader).toHaveClass('relative', 'border-b', 'border-gray-700');
    });
  });

  describe('标签切换', () => {
    it('应该默认激活第一个标签', () => {
      render(<Tabs items={mockItems} />);

      const firstTab = screen.getByText('Tab 1');
      expect(firstTab).toHaveClass('text-white');
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('应该在点击时切换标签', async () => {
      const user = userEvent.setup();
      render(<Tabs items={mockItems} />);

      const tab2 = screen.getByText('Tab 2');
      await user.click(tab2);

      expect(screen.getByText('Content 2')).toBeInTheDocument();
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    });

    it('应该显示对应的内容面板', async () => {
      const user = userEvent.setup();
      render(<Tabs items={mockItems} />);

      const tab3 = screen.getByText('Tab 3');
      await user.click(tab3);

      expect(screen.getByText('Content 3')).toBeInTheDocument();
    });

    it('应该更新激活状态样式', async () => {
      const user = userEvent.setup();
      render(<Tabs items={mockItems} />);

      const tab1 = screen.getByText('Tab 1');
      const tab2 = screen.getByText('Tab 2');

      // 初始状态
      expect(tab1).toHaveClass('text-white');
      expect(tab2).toHaveClass('text-gray-400');

      // 切换到第二个标签
      await user.click(tab2);

      expect(tab1).toHaveClass('text-gray-400');
      expect(tab2).toHaveClass('text-white');
    });

    it('应该渲染动画下划线', () => {
      render(<Tabs items={mockItems} />);

      const underline = screen.getByTestId('motion-activeTabUnderline');
      expect(underline).toBeInTheDocument();
      expect(underline).toHaveClass('bg-indigo-400');
    });
  });

  describe('受控/非受控模式', () => {
    it('应该支持非受控模式', async () => {
      const user = userEvent.setup();
      render(<Tabs items={mockItems} />);

      await user.click(screen.getByText('Tab 2'));
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('应该支持受控模式', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();

      const { rerender } = render(
        <Tabs items={mockItems} value="tab1" onValueChange={onValueChange} />
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();

      // 点击第二个标签
      await user.click(screen.getByText('Tab 2'));
      expect(onValueChange).toHaveBeenCalledWith('tab2');

      // 父组件控制状态变化
      rerender(<Tabs items={mockItems} value="tab2" onValueChange={onValueChange} />);

      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('应该支持默认激活标签', () => {
      render(<Tabs items={mockItems} defaultValue="tab3" />);

      expect(screen.getByText('Content 3')).toBeInTheDocument();
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();

      const tab3 = screen.getByText('Tab 3');
      expect(tab3).toHaveClass('text-white');
    });

    it('应该调用onChange回调', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();

      render(<Tabs items={mockItems} onValueChange={onValueChange} />);

      await user.click(screen.getByText('Tab 2'));
      expect(onValueChange).toHaveBeenCalledWith('tab2');

      await user.click(screen.getByText('Tab 3'));
      expect(onValueChange).toHaveBeenCalledWith('tab3');

      expect(onValueChange).toHaveBeenCalledTimes(2);
    });

    it('应该在受控模式下忽略内部状态变化', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();

      render(<Tabs items={mockItems} value="tab1" onValueChange={onValueChange} />);

      await user.click(screen.getByText('Tab 3'));

      // onValueChange被调用，但内容不变（因为是受控模式）
      expect(onValueChange).toHaveBeenCalledWith('tab3');
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });
  });

  describe('键盘导航基础', () => {
    it('应该支持Tab键进入标签列表', async () => {
      const user = userEvent.setup();
      render(<Tabs items={mockItems} />);

      await user.tab();
      expect(screen.getByText('Tab 1')).toHaveFocus();
    });

    it('应该支持Enter激活标签', async () => {
      const user = userEvent.setup();
      render(<Tabs items={mockItems} />);

      const tab2 = screen.getByText('Tab 2');
      tab2.focus();

      await user.keyboard('{Enter}');
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('应该支持Space激活标签', async () => {
      const user = userEvent.setup();
      render(<Tabs items={mockItems} />);

      const tab3 = screen.getByText('Tab 3');
      tab3.focus();

      await user.keyboard('{ }');
      expect(screen.getByText('Content 3')).toBeInTheDocument();
    });
  });

  describe('无障碍性', () => {
    it('应该为所有标签设置button角色', () => {
      render(<Tabs items={mockItems} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);

      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON');
      });
    });

    it('应该设置正确的focus样式', () => {
      render(<Tabs items={mockItems} />);

      const tab1 = screen.getByText('Tab 1');
      expect(tab1).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2');
    });
  });

  describe('动态内容', () => {
    it('应该支持动态添加标签', () => {
      const initialItems = [{ value: 'tab1', label: 'Tab 1', content: <div>Content 1</div> }];

      const { rerender } = render(<Tabs items={initialItems} />);

      expect(screen.getAllByRole('button')).toHaveLength(1);

      const expandedItems = [
        ...initialItems,
        { value: 'tab2', label: 'Tab 2', content: <div>Content 2</div> },
        { value: 'tab3', label: 'Tab 3', content: <div>Content 3</div> },
      ];

      rerender(<Tabs items={expandedItems} />);

      expect(screen.getAllByRole('button')).toHaveLength(3);
      expect(screen.getByText('Tab 2')).toBeInTheDocument();
      expect(screen.getByText('Tab 3')).toBeInTheDocument();
    });

    it('应该支持动态移除标签', () => {
      const { rerender } = render(<Tabs items={mockItems} />);

      expect(screen.getAllByRole('button')).toHaveLength(3);

      const reducedItems = mockItems.slice(0, 2);
      rerender(<Tabs items={reducedItems} />);

      expect(screen.getAllByRole('button')).toHaveLength(2);
      expect(screen.queryByText('Tab 3')).not.toBeInTheDocument();
    });

    it('应该处理标签内容变化', () => {
      const { rerender } = render(<Tabs items={mockItems} />);

      expect(screen.getByText('Content 1')).toBeInTheDocument();

      const updatedItems = [
        { value: 'tab1', label: 'Tab 1', content: <div>Updated Content 1</div> },
        ...mockItems.slice(1),
      ];

      rerender(<Tabs items={updatedItems} />);

      expect(screen.getByText('Updated Content 1')).toBeInTheDocument();
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    });

    it('应该保持激活状态一致性', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<Tabs items={mockItems} />);

      // 切换到第二个标签
      await user.click(screen.getByText('Tab 2'));
      expect(screen.getByText('Content 2')).toBeInTheDocument();

      // 重新渲染相同的items
      rerender(<Tabs items={mockItems} />);

      // 内部状态保持
      expect(screen.getByText('Content 2')).toBeInTheDocument();
      const tab2 = screen.getByText('Tab 2');
      expect(tab2).toHaveClass('text-white');
    });
  });

  describe('边界情况', () => {
    it('应该处理空items数组', () => {
      render(<Tabs items={[]} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('应该处理单个标签', () => {
      const singleItem = [
        { value: 'single', label: 'Single Tab', content: <div>Single Content</div> },
      ];

      render(<Tabs items={singleItem} />);

      expect(screen.getByText('Single Tab')).toBeInTheDocument();
      expect(screen.getByText('Single Content')).toBeInTheDocument();
    });

    it('应该处理复杂的内容', () => {
      const complexItems = [
        {
          value: 'complex',
          label: 'Complex Tab',
          content: (
            <div>
              <h3>Complex Content</h3>
              <p>
                Paragraph with <strong>bold text</strong>
              </p>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
              </ul>
              <button>Action Button</button>
            </div>
          ),
        },
      ];

      render(<Tabs items={complexItems} />);

      expect(screen.getByText('Complex Content')).toBeInTheDocument();
      expect(screen.getByText('bold text')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
    });

    it('应该处理无效的defaultValue', () => {
      render(<Tabs items={mockItems} defaultValue="nonexistent" />);

      // 应该回退到第一个标签
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });
  });
});
