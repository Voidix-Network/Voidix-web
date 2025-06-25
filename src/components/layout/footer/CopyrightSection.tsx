// filepath: c:\Users\ASKLL\WebstormProjects\voidix-web\src\components\layout\footer\CopyrightSection.tsx
import { GradientText } from '@/components';

/**
 * 版权信息部分组件
 * 显示版权声明和团队信息
 */
export const CopyrightSection: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div className="space-y-2">
        <p className="text-gray-300 text-sm">&copy; 2025 Voidix Minecraft Server. 保留所有权利。</p>
        <p className="text-gray-300 text-xs">
          本服务器为非商业公益项目，与Mojang Studios无官方关联。
        </p>
      </div>
      <div className="text-xs text-gray-300 h-4 leading-4">
        <p>
          服务器由{' '}
          <GradientText variant="primary" className="text-xs">
            Voidix Team
          </GradientText>{' '}
          维护
        </p>
      </div>
    </div>
  );
};
