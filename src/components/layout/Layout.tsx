import { Footer } from './Footer';
import { Navigation } from './Navigation';

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
    <div className="min-h-screen bg-[#0f172a] text-white font-['Inter']">
      {/* 跳转到首页主内容的链接 */}
      <a href="https://www.voidix.net/#main-content" className="skip-to-content">
        跳转到首页主内容
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
