import { motion } from 'framer-motion';
import { LogOut, LogIn } from 'lucide-react';

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
  onAuthAction: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  user: any;
}

/**
 * 移动端菜单组件
 * 显示移动端的导航菜单项
 */
export const MobileMenu: React.FC<MobileMenuProps> = ({ 
  isOpen, 
  items, 
  onItemClick,
  onAuthAction,
  isLoading,
  isAuthenticated,
  user 
}) => {
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
        
        {/* 认证按钮 - 包含在可滚动区域内 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{
            opacity: isOpen ? 1 : 0,
            x: isOpen ? 0 : -20,
          }}
          transition={{
            delay: isOpen ? items.length * 0.1 : 0,
            duration: 0.3,
          }}
          className="pt-2 mt-2 border-t border-gray-700"
        >
          <button
            onClick={onAuthAction}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors
                     bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAuthenticated ? (
              <>
                <LogOut className="h-4 w-4" />
                <span>登出</span>
                {user && <span className="opacity-80">({user.username})</span>}
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>登录</span>
              </>
            )}
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};