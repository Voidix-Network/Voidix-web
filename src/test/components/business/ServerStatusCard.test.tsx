import { ServerStatusCard } from '@/components/business/ServerStatusCard';
import type { ServerStatus } from '@/types';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

// 引入测试设置
import '@/test/setup';

describe('ServerStatusCard', () => {
  describe('基础渲染', () => {
    it('应该渲染基本的服务器状态卡片结构', () => {
      render(
        <ServerStatusCard
          type="MINIGAME"
          address="minigame.voidix.net"
          status="online"
          players={10}
        />
      );

      // 验证type显示
      expect(screen.getByText('MINIGAME')).toBeInTheDocument();

      // 验证地址显示
      expect(screen.getByText('minigame.voidix.net')).toBeInTheDocument();

      // 验证兼容性文本
      expect(screen.getByText('兼容 1.8-1.8.9')).toBeInTheDocument();
    });

    it('应该渲染SURVIVAL类型的服务器卡片', () => {
      render(
        <ServerStatusCard
          type="SURVIVAL"
          address="survival.voidix.net"
          status="online"
          players={15}
        />
      );

      expect(screen.getByText('SURVIVAL')).toBeInTheDocument();
      expect(screen.getByText('survival.voidix.net')).toBeInTheDocument();
    });
  });

  describe('状态指示器', () => {
    it('应该为online状态显示绿色动画指示器', () => {
      const { container } = render(
        <ServerStatusCard type="MINIGAME" address="test.voidix.net" status="online" players={5} />
      );

      const statusDot = container.querySelector('.w-3.h-3.rounded-full');
      expect(statusDot).toHaveClass('bg-green-400', 'animate-pulse');
    });

    it('应该为offline状态显示红色指示器', () => {
      const { container } = render(
        <ServerStatusCard type="SURVIVAL" address="test.voidix.net" status="offline" players={0} />
      );

      const statusDot = container.querySelector('.w-3.h-3.rounded-full');
      expect(statusDot).toHaveClass('bg-red-500');
      expect(statusDot).not.toHaveClass('animate-pulse');
    });

    it('应该为maintenance状态显示黄色动画指示器', () => {
      const { container } = render(
        <ServerStatusCard
          type="MINIGAME"
          address="test.voidix.net"
          status="maintenance"
          players={0}
        />
      );

      const statusDot = container.querySelector('.w-3.h-3.rounded-full');
      expect(statusDot).toHaveClass('bg-yellow-500', 'animate-pulse');
    });
  });

  describe('样式和布局', () => {
    it('应该应用默认的CSS类名', () => {
      const { container } = render(
        <ServerStatusCard type="MINIGAME" address="test.voidix.net" status="online" players={10} />
      );

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass(
        'bg-[#1a1f2e]/50',
        'border',
        'border-gray-700',
        'rounded-xl',
        'p-6',
        'backdrop-blur-sm',
        'max-w-xs',
        'w-full'
      );
    });

    it('应该正确传递和合并自定义className', () => {
      const { container } = render(
        <ServerStatusCard
          type="SURVIVAL"
          address="test.voidix.net"
          status="online"
          players={8}
          className="custom-class additional-class"
        />
      );

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('custom-class', 'additional-class');
      // 默认类名也应该存在
      expect(cardElement).toHaveClass('bg-[#1a1f2e]/50', 'rounded-xl');
    });

    it('应该为地址文本应用正确的字体样式', () => {
      render(
        <ServerStatusCard
          type="MINIGAME"
          address="minigame.voidix.net"
          status="online"
          players={12}
        />
      );

      const addressElement = screen.getByText('minigame.voidix.net');
      expect(addressElement).toHaveClass('font-mono', 'text-lg', 'font-bold', 'mb-2');
    });

    it('应该为type文本应用正确的样式', () => {
      render(
        <ServerStatusCard
          type="SURVIVAL"
          address="survival.voidix.net"
          status="online"
          players={20}
        />
      );

      const typeElement = screen.getByText('SURVIVAL');
      expect(typeElement).toHaveClass('text-sm', 'font-medium', 'text-gray-300');
    });

    it('应该为兼容性文本应用正确的样式', () => {
      render(
        <ServerStatusCard type="MINIGAME" address="test.voidix.net" status="online" players={5} />
      );

      const compatibilityElement = screen.getByText('兼容 1.8-1.8.9');
      expect(compatibilityElement).toHaveClass('mt-2', 'text-xs', 'text-gray-300');
    });

    it('应该为SURVIVAL服务器显示正确的兼容版本', () => {
      render(
        <ServerStatusCard
          type="SURVIVAL"
          address="survival.voidix.net"
          status="online"
          players={10}
        />
      );

      expect(screen.getByText('兼容 1.7.2-latest')).toBeInTheDocument();
    });

    it('应该为MINIGAME服务器显示正确的兼容版本', () => {
      render(
        <ServerStatusCard
          type="MINIGAME"
          address="minigame.voidix.net"
          status="online"
          players={15}
        />
      );

      expect(screen.getByText('兼容 1.8-1.8.9')).toBeInTheDocument();
    });
  });

  describe('Props处理', () => {
    it('应该处理所有必需的props', () => {
      const requiredProps = {
        type: 'MINIGAME' as const,
        address: 'test.server.net',
        status: 'online' as ServerStatus,
        players: 25,
      };

      expect(() => {
        render(<ServerStatusCard {...requiredProps} />);
      }).not.toThrow();

      expect(screen.getByText('MINIGAME')).toBeInTheDocument();
      expect(screen.getByText('test.server.net')).toBeInTheDocument();
    });

    it('应该处理可选的maxPlayers prop', () => {
      // maxPlayers是可选的，组件应该正常渲染即使没有传递
      expect(() => {
        render(
          <ServerStatusCard
            type="SURVIVAL"
            address="test.server.net"
            status="online"
            players={15}
            maxPlayers={100}
          />
        );
      }).not.toThrow();
    });

    it('应该处理可选的className prop', () => {
      // 不传递className应该也能正常工作
      expect(() => {
        render(
          <ServerStatusCard
            type="MINIGAME"
            address="test.server.net"
            status="offline"
            players={0}
          />
        );
      }).not.toThrow();
    });
  });

  describe('边界条件', () => {
    it('应该处理players为0的情况', () => {
      render(
        <ServerStatusCard type="SURVIVAL" address="empty.server.net" status="offline" players={0} />
      );

      expect(screen.getByText('SURVIVAL')).toBeInTheDocument();
      expect(screen.getByText('empty.server.net')).toBeInTheDocument();
    });

    it('应该处理长地址名称', () => {
      const longAddress = 'very-long-server-address.example.voidix.net';
      render(
        <ServerStatusCard type="MINIGAME" address={longAddress} status="online" players={10} />
      );

      expect(screen.getByText(longAddress)).toBeInTheDocument();
    });

    it('应该处理无效状态回退到灰色', () => {
      const { container } = render(
        <ServerStatusCard
          type="SURVIVAL"
          address="test.server.net"
          status={'invalid' as ServerStatus}
          players={5}
        />
      );

      const statusDot = container.querySelector('.w-3.h-3.rounded-full');
      expect(statusDot).toHaveClass('bg-gray-500');
      expect(statusDot).not.toHaveClass('animate-pulse');
    });
  });
});
