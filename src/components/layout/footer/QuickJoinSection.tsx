// filepath: c:\Users\ASKLL\WebstormProjects\voidix-web\src\components\layout\footer\QuickJoinSection.tsx
import { useState } from 'react';
import { useServerStore } from '@/stores/serverStore';

/**
 * 快速加入服务器部分组件
 * 显示服务器地址并提供复制功能
 */
export const QuickJoinSection: React.FC = () => {
  const { aggregateStats } = useServerStore();
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
    <div>
      <h3 className="font-semibold mb-6 text-lg">快速加入</h3>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">小游戏服务器</p>
          <button
            onClick={() => handleCopyAddress('minigame.voidix.net')}
            className={`text-left font-mono text-sm transition-colors cursor-pointer ${
              copiedAddress === 'minigame.voidix.net'
                ? 'text-green-400'
                : 'text-gray-400 hover:text-white'
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
            className={`text-left font-mono text-sm transition-colors cursor-pointer ${
              copiedAddress === 'survival.voidix.net'
                ? 'text-green-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {copiedAddress === 'survival.voidix.net'
              ? 'survival.voidix.net (已复制)'
              : 'survival.voidix.net'}
          </button>
        </div>

        {aggregateStats.totalPlayers > 0 && (
          <div className="pt-3 border-t border-gray-700/50">
            <p className="text-xs text-green-400">当前在线: {aggregateStats.totalPlayers} 人</p>
          </div>
        )}
      </div>
    </div>
  );
};
