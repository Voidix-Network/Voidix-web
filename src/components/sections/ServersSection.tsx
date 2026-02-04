import { GradientText } from '@/components';
import { motion } from 'framer-motion';
import { Mountain, Trophy } from 'lucide-react';

/**
 * 服务器区域组件 - 悬停流光效果
 */
export const ServersSection: React.FC = () => {
  return (
    <section className="mb-32 2xl:mb-24 scroll-mt-32" id="servers">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-4"
          >
            我们的
            <span className="ml-2">
              <GradientText variant="primary">服务器</GradientText>
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-gray-300 max-w-2xl mx-auto"
          >
            我们提供多种游戏模式，所有服务器均采用公平机制设计，没有任何付费优势。
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 小游戏服务器 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="group relative bg-gray-800/50 border border-gray-700 rounded-2xl p-8 backdrop-blur-sm hover:bg-gray-800/60 transition-all duration-300 cursor-pointer overflow-hidden"
          >
            {/* 边框流光效果 */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-conic from-transparent via-blue-500 to-transparent animate-[border-spin_2s_linear_infinite]"></div>
              <div className="absolute inset-[2px] bg-gray-800/50 rounded-[14px]"></div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">小游戏服务器</h3>
                  <p className="text-blue-400 text-sm">minigame.voidix.net</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6">我们有起床战争等玩法，更多玩法正在持续更新中！</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <svg
                    className="h-5 w-5 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clipRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      fillRule="evenodd"
                    ></path>
                  </svg>
                  <span>支持 1.16.5-1.21.1</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg
                    className="h-5 w-5 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clipRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      fillRule="evenodd"
                    ></path>
                  </svg>
                  <span>尽最大努力的优化</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg
                    className="h-5 w-5 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clipRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      fillRule="evenodd"
                    ></path>
                  </svg>
                  <span>多种玩法可选择</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* 生存服务器 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="group relative bg-gray-800/50 border border-gray-700 rounded-2xl p-8 backdrop-blur-sm hover:bg-gray-800/60 transition-all duration-300 cursor-pointer overflow-hidden"
          >
            {/* 边框流光效果 */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-conic from-transparent via-green-500 to-transparent animate-[border-spin_2s_linear_infinite]"></div>
              <div className="absolute inset-[2px] bg-gray-800/50 rounded-[14px]"></div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                  <Mountain className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">生存服务器</h3>
                  <p className="text-green-400 text-sm">survival.voidix.net</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6">
                没有花里胡哨的特效，没有乱糟糟的界面，只有最纯净的生存
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <svg
                    className="h-5 w-5 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clipRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      fillRule="evenodd"
                    ></path>
                  </svg>
                  <span>极致的性能</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg
                    className="h-5 w-5 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clipRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      fillRule="evenodd"
                    ></path>
                  </svg>
                  <span>超纯净生存</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg
                    className="h-5 w-5 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clipRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      fillRule="evenodd"
                    ></path>
                  </svg>
                  <span>装有回档保护</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
