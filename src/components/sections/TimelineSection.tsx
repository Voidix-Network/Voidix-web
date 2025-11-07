import { GradientText } from '@/components';
import { motion } from 'framer-motion';

/**
 * 发展历程组件 - 基于原HTML的完整时间轴
 */
export const TimelineSection: React.FC = () => {
  const timelineEvents = [
    {
      date: '2022年7月16日',
      title: 'VBPIXEL成立',
      description:
        'VBPIXEL开始运营，在之后的两年里保持稳定运行，积累了110+名入群玩家。但由于初期架构原因，技术债逐渐积累，仅Neko一人已难以处理所有服务器问题。',
      position: 'right',
      color: 'purple',
    },
    {
      date: '2025年5月4日',
      title: '新服务器的构想',
      description:
        'Neko在EternalStar中与cyh2讨论是否需要搭建新服务器的问题，开始规划Voidix的雏形，最终正式确定将Voidix设为服务器名称。',
      position: 'left',
      color: 'indigo',
    },
    {
      date: '2025年5月10日',
      title: 'Voidix开始搭建',
      description: '基于全新的技术架构，Voidix项目正式启动开发，采用现代化技术栈解决历史遗留问题。',
      position: 'right',
      color: 'purple',
    },
    {
      date: '2025年5月11日',
      title: '新老交替',
      description:
        'Voidix正式替换VBPIXEL，后者完成历史使命。Voidix同时继承了EternalStar和VBPIXEL的核心理念：公益、免费、和谐的游戏环境。',
      additionalDescription: 'Voidix将带着这些理念，继续走下去。',
      position: 'left',
      color: 'indigo',
    },
    {
      date: '2025年5月13日',
      title: '官网建设',
      description: 'Voidix官网开始搭建，采用现代化设计语言，展示服务器理念和技术特点。',
      position: 'right',
      color: 'purple',
    },
    {
      date: '2025年7月1日',
      title: 'Voidix正式启航',
      description: 'Voidix正式启航，开启全新的Minecraft服务器篇章。',
      position: 'left',
      color: 'indigo',
    },
    {
      date: '2025年10月16日',
      title: 'Voidix OmniCore Fast API',
      description:
        'Voidix OmniCore Fast API(简称Voidix OmniCore)上线替换Voidix-Connect，提供公开且强大快速的数据查询API',
      position: 'right',
      color: 'purple',
    },
  ];

  return (
    <section className="mb-32 2xl:mb-24 scroll-mt-32" id="timeline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-4"
          >
            从
            <span className="mx-2">
              <GradientText variant="vbpixel">VBPIXEL</GradientText>
            </span>
            到
            <span className="ml-2">
              <GradientText variant="primary">Voidix</GradientText>
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-gray-400 max-w-2xl mx-auto"
          >
            我们的发展历程，记录着每一次技术突破和社区成长
          </motion.p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* 垂直时间线 */}
          <div className="absolute top-0 bottom-0 w-0.5 bg-gray-700 left-5 transform -translate-x-1/2 md:left-1/2"></div>

          <div className="space-y-8">
            {timelineEvents.map((event, index) => (
              <motion.div
                key={index}
                initial={{
                  opacity: 0,
                  x: event.position === 'left' ? -20 : 20,
                }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: (index + 1) * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* 时间线点 */}
                <div
                  className={`absolute top-1 left-5 w-4 h-4 rounded-full border-4 border-gray-900 transform -translate-x-1/2 md:left-1/2 ${
                    event.color === 'purple' ? 'bg-purple-400' : 'bg-indigo-400'
                  }`}
                ></div>

                {/* 内容卡片 */}
                <div
                  className={`ml-12 md:ml-0 ${
                    event.position === 'left'
                      ? 'md:mr-[calc(50%+2rem)] md:flex md:justify-end'
                      : 'md:pl-[calc(50%+2rem)]'
                  }`}
                >
                  <div
                    className={`timeline-card-fresh card-hover bg-gray-800/50 border border-gray-700 rounded-xl p-4 backdrop-blur-sm relative transition-all duration-300 ${
                      event.position === 'left'
                        ? 'md:w-[calc(70%-2rem)] text-left'
                        : 'md:w-[calc(70%-2rem)]'
                    }`}
                  >
                    <div
                      className={`text-sm font-medium mb-2 ${
                        event.color === 'purple' ? 'text-purple-400' : 'text-indigo-400'
                      }`}
                    >
                      {event.date}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{event.title}</h3>
                    <p className="text-gray-400">{event.description}</p>
                    {event.additionalDescription && (
                      <p className="text-gray-400 mt-2">{event.additionalDescription}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
