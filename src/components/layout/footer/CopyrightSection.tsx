import { GradientText } from '@/components';

/**
 * 版权信息部分组件
 * 显示版权声明和团队信息
 * 优化以防止布局偏移 (CLS)
 */
export const CopyrightSection: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 min-h-[60px]">
      <div className="space-y-2">
        <p className="text-gray-300 text-sm">&copy; 2025 Voidix Minecraft Server. 保留所有权利。</p>
        <p className="text-gray-300 text-xs">
          本服务器为非商业公益项目，与Mojang Studios无官方关联。
        </p>
      </div>
      <div className="text-sm text-gray-300 flex-shrink-0 space-y-2 md:text-right">
        <p>
          服务器由{' '}
          <GradientText variant="primary" className="text-xs">
            Voidix Team
          </GradientText>{' '}
          维护
        </p>
        <p className="text-xs font-medium">
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-399 hover:text-blue-400 transition-colors"
          >
            粤ICP备2025491588号-1
          </a>
        </p>
      </div>
    </div>
  );
};
