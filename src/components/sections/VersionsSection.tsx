import { GradientText } from '@/components';
import { motion } from 'framer-motion';
import { Monitor, Smartphone } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/**
 * Java版连接指南组件
 */
const JavaConnectionGuide: React.FC = () => {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center mb-6">
        <Monitor className="w-8 h-8 text-blue-400 mr-3" />
        <div>
          <h3 className="text-xl font-bold">Java版玩家连接指南</h3>
          <p className="text-gray-300">适用于PC端Minecraft Java版</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold flex-shrink-0">
            1
          </span>
          <span>启动Minecraft Java版</span>
        </div>
        <div className="flex items-center">
          <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold flex-shrink-0">
            2
          </span>
          <span>点击"多人游戏"</span>
        </div>
        <div className="flex items-center">
          <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold flex-shrink-0">
            3
          </span>
          <span>点击"添加服务器"</span>
        </div>
        <div className="flex items-center">
          <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold flex-shrink-0">
            4
          </span>
          <div className="flex flex-col">
            <span>输入服务器地址：</span>
            <div className="mt-2 flex flex-wrap gap-4">
              <div className="bg-gray-800 px-3 py-1 rounded font-mono text-sm">
                minigame.voidix.net
              </div>
              <span className="text-gray-400">或</span>
              <div className="bg-gray-800 px-3 py-1 rounded font-mono text-sm">
                survival.voidix.net
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold flex-shrink-0">
            5
          </span>
          <span>点击"完成"并加入服务器</span>
        </div>
      </div>
    </div>
  );
};

/**
 * 基岩版连接指南组件
 */
const BedrockConnectionGuide: React.FC = () => {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center mb-6">
        <Smartphone className="w-8 h-8 text-green-400 mr-3" />
        <div>
          <h3 className="text-xl font-bold">基岩版玩家连接指南</h3>
          <p className="text-gray-400">
            启动Minecraft基岩版 (Windows 10/11, Mobile, Xbox, PS, Switch)
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold flex-shrink-0">
            1
          </span>
          <span>启动Minecraft基岩版 (Windows 10/11, Mobile, Xbox, PS, Switch)</span>
        </div>
        <div className="flex items-center">
          <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold flex-shrink-0">
            2
          </span>
          <span>点击"游戏" → "服务器"选项卡</span>
        </div>
        <div className="flex items-center">
          <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold flex-shrink-0">
            3
          </span>
          <span>滚动到底部，点击"添加服务器"</span>
        </div>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center">
            <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold flex-shrink-0">
              4
            </span>
            <span>输入以下信息：</span>
          </div>
          <div className="ml-9 space-y-2">
            <div>
              <span className="text-gray-400">服务器名称：</span>
              <span className="font-semibold">Voidix</span>
              <span className="text-gray-400">（任意）</span>
            </div>
            <div>
              <span className="text-gray-400">服务器地址：</span>
              <div className="mt-1 flex flex-wrap gap-4">
                <div className="bg-gray-800 px-3 py-1 rounded font-mono text-sm">
                  minigame.voidix.net
                </div>
                <span className="text-gray-400">或</span>
                <div className="bg-gray-800 px-3 py-1 rounded font-mono text-sm">
                  survival.voidix.net
                </div>
              </div>
            </div>
            <div>
              <span className="text-gray-400">端口：</span>
              <div className="bg-gray-800 px-3 py-1 rounded font-mono text-sm inline-block">
                10205
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold flex-shrink-0">
            5
          </span>
          <span>点击"保存"，然后在服务器列表中找到并加入Voidix</span>
        </div>
      </div>
    </div>
  );
};

/**
 * 跨版本连接区域组件 - 带完整连接指南内容、滑动动画和伸缩动画
 */
export const VersionsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const underlineRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const javaContentRef = useRef<HTMLDivElement>(null);
  const bedrockContentRef = useRef<HTMLDivElement>(null);

  // 更新下划线位置，复现原HTML的动画效果
  useEffect(() => {
    const activeButton = buttonRefs.current[activeTab];
    const underline = underlineRef.current;

    if (activeButton && underline) {
      const buttonRect = activeButton.getBoundingClientRect();
      const containerRect = activeButton.parentElement?.getBoundingClientRect();

      if (containerRect) {
        const left = buttonRect.left - containerRect.left;
        const width = buttonRect.width;

        underline.style.left = `${left}px`;
        underline.style.width = `${width}px`;
      }
    }
  }, [activeTab]);

  // 准确测量单个内容区域高度的函数
  const measureContentHeight = (targetIndex: number): number => {
    const javaEl = javaContentRef.current;
    const bedrockEl = bedrockContentRef.current;

    if (!javaEl || !bedrockEl) return 0;

    console.debug(`开始测量${targetIndex === 0 ? 'Java版' : '基岩版'}高度`);

    // 保存原始display状态
    const javaOriginalDisplay = javaEl.style.display;
    const bedrockOriginalDisplay = bedrockEl.style.display;

    // 暂时隐藏非目标内容，确保flex布局不影响测量
    if (targetIndex === 0) {
      bedrockEl.style.display = 'none';
    } else {
      javaEl.style.display = 'none';
    }

    // 测量目标内容的实际高度
    const targetEl = targetIndex === 0 ? javaEl : bedrockEl;
    const height = targetEl.getBoundingClientRect().height;

    console.debug(`${targetIndex === 0 ? 'Java版' : '基岩版'}实际高度:`, height);

    // 恢复原始display状态
    javaEl.style.display = javaOriginalDisplay;
    bedrockEl.style.display = bedrockOriginalDisplay;

    return height;
  };

  // 初始化时测量当前内容的高度
  useEffect(() => {
    const measureInitialHeight = () => {
      const height = measureContentHeight(activeTab);
      if (height > 0) {
        setContainerHeight(height);
        console.debug('初始高度设置为:', height);
      }
    };

    // 延迟测量，确保DOM完全渲染
    setTimeout(measureInitialHeight, 300);
  }, []);

  const handleTabClick = (index: number) => {
    console.debug('切换到tab:', index, '当前containerHeight:', containerHeight);
    setActiveTab(index);

    // 测量目标内容的准确高度
    setTimeout(() => {
      const height = measureContentHeight(index);
      if (height > 0) {
        console.debug(`设置容器高度为: ${height}px`);
        setContainerHeight(height);
      }
    }, 50);
  };

  // 计算滑动方向和位移
  const getSlideTransform = () => {
    // 如果从Java(0)切换到基岩版(1)，向左滑动 (-100%)
    // 如果从基岩版(1)切换到Java(0)，向右滑动 (100%)
    const translateX = activeTab === 0 ? 0 : -100;
    return `translateX(${translateX}%)`;
  };

  return (
    <section className="mb-32 2xl:mb-24 scroll-mt-32 px-4 sm:px-6 lg:px-8" id="versions">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-4"
          >
            <GradientText variant="primary">跨平台</GradientText>
            连接
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-gray-400 max-w-2xl mx-auto"
          >
            我们采用先进技术实现Java版与基岩版的互通，让不同平台的玩家可以一起游戏。
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden"
        >
          <div className="flex border-b border-gray-700 relative">
            <button
              ref={el => (buttonRefs.current[0] = el)}
              className={`tab-btn px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === 0 ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
              data-tab-target="java-content"
              data-tab-index="0"
              onClick={() => handleTabClick(0)}
            >
              Java版连接
            </button>
            <button
              ref={el => (buttonRefs.current[1] = el)}
              className={`tab-btn px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === 1 ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
              data-tab-target="bedrock-content"
              data-tab-index="1"
              onClick={() => handleTabClick(1)}
            >
              基岩版连接
            </button>
            <div
              ref={underlineRef}
              id="active-tab-underline"
              className="absolute bottom-0 h-0.5 bg-indigo-400 transition-all duration-300 ease-in-out"
            ></div>
          </div>

          <div
            className="relative overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              height: containerHeight > 0 ? `${containerHeight}px` : 'auto',
            }}
          >
            <div
              id="content-slider"
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: getSlideTransform() }}
            >
              {/* Java版连接指南 */}
              <div ref={javaContentRef} className="w-full flex-shrink-0">
                <JavaConnectionGuide />
              </div>

              {/* 基岩版连接指南 */}
              <div ref={bedrockContentRef} className="w-full flex-shrink-0">
                <BedrockConnectionGuide />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
