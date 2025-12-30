import { VoidixLogo } from '@/components';
import { DelayedNavButton } from '@/components/common/DelayedNavButton';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileMenu, NavigationItem } from './navigation/MobileMenu';
import { MobileMenuButton } from './navigation/MobileMenuButton';

/**
 * 主导航组件 - 复现原项目的导航栏设计
 */
export const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // 导航项目 - 只保留用户要求的三个快速链接
  const navigationItems: NavigationItem[] = [
    { href: '/status', label: '状态页', isExternal: true },
    { href: '/faq', label: '常见问题', isExternal: true },
    { href: '/bug-report', label: 'Bug反馈', isExternal: true },
  ];

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    // 所有链接都是路由导航
    navigate(href);
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
          </div>

          {/* Mobile Menu Button - 显示快速链接菜单 */}
          <MobileMenuButton
            isOpen={isMobileMenuOpen}
            onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} items={navigationItems} onItemClick={handleNavClick} />
    </nav>
  );
};
