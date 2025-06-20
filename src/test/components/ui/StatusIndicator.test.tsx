/**
 * StatusIndicator 组件测试
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { MonitorStatus } from '@/types/uptimeRobot';

describe('StatusIndicator', () => {
  describe('基础渲染', () => {
    it('应该渲染状态指示器', () => {
      render(<StatusIndicator status={MonitorStatus.UP} />);

      // 应该有一个带有title属性的div元素
      const indicator = screen.getByTitle('正常');
      expect(indicator).toBeInTheDocument();
    });

    it('应该应用正确的尺寸类', () => {
      const { container } = render(<StatusIndicator status={MonitorStatus.UP} size="lg" />);

      const indicator = container.querySelector('.w-4');
      expect(indicator).toBeInTheDocument();
    });

    it('应该应用自定义className', () => {
      const { container } = render(
        <StatusIndicator status={MonitorStatus.UP} className="custom-class" />
      );

      const indicator = container.querySelector('.custom-class');
      expect(indicator).toBeInTheDocument();
    });
  });

  describe('显示标签', () => {
    it('当showLabel为true时应该显示状态标签', () => {
      render(<StatusIndicator status={MonitorStatus.UP} showLabel />);

      expect(screen.getByText('正常')).toBeInTheDocument();
    });

    it('当showLabel为false时不应该显示状态标签', () => {
      render(<StatusIndicator status={MonitorStatus.UP} showLabel={false} />);

      expect(screen.queryByText('正常')).not.toBeInTheDocument();
    });
  });

  describe('状态显示', () => {
    it('应该正确显示UP状态', () => {
      render(<StatusIndicator status={MonitorStatus.UP} showLabel />);

      expect(screen.getByText('正常')).toBeInTheDocument();
      // 当showLabel为true时，不会有title属性，因为标签已经显示了
    });

    it('应该正确显示DOWN状态', () => {
      render(<StatusIndicator status={MonitorStatus.DOWN} showLabel />);

      expect(screen.getByText('故障')).toBeInTheDocument();
      // 当showLabel为true时，不会有title属性
    });

    it('应该正确显示SEEMS_DOWN状态', () => {
      render(<StatusIndicator status={MonitorStatus.SEEMS_DOWN} showLabel />);

      expect(screen.getByText('可能故障')).toBeInTheDocument();
      // 当showLabel为true时，不会有title属性
    });

    it('应该正确显示PAUSED状态', () => {
      render(<StatusIndicator status={MonitorStatus.PAUSED} showLabel />);

      expect(screen.getByText('已暂停')).toBeInTheDocument();
      // 当showLabel为true时，不会有title属性
    });

    it('应该正确显示NOT_CHECKED_YET状态', () => {
      render(<StatusIndicator status={MonitorStatus.NOT_CHECKED_YET} showLabel />);

      expect(screen.getByText('未检查')).toBeInTheDocument();
      // 当showLabel为true时，不会有title属性
    });

    it('应该在不显示标签时显示title属性', () => {
      render(<StatusIndicator status={MonitorStatus.UP} showLabel={false} />);

      expect(screen.getByTitle('正常')).toBeInTheDocument();
      expect(screen.queryByText('正常')).not.toBeInTheDocument();
    });
  });

  describe('尺寸变体', () => {
    it('应该正确应用小尺寸', () => {
      const { container } = render(<StatusIndicator status={MonitorStatus.UP} size="sm" />);

      const indicator = container.querySelector('.w-2');
      expect(indicator).toBeInTheDocument();
    });

    it('应该正确应用中等尺寸', () => {
      const { container } = render(<StatusIndicator status={MonitorStatus.UP} size="md" />);

      const indicator = container.querySelector('.w-3');
      expect(indicator).toBeInTheDocument();
    });

    it('应该正确应用大尺寸', () => {
      const { container } = render(<StatusIndicator status={MonitorStatus.UP} size="lg" />);

      const indicator = container.querySelector('.w-4');
      expect(indicator).toBeInTheDocument();
    });
  });
});
