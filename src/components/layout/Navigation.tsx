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
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button onClick={() => navigate('/')} className="focus:outline-none">
              <VoidixLogo size="lg" variant="text" />
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-3">
            {navigationItems.map(item => (
              <DelayedNavButton
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-300 hover:text-white px-2 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
              >
                {item.label}
              </DelayedNavButton>
            ))}

            {/* 登录/登出按钮 - 桌面端 */}
            <button
              onClick={handleAuthAction}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap
                       bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAuthenticated ? (
                <>
                  <LogOut className="h-4 w-4" />
                  <span>登出</span>
                  {user && <span className="opacity-80 hidden xl:inline">({user.username})</span>}
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>登录</span>
                </>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
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
        onAuthAction={handleAuthAction}
        isLoading={isLoading}
        isAuthenticated={isAuthenticated}
        user={user}
      />
    </nav>
  );
};
