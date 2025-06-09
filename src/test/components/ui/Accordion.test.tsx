/**
 * Accordion 组件测试
 * 测试手风琴组件的展开/折叠、无障碍性、键盘导航等功能
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Accordion, AccordionItem } from '@/components/ui/Accordion';

// Mock framer-motion 以简化测试
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => (
      <div {...props} data-testid="motion-div">
        {children}
      </div>
    ),
    button: ({ children, ...props }: any) => (
      <button {...props} data-testid="motion-button">
        {children}
      </button>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));
// Mock lucide-react图标
vi.mock('lucide-react', () => ({
  ChevronDownIcon: ({ className, ...props }: any) => (
    <div data-testid="chevron-icon" className={className} {...props} />
  ),
}));

describe('AccordionItem', () => {
  const defaultProps = {
    title: 'Test Title',
    children: <div>Test Content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基础渲染', () => {
    it('应该渲染基本的手风琴项目结构', () => {
      render(<AccordionItem {...defaultProps} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByTestId('chevron-icon')).toBeInTheDocument();
    });

    it('应该应用自定义className', () => {
      render(<AccordionItem {...defaultProps} className="custom-class" />);

      const container = screen.getByRole('button').closest('div');
      expect(container).toHaveClass('custom-class');
    });

    it('应该设置正确的ARIA属性', () => {
      render(<AccordionItem {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('应该渲染子内容', () => {
      render(<AccordionItem {...defaultProps} defaultOpen={true} />);

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('展开/折叠功能', () => {
    it('应该默认折叠状态', () => {
      render(<AccordionItem {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('应该在点击时展开项目', async () => {
      const user = userEvent.setup();
      render(<AccordionItem {...defaultProps} />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('应该在再次点击时折叠项目', async () => {
      const user = userEvent.setup();
      render(<AccordionItem {...defaultProps} />);

      const button = screen.getByRole('button');

      // 展开
      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');

      // 折叠
      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('应该支持默认展开的项目', () => {
      render(<AccordionItem {...defaultProps} defaultOpen={true} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('应该正确切换展开状态', async () => {
      const user = userEvent.setup();
      render(<AccordionItem {...defaultProps} />);

      const button = screen.getByRole('button');

      // 连续点击测试
      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');

      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'false');

      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('键盘导航', () => {
    it('应该支持Tab键导航', async () => {
      const user = userEvent.setup();
      render(<AccordionItem {...defaultProps} />);

      const button = screen.getByRole('button');

      await user.tab();
      expect(button).toHaveFocus();
    });

    it('应该支持Enter键展开/折叠', async () => {
      const user = userEvent.setup();
      render(<AccordionItem {...defaultProps} />);

      const button = screen.getByRole('button');
      button.focus();

      await user.keyboard('{Enter}');
      expect(button).toHaveAttribute('aria-expanded', 'true');

      await user.keyboard('{Enter}');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('应该支持Space键展开/折叠', async () => {
      const user = userEvent.setup();
      render(<AccordionItem {...defaultProps} />);

      const button = screen.getByRole('button');
      button.focus();

      await user.keyboard('{ }');
      expect(button).toHaveAttribute('aria-expanded', 'true');

      await user.keyboard('{ }');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('无障碍性', () => {
    it('应该为按钮设置正确的角色', () => {
      render(<AccordionItem {...defaultProps} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('应该正确更新aria-expanded属性', async () => {
      const user = userEvent.setup();
      render(<AccordionItem {...defaultProps} />);

      const button = screen.getByRole('button');

      // 初始状态
      expect(button).toHaveAttribute('aria-expanded', 'false');

      // 展开后
      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');

      // 折叠后
      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('应该有可访问的按钮文本', () => {
      render(<AccordionItem {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Test Title');
    });
  });

  describe('样式和动画', () => {
    it('应该应用正确的CSS类', () => {
      render(<AccordionItem {...defaultProps} />);

      const container = screen.getByRole('button').closest('div');
      expect(container).toHaveClass('border', 'border-gray-700', 'rounded-xl');
    });

    it('应该在按钮上应用正确的基础样式类', () => {
      render(<AccordionItem {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'w-full',
        'px-6',
        'py-4',
        'flex',
        'items-center',
        'justify-between',
        'text-left',
        'transition-colors'
      );
    });

    it('应该渲染motion组件', () => {
      render(<AccordionItem {...defaultProps} />);

      // 验证motion.button存在
      expect(screen.getByTestId('motion-button')).toBeInTheDocument();

      // 验证至少有一个motion.div存在
      const motionDivs = screen.getAllByTestId('motion-div');
      expect(motionDivs.length).toBeGreaterThan(0);
    });
  });

  describe('内容渲染', () => {
    it('应该正确渲染复杂的子内容', () => {
      const complexContent = (
        <div>
          <p>Paragraph 1</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
          <span>Additional text</span>
        </div>
      );

      render(
        <AccordionItem title="Complex Content" defaultOpen={true}>
          {complexContent}
        </AccordionItem>
      );

      expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Additional text')).toBeInTheDocument();
    });

    it('应该处理空内容', () => {
      render(<AccordionItem title="Empty Content">{null}</AccordionItem>);

      expect(screen.getByText('Empty Content')).toBeInTheDocument();
    });

    it('应该支持字符串内容', () => {
      render(
        <AccordionItem title="String Content" defaultOpen={true}>
          This is a simple string content
        </AccordionItem>
      );

      expect(screen.getByText('This is a simple string content')).toBeInTheDocument();
    });
  });
});

describe('Accordion', () => {
  describe('基础渲染', () => {
    it('应该渲染手风琴容器', () => {
      render(
        <Accordion>
          <AccordionItem title="Item 1">Content 1</AccordionItem>
          <AccordionItem title="Item 2">Content 2</AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('应该应用自定义className', () => {
      render(
        <Accordion className="custom-accordion">
          <AccordionItem title="Item 1">Content 1</AccordionItem>
        </Accordion>
      );

      const container = screen.getByText('Item 1').closest('div')?.parentElement;
      expect(container).toHaveClass('custom-accordion');
    });

    it('应该应用默认间距类', () => {
      render(
        <Accordion>
          <AccordionItem title="Item 1">Content 1</AccordionItem>
        </Accordion>
      );

      const container = screen.getByText('Item 1').closest('div')?.parentElement;
      expect(container).toHaveClass('space-y-4');
    });
  });

  describe('多项手风琴', () => {
    it('应该支持多个项目同时展开', async () => {
      const user = userEvent.setup();
      render(
        <Accordion>
          <AccordionItem title="Item 1">Content 1</AccordionItem>
          <AccordionItem title="Item 2">Content 2</AccordionItem>
          <AccordionItem title="Item 3">Content 3</AccordionItem>
        </Accordion>
      );

      const buttons = screen.getAllByRole('button');

      // 展开第一个和第三个项目
      await user.click(buttons[0]);
      await user.click(buttons[2]);

      expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
      expect(buttons[1]).toHaveAttribute('aria-expanded', 'false');
      expect(buttons[2]).toHaveAttribute('aria-expanded', 'true');
    });

    it('应该正确渲染大量项目', () => {
      const items = Array.from({ length: 10 }, (_, i) => (
        <AccordionItem key={i} title={`Item ${i + 1}`} defaultOpen={true}>
          Content {i + 1}
        </AccordionItem>
      ));

      render(<Accordion>{items}</Accordion>);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(10);

      // 验证所有项目都正确渲染
      for (let i = 1; i <= 10; i++) {
        expect(screen.getByText(`Item ${i}`)).toBeInTheDocument();
        expect(screen.getByText(`Content ${i}`)).toBeInTheDocument();
      }
    });

    it('应该独立控制每个项目的状态', async () => {
      const user = userEvent.setup();
      render(
        <Accordion>
          <AccordionItem title="Item 1" defaultOpen={true}>
            Content 1
          </AccordionItem>
          <AccordionItem title="Item 2">Content 2</AccordionItem>
        </Accordion>
      );

      const buttons = screen.getAllByRole('button');

      // 初始状态：第一个展开，第二个折叠
      expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
      expect(buttons[1]).toHaveAttribute('aria-expanded', 'false');

      // 展开第二个项目
      await user.click(buttons[1]);
      expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
      expect(buttons[1]).toHaveAttribute('aria-expanded', 'true');

      // 折叠第一个项目
      await user.click(buttons[0]);
      expect(buttons[0]).toHaveAttribute('aria-expanded', 'false');
      expect(buttons[1]).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('综合交互测试', () => {
    it('应该支持键盘在多个项目间导航', async () => {
      const user = userEvent.setup();
      render(
        <Accordion>
          <AccordionItem title="Item 1">Content 1</AccordionItem>
          <AccordionItem title="Item 2">Content 2</AccordionItem>
          <AccordionItem title="Item 3">Content 3</AccordionItem>
        </Accordion>
      );

      const buttons = screen.getAllByRole('button');

      // Tab到第一个按钮
      await user.tab();
      expect(buttons[0]).toHaveFocus();

      // Tab到第二个按钮
      await user.tab();
      expect(buttons[1]).toHaveFocus();

      // 使用Enter展开第二个项目
      await user.keyboard('{Enter}');
      expect(buttons[1]).toHaveAttribute('aria-expanded', 'true');

      // Tab到第三个按钮
      await user.tab();
      expect(buttons[2]).toHaveFocus();

      // 使用Space展开第三个项目
      await user.keyboard('{ }');
      expect(buttons[2]).toHaveAttribute('aria-expanded', 'true');
    });

    it('应该处理快速连续点击', async () => {
      const user = userEvent.setup();
      render(
        <Accordion>
          <AccordionItem title="Fast Click Test">Content</AccordionItem>
        </Accordion>
      );

      const button = screen.getByRole('button');

      // 快速连续点击
      await user.click(button);
      await user.click(button);
      await user.click(button);

      // 最终应该是展开状态（奇数次点击）
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
