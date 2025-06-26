import React from 'react';

interface DelayedNavButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * 延迟导航按钮组件
 * 避免React Router立即预加载目标路由，减少DOMContentLoaded期间的网络请求
 */
export const DelayedNavButton: React.FC<DelayedNavButtonProps> = ({
  href,
  children,
  className = '',
  onClick,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // 执行自定义点击处理
    if (onClick) {
      onClick();
    }

    // 使用window.location.href进行导航，避免React Router的预加载
    window.location.href = href;
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      type="button"
    >
      {children}
    </button>
  );
};

export default DelayedNavButton;
