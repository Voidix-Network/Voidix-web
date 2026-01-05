import { cn } from '@/utils';
import { motion } from 'framer-motion';

/**
 * 按钮组件变体
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600',
    outline: 'border border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white',
    ghost: 'text-gray-300 hover:bg-gray-800 hover:text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      className={cn(
        'rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <motion.div
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          加载中...
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
};
