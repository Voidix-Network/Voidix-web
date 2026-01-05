import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

/**
 * 移动端菜单按钮组件属性接口
 */
interface MobileMenuButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * 移动端菜单按钮组件
 * 用于显示和隐藏移动端导航菜单
 */
export const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({ isOpen, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
      className="text-gray-300 hover:text-white focus:outline-none p-2 rounded-md lg:hidden"
    >
      <span className="sr-only">打开主菜单</span>
      <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </motion.div>
    </button>
  );
};
