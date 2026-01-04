import { VoidixLogo } from '@/components';
import { DelayedNavButton } from '@/components/common/DelayedNavButton';
import { useAuthStore } from '@/stores/authStore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileMenu, NavigationItem } from './navigation/MobileMenu';
import { MobileMenuButton } from './navigation/MobileMenuButton';
import { LogOut, LogIn } from 'lucide-react';

/**
 * 主导航组件 - 复现原项目的导航栏设计
 */
export const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, isLoading } = useAuthStore();

  // 导航项目 - 包含Issue系统
  const navigationItems: NavigationItem[] = [
    { href: '/status', label: '状态页', isExternal: true },
    { href: '/monitor', label: '监控', isExternal: true },
    { href: '/ban-history', label: '封禁查询', isExternal: true },
    { href: '/faq', label: '常见问题', isExternal: true },
    { href: '/bug-report', label: 'Bug反馈', isExternal: true },
    { href: '/issue', label: 'Issue系统', isExternal: true },
  ];

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    // 所有链接都是路由导航
    navigate(href);
  };

  const handleAuthAction = async () => {
    setIsMobileMenuOpen(false);
    if (isAuthenticated) {
      await logout();
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  return (
    <nav className="fixed w-full bg-[#151f38]/90 backdrop-blur-md z-50 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button onClick={() => navigate('/')} className="focus:outline-none">
              <VoidixLogo size="lg" variant="text" />
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-baseline space-x-8">
            {navigationItems.map(item => (
              <DelayedNavButton
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {item.label}
              </DelayedNavButton>
            ))}

            {/* 登录/登出按钮 - 桌面端 */}
            <button
              onClick={handleAuthAction}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
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
          </div>

          {/* Mobile Menu Button and Auth Status */}
          <div className="flex items-center gap-3 md:hidden">
            {/* 移动端登录状态指示器 */}
            {isAuthenticated && user && (
              <div className="text-xs text-blue-300 font-medium hidden sm:block">
                {user.username}
              </div>
            )}

            <MobileMenuButton
              isOpen={isMobileMenuOpen}
              onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        items={navigationItems}
        onItemClick={handleNavClick}
      />

      {/* 移动端额外的认证菜单项 */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#151f38]/95 backdrop-blur-md border-t border-gray-700 px-4 py-3">
          <button
            onClick={handleAuthAction}
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
        </div>
      )}
    </nav>
  );
};
