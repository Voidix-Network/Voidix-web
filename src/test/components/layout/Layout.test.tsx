import { Layout } from '@/components/layout/Layout';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock child components
vi.mock('@/components/layout/Navigation', () => ({
  Navigation: () => <nav data-testid="navigation">Navigation Component</nav>,
}));

vi.mock('@/components/layout/Footer', () => ({
  Footer: () => <footer data-testid="footer">Footer Component</footer>,
}));

describe('Layout', () => {
  it('应该渲染基本的布局结构', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // 验证导航栏和页脚是否渲染
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();

    // 验证主内容是否渲染
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('应该渲染跳转到首页主内容的链接', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    const skipLink = screen.getByText('跳转到首页主内容');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', 'https://www.voidix.net/#main-content');
    expect(skipLink).toHaveClass('skip-to-content');
  });

  it('应该为主内容区域设置正确的 id', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    const mainElement = screen.getByRole('main');
    expect(mainElement).toHaveAttribute('id', 'main-content');
  });

  it('应该应用默认的 CSS 类名', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    const mainElement = screen.getByRole('main');
    expect(mainElement).toHaveClass('pt-16');
  });

  it('应该能够应用自定义的 className', () => {
    const customClassName = 'custom-class another-class';

    render(
      <Layout className={customClassName}>
        <div>Content</div>
      </Layout>
    );

    const mainElement = screen.getByRole('main');
    expect(mainElement).toHaveClass('pt-16', 'custom-class', 'another-class');
  });

  it('应该渲染外层容器的 CSS 类名', () => {
    const { container } = render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    const outerDiv = container.firstChild;
    expect(outerDiv).toHaveClass('min-h-screen', 'bg-[#0f172a]', 'text-white', "font-['Inter']");
  });

  it('应该在没有 className 时也能正常工作', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    const mainElement = screen.getByRole('main');
    expect(mainElement).toHaveClass('pt-16');
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('应该正确渲染多个子元素', () => {
    render(
      <Layout>
        <div>First Child</div>
        <div>Second Child</div>
        <span>Third Child</span>
      </Layout>
    );

    expect(screen.getByText('First Child')).toBeInTheDocument();
    expect(screen.getByText('Second Child')).toBeInTheDocument();
    expect(screen.getByText('Third Child')).toBeInTheDocument();
  });
});
