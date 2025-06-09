/**
 * 数学工具函数测试
 * 验证测试框架基础功能
 */

import { describe, it, expect } from 'vitest';
import { add, multiply } from '../utils/mathUtils';

describe('数学工具函数测试', () => {
  describe('加法运算', () => {
    it('应该正确计算两个正数的和', () => {
      expect(add(2, 3)).toBe(5);
      expect(add(1, 1)).toBe(2);
    });

    it('应该正确处理负数', () => {
      expect(add(-1, 1)).toBe(0);
      expect(add(-2, -3)).toBe(-5);
    });

    it('应该正确处理零', () => {
      expect(add(0, 0)).toBe(0);
      expect(add(5, 0)).toBe(5);
    });
  });

  describe('乘法运算', () => {
    it('应该正确计算两个正数的积', () => {
      expect(multiply(2, 3)).toBe(6);
      expect(multiply(4, 5)).toBe(20);
    });

    it('应该正确处理负数', () => {
      expect(multiply(-2, 3)).toBe(-6);
      expect(multiply(-2, -3)).toBe(6);
    });

    it('应该正确处理零', () => {
      expect(multiply(0, 5)).toBe(0);
      expect(multiply(10, 0)).toBe(0);
    });
  });
});
