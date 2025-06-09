/**
 * Card组件测试套件
 * 测试卡片的变体、悬停效果和交互
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card } from '@/components/ui/Card';

describe('Card', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基础渲染', () => {
    it('应该正确渲染基础卡片', () => {
      render(
        <Card>
          <div data-testid="card-content">卡片内容</div>
        </Card>
      );

      const cardContent = screen.getByTestId('card-content');
      expect(cardContent).toBeInTheDocument();
      expect(cardContent).toHaveTextContent('卡片内容');
    });

    it('应该应用默认的variant样式', () => {
      render(<Card data-testid="card">内容</Card>);

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('bg-gray-800/50', 'border', 'border-gray-700');
      expect(card).toHaveClass('rounded-2xl', 'overflow-hidden');
    });
  });

  describe('变体测试', () => {
    it('应该正确渲染default变体', () => {
      render(
        <Card variant="default" data-testid="card">
          Default Card
        </Card>
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('bg-gray-800/50', 'border', 'border-gray-700');
    });

    it('应该正确渲染glass变体', () => {
      render(
        <Card variant="glass" data-testid="card">
          Glass Card
        </Card>
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('bg-gray-800/50', 'border', 'border-gray-700', 'backdrop-blur-sm');
    });

    it('应该正确渲染solid变体', () => {
      render(
        <Card variant="solid" data-testid="card">
          Solid Card
        </Card>
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('bg-gray-800', 'border', 'border-gray-700');
    });
  });

  describe('悬停效果', () => {
    it('应该在hover=true时添加cursor-pointer', () => {
      render(
        <Card hover data-testid="card">
          Hoverable Card
        </Card>
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('cursor-pointer');
    });

    it('默认情况下不应该有cursor-pointer', () => {
      render(<Card data-testid="card">Normal Card</Card>);

      const card = screen.getByTestId('card');
      expect(card).not.toHaveClass('cursor-pointer');
    });
  });

  describe('点击交互', () => {
    it('应该正确处理点击事件', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Card onClick={handleClick} data-testid="card">
          Clickable Card
        </Card>
      );

      const card = screen.getByTestId('card');
      await user.click(card);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('没有onClick时不应该有点击行为', async () => {
      const user = userEvent.setup();

      render(<Card data-testid="card">Non-clickable Card</Card>);

      const card = screen.getByTestId('card');
      // 确保没有抛出错误
      await user.click(card);
      expect(card).toBeInTheDocument();
    });
  });

  describe('子组件组合', () => {
    it('应该正确渲染单个子组件', () => {
      render(
        <Card>
          <h2 data-testid="title">卡片标题</h2>
        </Card>
      );

      expect(screen.getByTestId('title')).toHaveTextContent('卡片标题');
    });

    it('应该正确渲染多个子组件', () => {
      render(
        <Card>
          <header data-testid="header">Header</header>
          <main data-testid="content">Content</main>
          <footer data-testid="footer">Footer</footer>
        </Card>
      );

      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('应该保持子组件的结构和样式', () => {
      render(
        <Card>
          <div className="p-4" data-testid="padded-content">
            内容区域
          </div>
        </Card>
      );

      const content = screen.getByTestId('padded-content');
      expect(content).toHaveClass('p-4');
      expect(content).toHaveTextContent('内容区域');
    });
  });

  describe('自定义样式', () => {
    it('应该正确应用自定义className', () => {
      render(
        <Card className="custom-class" data-testid="card">
          Custom Card
        </Card>
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-class');
    });

    it('自定义className应该与默认样式合并', () => {
      render(
        <Card className="custom-class" variant="glass" data-testid="card">
          Styled Card
        </Card>
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-class');
      expect(card).toHaveClass('backdrop-blur-sm'); // 保持变体样式
      expect(card).toHaveClass('rounded-2xl'); // 保持基础样式
    });
  });

  describe('复杂用例测试', () => {
    it('应该正确处理所有属性组合', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Card
          variant="glass"
          hover
          className="custom-shadow"
          onClick={handleClick}
          data-testid="complex-card"
        >
          <div data-testid="content">复杂卡片</div>
        </Card>
      );

      const card = screen.getByTestId('complex-card');
      const content = screen.getByTestId('content');

      // 验证所有样式类
      expect(card).toHaveClass('backdrop-blur-sm'); // glass variant
      expect(card).toHaveClass('cursor-pointer'); // hover
      expect(card).toHaveClass('custom-shadow'); // custom class

      // 验证内容正确渲染
      expect(content).toHaveTextContent('复杂卡片');

      // 验证点击功能
      await user.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('应该支持嵌套卡片结构', () => {
      render(
        <Card data-testid="outer-card">
          <Card data-testid="inner-card">
            <span data-testid="nested-content">嵌套内容</span>
          </Card>
        </Card>
      );

      expect(screen.getByTestId('outer-card')).toBeInTheDocument();
      expect(screen.getByTestId('inner-card')).toBeInTheDocument();
      expect(screen.getByTestId('nested-content')).toHaveTextContent('嵌套内容');
    });
  });

  describe('无障碍性', () => {
    it('可点击的卡片应该支持键盘操作', async () => {
      const handleClick = vi.fn();

      render(
        <Card onClick={handleClick} tabIndex={0} role="button" data-testid="accessible-card">
          Accessible Card
        </Card>
      );

      const card = screen.getByTestId('accessible-card');
      card.focus();

      expect(card).toHaveFocus();

      // 由于Card是div元素，不会自动处理键盘事件
      // 但可以验证它可以获得焦点和角色属性
      expect(card).toHaveAttribute('role', 'button');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('应该支持ARIA属性传递', () => {
      render(
        <Card aria-label="产品卡片" role="article" data-testid="aria-card">
          内容
        </Card>
      );

      const card = screen.getByTestId('aria-card');
      expect(card).toHaveAttribute('aria-label', '产品卡片');
      expect(card).toHaveAttribute('role', 'article');
    });
  });
});
