import { VoidixLogo } from '@/components';
import React from 'react';
import { CommunityLinksSection } from './footer/CommunityLinksSection';
import { CopyrightSection } from './footer/CopyrightSection';
import { QuickJoinSection } from './footer/QuickJoinSection';
import { ServerStatusBar } from './footer/ServerStatusBar';

// Logo区域组件 - 使用React.memo避免因为server状态更新而重新渲染
const LogoSection = React.memo(() => (
  <div className="hidden lg:flex flex-col items-center justify-center min-h-[120px] cls-optimized">
    <div className="text-center">
      <VoidixLogo size="lg" variant="full" className="mb-4" />
    </div>
  </div>
));

LogoSection.displayName = 'LogoSection';

/**
 * 页脚组件 - 模块化重构版本
 * 优化以防止布局偏移 (CLS)
 */
export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800/70 border-t border-gray-600 cls-optimized">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* 主要内容区域 - 固定最小高度防止布局偏移 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16 lg:gap-20 min-h-[200px] cls-optimized">
          {/* 快速加入 */}
          <div className="min-h-[200px] cls-optimized">
            <QuickJoinSection />
          </div>

          {/* 社区链接 */}
          <div className="min-h-[200px] cls-optimized">
            <CommunityLinksSection />
          </div>

          {/* Logo区域 - 使用React.memo优化 */}
          <LogoSection />
        </div>

        {/* 底部区域 - 固定最小高度防止布局偏移 */}
        <div className="mt-20 pt-8 border-t border-gray-700/50 min-h-[120px] cls-optimized">
          {/* 服务器状态栏 */}
          <div className="mb-8 cls-optimized">
            <ServerStatusBar />
          </div>

          {/* 版权信息 */}
          <CopyrightSection />
        </div>
      </div>
    </footer>
  );
};
