import { motion, Variants } from 'framer-motion';
import React from 'react';
import { useInView } from '../../hooks/useInView';

/**
 * 移动端设备检测工具函数
 */
const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth <= 768
  );
};

/**
 * 检查用户是否偏好减少动画
 */
const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * 动画变体定义 - 基于原项目的动画系统
 */
interface AnimationVariants {
  fadeInUp: Variants;
  fadeInLeft: Variants;
  fadeInRight: Variants;
  staggerContainer: Variants;
  scaleIn: Variants;
}

export const animationVariants: AnimationVariants = {
  fadeInUp: {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.8, 0.25, 1],
      },
    },
    exit: {
      opacity: 0,
      y: -20,
    },
  },

  fadeInLeft: {
    initial: {
      opacity: 0,
      x: -30,
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.8, 0.25, 1],
      },
    },
  },

  fadeInRight: {
    initial: {
      opacity: 0,
      x: 30,
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.8, 0.25, 1],
      },
    },
  },

  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },

  scaleIn: {
    initial: {
      opacity: 0,
      scale: 0.9,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.8, 0.25, 1],
      },
    },
  },
};

/**
 * 动画容器组件
 */
interface AnimatedSectionProps {
  children: React.ReactNode;
  variant?: keyof AnimationVariants;
  delay?: number;
  className?: string;
  id?: string;
  stagger?: boolean;
}

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  variant = 'fadeInUp',
  delay = 0,
  className,
  id,
  stagger = false,
}) => {
  const variants = stagger ? animationVariants.staggerContainer : animationVariants[variant];

  // 🎯 设备和偏好检测
  const mobile = isMobileDevice();
  const reducedMotion = prefersReducedMotion();

  // 📱 移动端使用自定义useInView，等待滚动到位置才触发
  const { ref: mobileRef, isInView } = useInView({
    threshold: 0.3,
    rootMargin: '-50px',
    mobileImmediate: false, // 🔑 关键：移动端也要等待进入视口
  });

  if (reducedMotion) {
    // 只有偏好减少动画才完全禁用
    return (
      <section
        id={id}
        className={className}
        style={{
          opacity: 1,
          transform: 'none',
        }}
      >
        {children}
      </section>
    );
  }

  // 💻 移动端和桌面端统一使用motion.section，但触发机制不同
  return (
    <motion.section
      ref={mobile ? mobileRef : undefined} // 📱 移动端使用自定义ref
      id={id}
      initial="initial"
      animate={mobile ? (isInView ? 'animate' : 'initial') : undefined} // 📱 移动端根据isInView状态
      whileInView={mobile ? undefined : 'animate'} // 🖥️ 桌面端保持whileInView
      viewport={
        mobile
          ? undefined
          : {
              once: true,
              margin: '-50px',
              amount: 0.3,
            }
      }
      variants={variants}
      className={className}
      style={{
        transitionDelay: mobile ? '0s' : `${delay}s`,
      }}
    >
      {stagger ? (
        <motion.div variants={animationVariants.staggerContainer}>
          {React.Children.map(children, (child, index) => (
            <motion.div key={index} variants={animationVariants.fadeInUp}>
              {child}
            </motion.div>
          ))}
        </motion.div>
      ) : (
        children
      )}
    </motion.section>
  );
};
