import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '@/utils';

/**
 * 手风琴项目接口
 */
interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

/**
 * 手风琴组件 - 增强动画效果
 */
export const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  defaultOpen = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      className={cn('border border-gray-700 rounded-xl overflow-hidden bg-gray-800/50', className)}
      whileHover={{
        borderColor: 'rgba(147, 197, 253, 0.3)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        y: -2,
      }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left transition-colors"
        aria-expanded={isOpen}
        whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.5)' }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <span className="font-medium text-white">{title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          whileHover={{ scale: 1.1 }}
          transition={{
            rotate: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
            scale: { duration: 0.2 },
          }}
        >
          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0, scale: 0.95 }}
            animate={{
              height: 'auto',
              opacity: 1,
              scale: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
              scale: 0.95,
            }}
            transition={{
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1],
              scale: { duration: 0.2 },
              opacity: { duration: 0.3 },
            }}
            className="overflow-hidden"
          >
            <motion.div
              className="px-6 pb-6 pt-2 border-t border-gray-700"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{
                delay: 0.1,
                duration: 0.3,
                ease: 'easeOut',
              }}
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * 多项手风琴容器
 */
interface AccordionProps {
  children: React.ReactNode;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({ children, className }) => {
  return <div className={cn('space-y-4', className)}>{children}</div>;
};
