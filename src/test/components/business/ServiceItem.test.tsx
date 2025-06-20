/**
 * ServiceItem 组件测试
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ServiceItem } from '@/components/business/ServiceItem';
import { EnhancedMonitor } from '@/services/uptimeRobotApi';
import dayjs from 'dayjs';

describe('ServiceItem', () => {
  const mockMonitor: EnhancedMonitor = {
    id: 1,
    name: '官网',
    url: 'https://www.voidix.net',
    status: 'ok',
    average: 99.9,
    daily: [
      {
        date: dayjs().subtract(1, 'day'),
        uptime: 100,
        down: { times: 0, duration: 0 },
      },
      {
        date: dayjs(),
        uptime: 99.8,
        down: { times: 1, duration: 172 },
      },
    ],
    total: { times: 1, duration: 172 },
  };

  it('渲染监控项目信息', () => {
    render(<ServiceItem monitor={mockMonitor} />);

    expect(screen.getByText('官网')).toBeInTheDocument();
    expect(screen.getByText('正常')).toBeInTheDocument();
  });

  it('显示故障状态', () => {
    const downMonitor: EnhancedMonitor = {
      ...mockMonitor,
      status: 'down',
    };

    render(<ServiceItem monitor={downMonitor} />);

    expect(screen.getByText('故障')).toBeInTheDocument();
  });

  it('显示未知状态', () => {
    const unknownMonitor: EnhancedMonitor = {
      ...mockMonitor,
      status: 'unknow',
    };

    render(<ServiceItem monitor={unknownMonitor} />);

    expect(screen.getByText('未知')).toBeInTheDocument();
  });

  it('显示正确的统计信息', () => {
    render(<ServiceItem monitor={mockMonitor} />);

    expect(screen.getByText(/故障 1 次/)).toBeInTheDocument();
    expect(screen.getByText(/平均可用率 99.9%/)).toBeInTheDocument();
  });

  it('显示无故障的统计信息', () => {
    const noDowntimeMonitor: EnhancedMonitor = {
      ...mockMonitor,
      total: { times: 0, duration: 0 },
    };

    render(<ServiceItem monitor={noDowntimeMonitor} />);

    expect(screen.getByText(/平均可用率 99.9%/)).toBeInTheDocument();
    expect(screen.queryByText(/故障/)).not.toBeInTheDocument();
  });

  it('应用自定义类名', () => {
    const { container } = render(<ServiceItem monitor={mockMonitor} className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
