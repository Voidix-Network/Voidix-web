// filepath: c:\Users\ASKLL\WebstormProjects\voidix-web\src\components\layout\Footer.tsx
import React from 'react';
import { VoidixLogo } from '@/components';
import { QuickJoinSection } from './footer/QuickJoinSection';
import { CommunityLinksSection } from './footer/CommunityLinksSection';
import { ServerStatusBar } from './footer/ServerStatusBar';
import { CopyrightSection } from './footer/CopyrightSection';

// Logo区域组件 - 使用React.memo避免因为server状态更新而重新渲染
const LogoSection = React.memo(() => (
  <div className="hidden lg:flex flex-col items-center justify-center">
    <div className="text-center">
      <VoidixLogo size="lg" variant="full" className="mb-4" />
      <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
        开放、免费、和谐的游戏体验
        <br />
        携手共建美好的虚拟世界
      </p>
    </div>
  </div>
));

LogoSection.displayName = 'LogoSection';

/**
 * 页脚组件 - 模块化重构版本
 */
export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800/50 border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16 lg:gap-20">
          {/* 快速加入 */}
          <QuickJoinSection />

          {/* 社区链接 */}
          <CommunityLinksSection />

          {/* Logo区域 - 仅在桌面端显示 */}
          <div className="hidden lg:flex flex-col items-center justify-center">
            <div className="text-center">
              <VoidixLogo size="lg" variant="full" className="mb-4" />
              <p className="text-gray-400 text-xs max-w-32"></p>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-gray-700/50">
          {/* 服务器状态栏 */}
          <ServerStatusBar />

          {/* 版权信息 */}
          <CopyrightSection />
        </div>
      </div>
    </footer>
  );
};
