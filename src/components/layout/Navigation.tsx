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

  // 导航项目 - 包含Issue系统
  const navigationItems: NavigationItem[] = [
    { href: '/status', label: '状态页', isExternal: true },
    { href: 'https://status.voidix.net', label: '监控', isExternal: true },
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
      <MobileMenu isOpen={isMobileMenuOpen} items={navigationItems} onItemClick={handleNavClick} />
    </nav>
  );
};
