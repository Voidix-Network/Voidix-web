import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils';

/**
 * Tab项目接口
 */
interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode;
}

/**
 * Tabs组件接口
 */
interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

/**
 * Tab组件 - 复现原项目的精确Tab动画效果
 */
export const Tabs: React.FC<TabsProps> = ({
  items,
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
}) => {
  const [internalValue, setInternalValue] = useState(() => {
    // 验证defaultValue是否在items中存在
    if (defaultValue && items.some(item => item.value === defaultValue)) {
      return defaultValue;
    }
    // 回退到第一个可用的item
    return items[0]?.value;
  });
  const value = controlledValue ?? internalValue;

  const handleValueChange = (newValue: string) => {
    if (!controlledValue) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Tab Headers */}
      <div className="relative border-b border-gray-700">
        <div className="flex">
          {items.map(item => (
            <button
              key={item.value}
              onClick={() => handleValueChange(item.value)}
              className={cn(
                'px-6 py-4 text-sm font-medium transition-colors relative whitespace-nowrap',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500',
                value === item.value ? 'text-white' : 'text-gray-400 hover:text-white'
              )}
            >
              {item.label}

              {/* Animated Underline - 复现原项目的动画下划线 */}
              {value === item.value && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400"
                  transition={{
                    duration: 0.3,
                    ease: [0.25, 0.8, 0.25, 1],
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content - 复现原项目的内容切换动画 */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={value}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{
              duration: 0.3,
              ease: [0.25, 0.8, 0.25, 1],
            }}
            className="pt-8"
          >
            {items.find(item => item.value === value)?.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
