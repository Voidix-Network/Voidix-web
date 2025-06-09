import { Navigation } from './Navigation';
import { Footer } from './Footer';

/**
 * 页面布局组件接口
 */
interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 主布局组件 - 包含导航栏和页脚的页面布局
 */
export const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  return (
    <div className="min-h-screen bg-[#111827] text-gray-100 font-['Inter']">
      {/* 跳转到主内容的链接 */}
      <a href="#main-content" className="skip-to-content">
        跳转到主内容
      </a>

      <Navigation />

      {/* 主内容区域 - 添加顶部padding以避免导航栏遮挡 */}
      <main className={`pt-16 ${className || ''}`} id="main-content">
        {children}
      </main>

      <Footer />
    </div>
  );
};
