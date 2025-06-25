import { GradientText, ServerStatusCard } from '@/components';
import { useServers } from '@/stores';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/**
 * 英雄区域组件 - 复现原项目的首页主要区域
 */
export const HeroSection: React.FC = () => {
  const servers = useServers();
  const navigate = useNavigate();

  return (
    <section className="pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center">
        {/* 标签 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-block px-4 py-2 bg-[#1a2541] rounded-full mb-6"
        >
          <span className="text-sm font-medium text-indigo-400">公平至上的Minecraft体验</span>
        </motion.div>

        {/* 主标题 */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl tracking-tight font-bold"
        >
          <span className="text-white">下一代 </span>
          <GradientText variant="primary">公益服务器</GradientText>
        </motion.h1>

        {/* 副标题 */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto"
        >
          由开发者NekoEpisode和CYsonHab创建，继承VBPIXEL和EternalStar精神的公益小游戏服务器
        </motion.p>

        {/* 服务器状态卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 flex flex-col items-center sm:flex-row sm:justify-center gap-4"
        >
          <ServerStatusCard
            type="MINIGAME"
            address="minigame.voidix.net"
            status={servers.lobby1?.status || 'offline'}
            players={servers.lobby1?.players || 0}
          />
          <ServerStatusCard
            type="SURVIVAL"
            address="survival.voidix.net"
            status={servers.survival?.status || 'offline'}
            players={servers.survival?.players || 0}
          />
        </motion.div>

        {/* 基岩版兼容提示 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 flex justify-center"
        >
          <div className="inline-flex items-center gap-2 bg-[#1a1f2e]/50 border border-gray-700 rounded-full px-4 py-2">
            <svg
              className="h-5 w-5 text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                fillRule="evenodd"
              ></path>
            </svg>
            <span className="text-sm font-medium">基岩版兼容 | GeyserMC技术实现</span>
          </div>
        </motion.div>
      </div>

      {/* 背景展示区域 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-20 flex justify-center"
      >
        <div className="relative w-full max-w-4xl h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden border border-[#2a365c]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-indigo-900/20"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="text-2xl sm:text-3xl font-bold mb-4">探索无限可能的世界</div>
              <p className="text-gray-300 max-w-lg mx-auto mb-6">
                完全公平的游戏环境，无付费优势，只有纯粹的Minecraft乐趣
              </p>
              <div className="flex flex-row gap-3 justify-center items-center">
                <button
                  onClick={() => navigate('/status')}
                  className="inline-flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors max-w-36"
                >
                  查看服务器状态
                </button>
                <button
                  onClick={() => navigate('/faq')}
                  className="inline-flex items-center justify-center px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors max-w-36"
                >
                  常见问题解答
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
