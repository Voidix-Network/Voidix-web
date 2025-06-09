import { cn } from '@/utils';

/**
 * 渐变文字组件 - 基于原项目的渐变文字效果
 */
interface GradientTextProps {
  variant: 'primary' | 'vbpixel' | 'custom';
  gradient?: string;
  children: React.ReactNode;
  className?: string;
}

export const GradientText: React.FC<GradientTextProps> = ({
  variant,
  gradient,
  children,
  className,
}) => {
  // 创建inline style对象以使用CSS变量，包含完整的webkit前缀支持
  const getGradientStyle = () => {
    let background: string;

    switch (variant) {
      case 'primary':
        background = 'linear-gradient(90deg, #6a93ff, #7367f0)';
        break;
      case 'vbpixel':
        background = 'linear-gradient(90deg, #00aeff, #0067ff)';
        break;
      case 'custom':
        background = gradient || 'linear-gradient(90deg, #6a93ff, #7367f0)';
        break;
      default:
        background = 'linear-gradient(90deg, #6a93ff, #7367f0)';
    }

    return {
      background,
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      color: 'transparent',
      WebkitTextFillColor: 'transparent',
    };
  };

  return (
    <span className={cn('font-bold font-sans', className)} style={getGradientStyle()}>
      {children}
    </span>
  );
};
