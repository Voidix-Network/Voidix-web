// filepath: c:\Users\ASKLL\WebstormProjects\voidix-web\src\components\layout\Footer.tsx
import { VoidixLogo } from '@/components';
import React from 'react';
import { CommunityLinksSection } from './footer/CommunityLinksSection';
import { CopyrightSection } from './footer/CopyrightSection';
import { LegalLinksSection } from './footer/LegalLinksSection';
import { QuickJoinSection } from './footer/QuickJoinSection';
import { ServerStatusBar } from './footer/ServerStatusBar';

// Logo区域组件 - 使用React.memo避免因为server状态更新而重新渲染
const LogoSection = React.memo(() => (
  <div className="hidden lg:flex flex-col items-center justify-center">
    <div className="text-center">
      <VoidixLogo size="lg" variant="full" className="mb-4" />
    </div>
  </div>
));

LogoSection.displayName = 'LogoSection';

/**
 * 页脚组件 - 模块化重构版本
 */
export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800/70 border-t border-gray-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-20">
          {/* 快速加入 */}
          <QuickJoinSection />

          {/* 社区链接 */}
          <CommunityLinksSection />

          {/* 法律链接 */}
          <LegalLinksSection />

          {/* Logo区域 - 使用React.memo优化 */}
          <LogoSection />
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
