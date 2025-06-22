import React, { useEffect } from 'react';
import { GradientText } from './GradientText';
import { LOGO_ASSETS } from '@/constants';

// 图片预加载钩子 - 防止重复请求
const useImagePreload = (src: string) => {
  useEffect(() => {
    const img = new Image();
    img.src = src;
  }, [src]);
};

interface VoidixLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  className?: string;
}

/**
 * Voidix Logo 组件
 * 提供多种尺寸和变体的品牌logo
 */
const VoidixLogoComponent: React.FC<VoidixLogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
}) => {
  // 预加载Logo图片，防止重复请求
  useImagePreload(LOGO_ASSETS.BRAND_LOGO);

  const sizeConfig = {
    sm: {
      container: 'w-12 h-12',
      icon: 'w-6 h-6',
      text: 'text-lg',
      spacing: 'gap-2',
    },
    md: {
      container: 'w-16 h-16',
      icon: 'w-8 h-8',
      text: 'text-xl',
      spacing: 'gap-3',
    },
    lg: {
      container: 'w-20 h-20',
      icon: 'w-10 h-10',
      text: 'text-2xl',
      spacing: 'gap-4',
    },
    xl: {
      container: 'w-24 h-24',
      icon: 'w-12 h-12',
      text: 'text-3xl',
      spacing: 'gap-4',
    },
  };

  const config = sizeConfig[size];

  // Voidix 真实图标 - 使用 512x512 高清版本
  const VoidixIcon: React.FC<{ className?: string }> = ({ className }) => (
    <div
      className={`${config.container} bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-400/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-lg ${className}`}
    >
      <img
        src={LOGO_ASSETS.BRAND_LOGO}
        alt="Voidix Logo"
        className={`${config.container} object-contain`}
        loading="lazy"
        decoding="async"
        style={{
          filter: 'drop-shadow(0 0 8px rgba(147, 51, 234, 0.3))', // 添加紫色光晕效果
        }}
      />
    </div>
  );

  if (variant === 'icon') {
    return <VoidixIcon className={className} />;
  }

  if (variant === 'text') {
    return (
      <GradientText variant="primary" className={`${config.text} font-bold ${className}`}>
        Voidix
      </GradientText>
    );
  }

  // full variant
  return (
    <>
      {/* 内联CSS动画定义 - 单向流动渐变 */}
      <style>{`
        @keyframes voidix-gradient-flow {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 100% 50%;
          }
        }
      `}</style>

      <div className={`flex items-center ${config.spacing} ${className}`}>
        <VoidixIcon />
        <div className="flex flex-col">
          <span
            className={`${config.text} font-bold leading-tight`}
            style={{
              background: 'linear-gradient(45deg, #6a93ff, #7367f0, #6a93ff, #7367f0, #6a93ff)',
              backgroundSize: '300% 300%',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
              animation: 'voidix-gradient-flow 6s linear infinite',
            }}
          >
            Voidix
          </span>
          <span className="text-gray-400 text-xs font-medium">Open, Free, Harmonious</span>
        </div>
      </div>
    </>
  );
};

// 使用React.memo防止不必要的重新渲染
export const VoidixLogo = React.memo(VoidixLogoComponent);
