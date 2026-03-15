import { AnimatedSection, GradientText } from '@/components';
import { isMobileDevice, prefersReducedMotion, useInView } from '@/hooks/useInView';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Bug,
  Check,
  ChevronDown,
  ExternalLink,
  Home,
  Info,
  Shield,
  Users,
} from 'lucide-react';
import React, { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';

const LazyMinecraftAvatar = lazy(() => import('@/components/ui/MinecraftAvatar'));

/**
 * 团队成员接口
 */
interface TeamMember {
  name: string;
  displayName: string;
  role: string;
  roleColor: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  textColor: string;
  abbreviation: string;
  minecraftUsername?: string; // MC用户名,用于获取头像
  aka?: string[]; // 别名列表
  contributions: string[];
}

/**
 * 团队成员卡片组件 - 使用新的动画系统
 */
const TeamMemberCard: React.FC<TeamMember & { animationDelay?: number }> = props => {
  const { animationDelay = 0, ...member } = props;
  const [isShowingContributions, setIsShowingContributions] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 使用新的useInView hook
  const { ref: inViewRef, isInView } = useInView<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: '50px',
    triggerOnce: true,
    mobileImmediate: true,
  });

  const {
    displayName,
    role,
    roleColor,
    description,
    gradientFrom,
    gradientTo,
    textColor,
    abbreviation,
    minecraftUsername,
    aka,
    contributions,
  } = member;

  // 检测设备类型和动画偏好
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // 处理外部点击收起（仅移动端）
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cardRef.current &&
        !cardRef.current.contains(event.target as Node) &&
        isTouchDevice &&
        isShowingContributions
      ) {
        setIsShowingContributions(false);
      }
    };

    if (isShowingContributions && isTouchDevice) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isShowingContributions, isTouchDevice]);

  // 桌面端悬停处理
  const handleMouseEnter = useCallback(() => {
    if (!isTouchDevice && contributions.length > 0) {
      setIsShowingContributions(true);
    }
  }, [isTouchDevice, contributions.length]);

  const handleMouseLeave = useCallback(() => {
    if (!isTouchDevice) {
      setIsShowingContributions(false);
    }
  }, [isTouchDevice]);

  // 移动端点击处理
  const handleClick = useCallback(() => {
    if (isTouchDevice && contributions.length > 0) {
      setIsShowingContributions(!isShowingContributions);
    }
  }, [isTouchDevice, contributions.length, isShowingContributions]);

  // 移动端完全禁用动画
  const getAnimationClasses = () => {
    const mobile = isMobileDevice();
    const reducedMotion = prefersReducedMotion();

    // 移动端或偏好减少动画时，完全跳过animate类
    if (mobile || reducedMotion) {
      return '';
    }

    // 桌面端保持动画
    const delayClass =
      animationDelay > 0 ? `animate-delay-${Math.min(animationDelay * 100, 500)}` : '';
    return `animate-fade-in-up ${isInView ? 'visible' : ''} ${delayClass}`.trim();
  };

  // 移动端强制样式和动画属性
  const getMobileStyle = () => {
    const mobile = isMobileDevice();
    const reducedMotion = prefersReducedMotion();

    if (mobile || reducedMotion) {
      return {
        opacity: 1,
        transform: 'translateY(0px)',
      };
    }

    return {};
  };

  // 移动端强制motion动画属性
  const getMobileMotionProps = () => {
    const mobile = isMobileDevice();
    const reducedMotion = prefersReducedMotion();

    if (mobile || reducedMotion) {
      return {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0 }, // 🎯 移动端始终保持 opacity: 1
        transition: { duration: 0 },
      };
    }

    return {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 }, // 🎯 桌面端也强制为 opacity: 1，不依赖 isInView
      transition: { duration: 0.6, delay: animationDelay * 0.1 },
    };
  };

  // 合并refs
  const setRefs = useCallback(
    (element: HTMLDivElement | null) => {
      if (cardRef.current !== element) {
        (cardRef as any).current = element;
      }
      if (inViewRef.current !== element) {
        (inViewRef as any).current = element;
      }
    },
    [inViewRef]
  );

  return (
    <motion.div
      ref={setRefs}
      className={`relative h-96 bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden backdrop-blur-sm transition-all duration-300 cursor-pointer ${getAnimationClasses()}`}
      style={getMobileStyle()}
      {...getMobileMotionProps()}
      whileTap={{ scale: 0.98 }}
      whileHover={{
        borderColor: isShowingContributions ? 'rgb(147 51 234 / 0.8)' : 'rgb(147 51 234 / 0.5)',
        boxShadow: isShowingContributions
          ? '0 8px 30px rgba(147, 51, 234, 0.3)'
          : '0 4px 20px rgba(147, 51, 234, 0.2)',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* 正面内容 */}
      <motion.div
        className="absolute inset-0 flex flex-col"
        animate={{
          opacity: isShowingContributions ? 0 : 1,
          scale: isShowingContributions ? 0.95 : 1,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div
          className={`relative h-64 bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-slate-900/10"></div>

          {/* 主卡片显示字母缩写 */}
          <div className={`relative text-6xl font-bold ${textColor}/50`}>{abbreviation}</div>

          {/* 交互提示 */}
          {contributions.length > 0 && (
            <div className="absolute top-4 right-4 opacity-60 group-hover:opacity-100 transition-opacity">
              <div className="bg-black/50 rounded-full p-2 backdrop-blur-sm">
                <Info className="h-4 w-4 text-white" />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 h-32 flex flex-col">
          <h3 className="text-xl font-bold mb-1">{displayName}</h3>
          <div className={`${roleColor} text-sm mb-2`}>{role}</div>
          <p className="text-gray-400 text-sm flex-1 line-clamp-3">{description}</p>

          {/* 交互提示文字 */}
          {contributions.length > 0 && (
            <div className="text-center mt-2">
              <span className={`text-xs ${isTouchDevice ? 'text-purple-400' : 'text-gray-500'}`}>
                {isTouchDevice ? '点击查看贡献' : '悬停查看贡献'}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* 贡献内容 */}
      <motion.div
        className="absolute inset-0 flex flex-col bg-gray-900/95 border border-purple-500/50 rounded-2xl"
        animate={{
          opacity: isShowingContributions ? 1 : 0,
          scale: isShowingContributions ? 1 : 1.05,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ pointerEvents: isShowingContributions ? 'auto' : 'none' }}
      >
        <div className="p-6 h-full flex flex-col">
          {/* 头部 */}
          <div className="flex items-center gap-3 mb-4">
            {/* 贡献详情显示MC头像 */}
            {minecraftUsername ? (
              <Suspense
                fallback={
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-lg flex items-center justify-center`}
                  >
                    <div className={`text-lg font-bold ${textColor}`}>{abbreviation}</div>
                  </div>
                }
              >
                <LazyMinecraftAvatar
                  username={minecraftUsername}
                  size={48}
                  fallbackText={abbreviation}
                  className="rounded-lg"
                />
              </Suspense>
            ) : (
              <div
                className={`w-12 h-12 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-lg flex items-center justify-center`}
              >
                <div className={`text-lg font-bold ${textColor}`}>{abbreviation}</div>
              </div>
            )}
            <div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-lg font-bold">{displayName}</h3>
                {aka && aka.length > 0 && (
                  <span className="text-xs text-gray-500 font-normal">({aka.join(' / ')})</span>
                )}
              </div>
              <div className={`${roleColor} text-xs`}>{role}</div>
            </div>
          </div>

          {/* 贡献列表 */}
          {contributions.length > 0 && (
            <div className="flex-1 overflow-y-auto">
              <h4 className="text-sm font-bold mb-3 text-purple-300">主要贡献</h4>
              <ul className="space-y-2">
                {contributions.map((contribution, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{
                      opacity: isShowingContributions ? 1 : 0,
                      x: isShowingContributions ? 0 : -10,
                    }}
                    transition={{
                      duration: 0.3,
                      delay: isShowingContributions ? index * 0.05 : 0,
                    }}
                    className="flex items-start gap-2 text-xs"
                  >
                    <Check className={`h-3 w-3 ${roleColor} mt-0.5 flex-shrink-0`} />
                    <span className="text-gray-200 leading-relaxed">{contribution}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {/* 返回提示 */}
          <div className="text-center mt-4 pt-3 border-t border-gray-700">
            <span className="text-xs text-gray-400">
              {isTouchDevice ? '点击返回' : '移开鼠标返回'}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/**
 * 玩家公约组件 - 保持原有实现
 */
const PlayerCovenant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { ref: inViewRef, isInView } = useInView<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: '50px',
    triggerOnce: true,
    mobileImmediate: true,
  });

  const covenantRules = [
    {
      icon: Shield,
      title: '禁止作弊',
      description: '作弊会破坏其他玩家的游戏体验，我们致力于维护公平的游戏环境',
      color: 'from-red-500 to-pink-500',
    },
    {
      icon: Users,
      title: '和谐交流',
      description: '请勿攻击他人，维护Voidix的社区环境需要我们共同努力',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Bug,
      title: '禁止恶意使用游戏bug',
      description: '好玩的bug可以使游戏更欢乐——利用恶意bug则会破坏游戏公平性',
      color: 'from-orange-500 to-yellow-500',
    },
    {
      icon: Home,
      title: '尊重他人建筑',
      description: '未经允许请勿破坏或修改其他玩家的建筑作品',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  // 移动端完全禁用动画
  const getAnimationClasses = () => {
    const mobile = isMobileDevice();
    const reducedMotion = prefersReducedMotion();

    // 移动端或偏好减少动画时，完全跳过animate类
    if (mobile || reducedMotion) {
      return '';
    }

    // 桌面端保持动画
    return `animate-fade-in-up ${isInView ? 'visible' : ''}`.trim();
  };

  // 移动端强制样式和动画属性
  const getMobileStyle = () => {
    const mobile = isMobileDevice();
    const reducedMotion = prefersReducedMotion();

    if (mobile || reducedMotion) {
      return {
        opacity: 1,
        transform: 'translateY(0px)',
      };
    }

    return {};
  };

  // 移动端强制motion动画属性
  const getMobileMotionProps = () => {
    const mobile = isMobileDevice();
    const reducedMotion = prefersReducedMotion();

    if (mobile || reducedMotion) {
      return {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0 }, // 🎯 移动端始终保持 opacity: 1
        transition: { duration: 0 },
      };
    }

    return {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 }, // 🎯 桌面端也强制为 opacity: 1，不依赖 isInView
      transition: { duration: 0.6 },
    };
  };

  return (
    <motion.div
      ref={inViewRef}
      className={`max-w-4xl mx-auto relative ${getAnimationClasses()}`}
      style={getMobileStyle()}
      {...getMobileMotionProps()}
    >
      {/* 背景渐变装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-indigo-900/20 to-blue-900/20 rounded-3xl blur-sm"></div>

      <div className="relative bg-gray-800/80 border border-gray-700/50 rounded-3xl overflow-hidden backdrop-blur-sm">
        {/* 头部区域 */}
        <motion.button
          className="w-full text-left px-8 py-6 flex items-center justify-between hover:bg-gray-700/30 transition-all duration-300 group"
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ backgroundColor: 'rgba(147, 51, 234, 0.1)' }}
          whileTap={{ scale: 0.995 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                玩家公约
              </h3>
              <p className="text-sm text-gray-300 mt-1">Voidix社区行为准则</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="text-purple-400 group-hover:text-purple-300"
          >
            <ChevronDown className="h-6 w-6" />
          </motion.div>
        </motion.button>

        {/* 内容区域 */}
        <motion.div
          initial={false}
          animate={{ height: isOpen ? 'auto' : 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="px-8 pb-8">
            {/* 规则列表 */}
            <motion.div
              className="grid gap-6 mb-8 mt-6"
              initial={false}
              animate={isOpen ? 'open' : 'closed'}
              variants={{
                open: {
                  transition: { staggerChildren: 0.1, delayChildren: 0.1 },
                },
                closed: {
                  transition: { staggerChildren: 0.05, staggerDirection: -1 },
                },
              }}
            >
              {covenantRules.map((rule, index) => {
                const IconComponent = rule.icon;
                return (
                  <motion.div
                    key={index}
                    variants={{
                      open: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.3, ease: 'easeOut' },
                      },
                      closed: {
                        opacity: 0,
                        y: 20,
                        transition: { duration: 0.2, ease: 'easeIn' },
                      },
                    }}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-gray-900/40 border border-gray-700/50 hover:bg-gray-900/60 hover:border-gray-600/50 transition-all duration-300 group"
                  >
                    <div
                      className={`w-10 h-10 bg-gradient-to-br ${rule.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-200 mb-2 group-hover:text-white transition-colors">
                        {index + 1}. {rule.title}
                      </h4>
                      <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                        {rule.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}

              {/* 查看完整规则链接 */}
              <motion.div
                variants={{
                  open: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.3, ease: 'easeOut', delay: 0.3 },
                  },
                  closed: {
                    opacity: 0,
                    y: 20,
                    transition: { duration: 0.2, ease: 'easeIn' },
                  },
                }}
                className="mb-6"
              >
                <motion.a
                  href="https://docs.qq.com/doc/DU0dGc2dwU2VaWUpm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full p-4 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 rounded-2xl hover:from-purple-600/30 hover:to-indigo-600/30 hover:border-purple-400/50 transition-all duration-300 group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ExternalLink className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold text-purple-300 group-hover:text-purple-200 transition-colors">
                          查看完整玩家规则
                        </h4>
                        <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors mt-1">
                          点击查看详细的服务器规则和管理条例
                        </p>
                      </div>
                    </div>
                    <motion.div
                      className="text-purple-400 group-hover:text-purple-300 ml-3"
                      whileHover={{ x: 3 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    >
                      <ExternalLink className="h-5 w-5" />
                    </motion.div>
                  </div>
                </motion.a>
              </motion.div>
            </motion.div>

            {/* 注意事项 */}
            <motion.div
              variants={{
                open: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.3, ease: 'easeOut', delay: 0.4 },
                },
                closed: {
                  opacity: 0,
                  y: 20,
                  transition: { duration: 0.2, ease: 'easeIn' },
                },
              }}
              className="relative p-6 bg-gradient-to-br from-amber-900/20 to-orange-900/20 rounded-2xl border border-amber-500/20"
            >
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-amber-300 mb-2">重要提醒</h5>
                  <p className="text-amber-100/80 text-sm leading-relaxed">
                    违反公约可能导致警告、暂时封禁或永久封禁。所有管理决定都经过团队讨论并记录在案。如果您对处罚有异议，可以通过正式渠道申诉。
                  </p>
                </div>
              </div>

              {/* 装饰性渐变 */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-xl"></div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

/**
 * 团队区域组件 - 使用新的动画系统
 */
export const TeamSection: React.FC = () => {
  const { ref: titleRef, isInView: titleInView } = useInView<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: '100px',
    triggerOnce: true,
    mobileImmediate: true,
  });

  const teamMembers: TeamMember[] = [
    {
      name: 'NekoSora',
      displayName: 'NekoSora',
      role: '核心开发者',
      roleColor: 'text-violet-400',
      description: '项目创始人，主导服务器架构设计和核心插件开发',
      gradientFrom: 'from-violet-900/40',
      gradientTo: 'to-purple-900/40',
      textColor: 'text-violet-400',
      abbreviation: 'Neko',
      minecraftUsername: 'neko110923',
      contributions: [
        '2025-至今: Voidix项目创始人',
        '成立VBPIXEL的服主，在运营两年VBPIXEL后认为VBPIXEL问题过多，于是带上CYsonHab开启了Voidix的旅途',
        '励志于搭建一个环境友好，无需付费，可以和大家欢乐游玩的地方',
        '负责网站后端服务搭建与主要编程开发',
      ],
      aka: ['Neko*'],
    },
    {
      name: 'CYAN-H',
      displayName: 'CYAN-H',
      role: '核心开发者',
      roleColor: 'text-indigo-400',
      description: '项目联合创始人，主导插件开发与服务器维护等，也参与部分服务器架构搭建',
      gradientFrom: 'from-indigo-900/40',
      gradientTo: 'to-blue-900/40',
      textColor: 'text-indigo-400',
      abbreviation: 'cyh',
      minecraftUsername: 'cyh2',
      contributions: ['2025-至今: Voidix联合创始人', '现任EternalStar服主', '负责次要编程开发'],
      aka: ['cyh', 'CYsonHab'],
    },
    {
      name: 'Almost Declaes',
      displayName: 'Almost Declaes',
      role: '服务器管理员',
      roleColor: 'text-fuchsia-400',
      description: '游戏玩法设计师，擅长构思创新玩法并提出建设性意见',
      gradientFrom: 'from-purple-900/40',
      gradientTo: 'to-fuchsia-900/40',
      textColor: 'text-fuchsia-400',
      abbreviation: 'Almost',
      minecraftUsername: 'Almost_Declaes',
      contributions: [
        '2025-至今: 服务器玩法顾问',
        '提出多个服务器特色玩法方案',
        '善于发现游戏平衡性问题并提供解决方案',
      ],
      aka: ['Hao_zi-Rat'],
    },
    {
      name: 'ASKLL',
      displayName: 'ASKLL',
      role: '服务器管理员',
      roleColor: 'text-blue-400',
      description: '网站设计，负责Voidix官网的视觉设计和用户体验',
      gradientFrom: 'from-purple-900/40',
      gradientTo: 'to-blue-900/40',
      textColor: 'text-blue-400',
      abbreviation: 'ASKLL',
      minecraftUsername: 'ASKLL',
      contributions: [
        '2025-至今: 网站设计与开发',
        '负责Voidix网站功能设计',
        '提升用户界面友好度和交互体验',
      ],
    },
    {
      name: 'Momoi123',
      displayName: 'Momoi123',
      role: '测试组成员',
      roleColor: 'text-blue-400',
      description: '测试Voidix的各项新功能以确保正确',
      gradientFrom: 'from-blue-900/40',
      gradientTo: 'to-indigo-900/70',
      textColor: 'text-blue-400',
      abbreviation: 'Momoi',
      minecraftUsername: 'Momoi123',
      contributions: [
        '2026-至今: 功能与玩法测试',
        '负责Voidix新功能的测试与反馈',
        '提升用户界面友好度与确保功能正确',
      ],
    },
    {
      name: 'Players',
      displayName: '玩家们',
      role: '服务器支持者',
      roleColor: 'text-slate-400',
      description: '正因为有了你们游玩，Voidix才会继续走下去',
      gradientFrom: 'from-slate-900/40',
      gradientTo: 'to-blue-900/40',
      textColor: 'text-slate-400',
      abbreviation: 'Player',
      contributions: [],
    },
  ];

  // 移动端完全禁用动画
  const getTitleAnimationClasses = () => {
    const mobile = isMobileDevice();
    const reducedMotion = prefersReducedMotion();

    // 移动端或偏好减少动画时，完全跳过animate类
    if (mobile || reducedMotion) {
      return '';
    }

    // 桌面端保持动画
    return `animate-fade-in-up ${titleInView ? 'visible' : ''}`.trim();
  };

  // 移动端强制样式和动画属性
  const getTitleMobileStyle = () => {
    const mobile = isMobileDevice();
    const reducedMotion = prefersReducedMotion();

    if (mobile || reducedMotion) {
      return {
        opacity: 1,
        transform: 'translateY(0px)',
      };
    }

    return {};
  };

  // 移动端强制motion动画属性
  const getTitleMobileMotionProps = () => {
    const mobile = isMobileDevice();
    const reducedMotion = prefersReducedMotion();

    if (mobile || reducedMotion) {
      return {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0 }, // 🎯 移动端始终保持 opacity: 1
        transition: { duration: 0 },
      };
    }

    return {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 }, // 🎯 桌面端也强制为 opacity: 1，不依赖 titleInView
      transition: { duration: 0.6 },
    };
  };

  return (
    <AnimatedSection id="team" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* 标题区域 */}
        <motion.div
          ref={titleRef}
          className={`text-center mb-16 ${getTitleAnimationClasses()}`}
          style={getTitleMobileStyle()}
          {...getTitleMobileMotionProps()}
        >
          <h2 className="text-3xl font-bold mb-4">
            我们的 <GradientText variant="primary">团队</GradientText>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            这些热爱Minecraft的开发者/管理员——与热爱游戏的你们，撑起了整个Voidix
          </p>
        </motion.div>

        {/* 团队成员网格 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 items-start">
          {teamMembers.map((member, index) => (
            <div key={member.name} className="h-full">
              <TeamMemberCard {...member} animationDelay={index} />
            </div>
          ))}
        </div>

        {/* 玩家公约 */}
        <PlayerCovenant />
      </div>
    </AnimatedSection>
  );
};
