import { motion } from 'framer-motion';

/**
 * 导航项目接口
 */
export interface NavigationItem {
  href: string;
  label: string;
  isExternal?: boolean;
}

/**
 * 移动端菜单组件属性接口
 */
interface MobileMenuProps {
  isOpen: boolean;
  items: NavigationItem[];
  onItemClick: (href: string, isExternal?: boolean) => void;
}

/**
 * 移动端菜单组件
 * 显示移动端的导航菜单项
 */
export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, items, onItemClick }) => {
  return (
    <motion.div
      initial={false}
      animate={{
        height: isOpen ? 'auto' : 0,
        opacity: isOpen ? 1 : 0,
      }}
      transition={{ duration: 0.3, ease: [0.25, 0.8, 0.25, 1] }}
      className="lg:hidden overflow-hidden bg-[#151f38]/95 backdrop-blur-md border-t border-gray-700"
      id="mobile-menu"
    >
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 max-h-[70vh] overflow-y-auto">
        {items.map((item, index) => (
          <motion.button
            key={item.href}
            initial={{ opacity: 0, x: -20 }}
            animate={{
              opacity: isOpen ? 1 : 0,
              x: isOpen ? 0 : -20,
            }}
            transition={{
              delay: isOpen ? index * 0.1 : 0,
              duration: 0.3,
            }}
            onClick={() => onItemClick(item.href, item.isExternal)}
            className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors w-full text-left"
          >
            {item.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};
