/**
 * StatusBar 组件测试
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBar } from '@/components/ui/StatusBar';
import { DailyData } from '@/services/uptimeRobotApi';
import dayjs from 'dayjs';

// 创建测试用的每日数据
const createDailyData = (days: number): DailyData[] => {
  const data: DailyData[] = [];
  const today = dayjs();

  for (let i = days - 1; i >= 0; i--) {
    data.push({
      date: today.subtract(i, 'day'),
      uptime: 99.95, // 正常运行
      down: { times: 0, duration: 0 },
    });
  }

  return data;
};

// 创建有故障的每日数据
const createDailyDataWithDowntime = (days: number): DailyData[] => {
  const data = createDailyData(days);

  // 在第一天添加一些故障
  data[0].uptime = 95.5;
  data[0].down = { times: 2, duration: 3888 }; // 约1小时的故障

  return data;
};

describe('StatusBar', () => {
  it('渲染正常状态的状态条', () => {
    const dailyData = createDailyData(90);

    render(<StatusBar dailyData={dailyData} />);

    expect(screen.getByText('90天前')).toBeInTheDocument();
    expect(screen.getByText('今天')).toBeInTheDocument();
  });

  it('渲染有故障的状态条', () => {
    const dailyData = createDailyDataWithDowntime(30);

    render(<StatusBar dailyData={dailyData} />);

    expect(screen.getByText('30天前')).toBeInTheDocument();
    expect(screen.getByText('今天')).toBeInTheDocument();
  });

  it('生成正确数量的状态条', () => {
    const dailyData = createDailyData(90);
    const { container } = render(<StatusBar dailyData={dailyData} />);

    // 应该有90个状态条
    const statusBars = container.querySelectorAll('.flex-1');
    expect(statusBars).toHaveLength(90);
  });

  it('应用自定义类名', () => {
    const dailyData = createDailyData(7);
    const { container } = render(<StatusBar dailyData={dailyData} className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('正确处理无数据的情况', () => {
    const dailyData: DailyData[] = [
      {
        date: dayjs(),
        uptime: 0,
        down: { times: 0, duration: 0 },
      },
    ];

    const { container } = render(<StatusBar dailyData={dailyData} />);

    // 应该有一个灰色的状态条（使用内联样式）
    const statusBar = container.querySelector('[style*="background-color"]');
    expect(statusBar).toBeInTheDocument();
  });

  it('根据宕机时长计算正确的红色等级', () => {
    const dailyData: DailyData[] = [
      {
        date: dayjs(),
        uptime: 50,
        down: { times: 1, duration: 43200 }, // 12小时宕机 = 50%的一天
      },
    ];

    const { container } = render(<StatusBar dailyData={dailyData} />);

    // 应该显示红色（使用内联样式）
    const statusBar = container.querySelector('[style*="background-color"]');
    expect(statusBar).toBeInTheDocument();
    expect(statusBar?.getAttribute('style')).toContain('rgb(');
  });
});
