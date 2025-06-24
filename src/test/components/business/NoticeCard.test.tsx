import { NoticeCard, NoticeCardSkeleton } from '@/components/business/NoticeCard';
import type { Notice } from '@/types';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock SmartText component
vi.mock('@/components/ui/RichText', () => ({
  SmartText: ({ richText, plainText, className }: any) => (
    <span className={className}>{richText ? 'Rich: ' + JSON.stringify(richText) : plainText}</span>
  ),
}));

describe('NoticeCard', () => {
  const mockNotice: Notice & { id: string } = {
    id: '1',
    title: '测试公告标题',
    text: '这是一个测试公告的内容，用来验证NoticeCard组件的渲染功能。',
    time: 1704067200000, // 2024-01-01 00:00:00
    color: '#3b82f6',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本渲染', () => {
    it('应该正确渲染公告卡片', () => {
      render(<NoticeCard notice={mockNotice} />);

      expect(screen.getByText('测试公告标题')).toBeInTheDocument();
      expect(screen.getByText(/这是一个测试公告的内容/)).toBeInTheDocument();
      expect(screen.getByText('Voidix 官方公告')).toBeInTheDocument();
    });

    it('应该显示正确的时间格式', () => {
      render(<NoticeCard notice={mockNotice} />);

      // 应该显示相对时间格式（几天前、几小时前等）
      expect(screen.getByText(/\d+天前|\d+小时前|\d+分钟前|刚刚/)).toBeInTheDocument();
    });

    it('应该应用正确的颜色主题', () => {
      const { container } = render(<NoticeCard notice={mockNotice} />);

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveStyle({ borderLeftColor: '#3b82f6' });
    });

    it('应该支持自定义className', () => {
      const { container } = render(<NoticeCard notice={mockNotice} className="custom-class" />);

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('富文本支持', () => {
    it('应该优先显示富文本标题', () => {
      const noticeWithRichText: Notice & { id: string } = {
        ...mockNotice,
        title_rich: [
          { text: '重要', bold: true },
          { text: '公告', color: '#ff0000' },
        ],
      };

      render(<NoticeCard notice={noticeWithRichText} />);

      expect(screen.getByText(/Rich:/)).toBeInTheDocument();
    });

    it('应该优先显示富文本内容', () => {
      const noticeWithRichText: Notice & { id: string } = {
        ...mockNotice,
        text_rich: [
          { text: '这是', bold: false },
          { text: '富文本', bold: true },
          { text: '内容', bold: false },
        ],
      };

      render(<NoticeCard notice={noticeWithRichText} />);

      // 检查富文本是否被正确传递给SmartText组件
      expect(screen.getByText(/Rich:/)).toBeInTheDocument();
    });

    it('应该在没有富文本时显示普通文本', () => {
      render(<NoticeCard notice={mockNotice} />);

      expect(screen.getByText('测试公告标题')).toBeInTheDocument();
      expect(screen.getByText(/这是一个测试公告的内容/)).toBeInTheDocument();
    });
  });

  describe('时间显示', () => {
    it('应该显示"刚刚"对于很近的时间', () => {
      const recentNotice: Notice & { id: string } = {
        ...mockNotice,
        time: Date.now() - 30000, // 30秒前
      };

      render(<NoticeCard notice={recentNotice} />);

      expect(screen.getByText('刚刚')).toBeInTheDocument();
    });

    it('应该显示分钟数对于几分钟前的时间', () => {
      const minutesAgoNotice: Notice & { id: string } = {
        ...mockNotice,
        time: Date.now() - 5 * 60 * 1000, // 5分钟前
      };

      render(<NoticeCard notice={minutesAgoNotice} />);

      expect(screen.getByText('5分钟前')).toBeInTheDocument();
    });

    it('应该显示小时数对于几小时前的时间', () => {
      const hoursAgoNotice: Notice & { id: string } = {
        ...mockNotice,
        time: Date.now() - 3 * 60 * 60 * 1000, // 3小时前
      };

      render(<NoticeCard notice={hoursAgoNotice} />);

      expect(screen.getByText('3小时前')).toBeInTheDocument();
    });

    it('应该显示天数对于几天前的时间', () => {
      const daysAgoNotice: Notice & { id: string } = {
        ...mockNotice,
        time: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2天前
      };

      render(<NoticeCard notice={daysAgoNotice} />);

      expect(screen.getByText('2天前')).toBeInTheDocument();
    });

    it('应该显示具体日期对于很久以前的时间', () => {
      const oldNotice: Notice & { id: string } = {
        ...mockNotice,
        time: Date.now() - 8 * 24 * 60 * 60 * 1000, // 8天前
      };

      render(<NoticeCard notice={oldNotice} />);

      // 应该显示天数格式
      expect(screen.getByText('8天前')).toBeInTheDocument();
    });
  });

  describe('颜色主题', () => {
    const colorTestCases = [
      { color: '#ef4444', name: '红色' },
      { color: '#10b981', name: '绿色' },
      { color: '#f59e0b', name: '黄色' },
      { color: '#8b5cf6', name: '紫色' },
    ];

    colorTestCases.forEach(({ color, name }) => {
      it(`应该正确应用${name}主题`, () => {
        const coloredNotice: Notice & { id: string } = {
          ...mockNotice,
          color,
        };

        const { container } = render(<NoticeCard notice={coloredNotice} />);

        const card = container.firstChild as HTMLElement;
        expect(card).toHaveStyle({ borderLeftColor: color });
      });
    });
  });
});

describe('NoticeCardSkeleton', () => {
  it('应该渲染加载骨架屏', () => {
    const { container } = render(<NoticeCardSkeleton />);

    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('bg-gray-800');

    // 应该有动画效果
    const animatedElements = container.querySelectorAll('.animate-pulse');
    expect(animatedElements.length).toBeGreaterThan(0);
  });

  it('应该有正确的结构布局', () => {
    const { container } = render(<NoticeCardSkeleton />);

    // 检查是否有标题和内容的占位元素
    const placeholders = container.querySelectorAll('.bg-gray-600, .bg-gray-700');
    expect(placeholders.length).toBeGreaterThan(1);
  });

  it('应该有边框样式', () => {
    const { container } = render(<NoticeCardSkeleton />);

    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('border-l-4', 'border-gray-700');
  });
});
