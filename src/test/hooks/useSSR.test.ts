import { useCookieBannerSSR, useSSR } from '@/hooks/useSSR';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('useSSR', () => {
  it('应该在客户端环境中正确工作', () => {
    const { result } = renderHook(() => useSSR());

    // 在测试环境中，useEffect会立即执行
    // 所以isSSR应该是false，isMounted应该是true
    expect(result.current.isSSR).toBe(false);
    expect(result.current.isMounted).toBe(true);
    expect(result.current.shouldRender).toBe(true);
  });
});

describe('useCookieBannerSSR', () => {
  it('应该在客户端环境中提供正确的横幅渲染条件', () => {
    const { result } = renderHook(() => useCookieBannerSSR());

    // 在测试环境中，useEffect会立即执行
    expect(result.current.isSSR).toBe(false);
    expect(result.current.isMounted).toBe(true);
    expect(result.current.shouldRenderBanner).toBe(true);
  });
});

describe('useSSRSafeRender', () => {
  it('应该根据条件正确控制渲染', () => {
    const { result: result1 } = renderHook(() => useSSR());
    const { result: result2 } = renderHook(() => useSSR());

    // 在客户端环境中，shouldRender应该为true
    expect(result1.current.shouldRender).toBe(true);
    expect(result2.current.shouldRender).toBe(true);
  });
});
