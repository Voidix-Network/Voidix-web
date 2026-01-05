import { useState } from 'react';

/**
 * 快速加入服务器部分组件
 * 显示服务器地址并提供复制功能
 * 优化以防止布局偏移 (CLS)
 */
export const QuickJoinSection: React.FC = () => {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  /**
   * 复制服务器地址到剪贴板
   */
  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  return (
    <div className="min-h-[200px]">
      <h3 className="font-semibold mb-6 text-lg">快速加入</h3>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">小游戏服务器</p>
          <button
            onClick={() => handleCopyAddress('minigame.voidix.net')}
            className={`text-left font-mono text-sm transition-colors cursor-pointer w-full min-w-[220px] h-8 flex items-center ${
              copiedAddress === 'minigame.voidix.net'
                ? 'text-green-400'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            {copiedAddress === 'minigame.voidix.net'
              ? 'minigame.voidix.net (已复制)'
              : 'minigame.voidix.net'}
          </button>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">生存服务器</p>
          <button
            onClick={() => handleCopyAddress('survival.voidix.net')}
            className={`text-left font-mono text-sm transition-colors cursor-pointer w-full min-w-[220px] h-8 flex items-center ${
              copiedAddress === 'survival.voidix.net'
                ? 'text-green-400'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            {copiedAddress === 'survival.voidix.net'
              ? 'survival.voidix.net (已复制)'
              : 'survival.voidix.net'}
          </button>
        </div>
      </div>
    </div>
  );
};
