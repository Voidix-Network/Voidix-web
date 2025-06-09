import { motion } from 'framer-motion';
import { cn } from '@/utils';

/**
 * 卡片组件 - 基于原项目的card-hover效果
 */
interface CardProps {
  hover?: boolean;
  variant?: 'default' | 'glass' | 'solid';
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  // 支持常用的HTML属性
  'data-testid'?: string;
  tabIndex?: number;
  'aria-label'?: string;
  role?: string;
  id?: string;
}

export const Card: React.FC<CardProps> = ({
  hover = false,
  variant = 'default',
  className,
  children,
  onClick,
  'data-testid': dataTestId,
  tabIndex,
  'aria-label': ariaLabel,
  role,
  id,
}) => {
  const variants = {
    default: 'bg-gray-800/50 border border-gray-700',
    glass: 'bg-gray-800/50 border border-gray-700 backdrop-blur-sm',
    solid: 'bg-gray-800 border border-gray-700',
  };

  return (
    <motion.div
      className={cn(
        'rounded-2xl overflow-hidden',
        variants[variant],
        hover && 'cursor-pointer',
        className
      )}
      {...(hover && {
        whileHover: {
          y: -5,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
        },
        transition: { duration: 0.3 },
      })}
      onClick={onClick}
      data-testid={dataTestId}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      role={role}
      id={id}
    >
      {children}
    </motion.div>
  );
};
