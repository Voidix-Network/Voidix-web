/**
 * 测试模块统一导出入口
 * 提供测试相关功能的便捷导入
 */

// 导出测试工具和辅助函数
export * from './utils';
export * from './helpers';
export * from './mocks';

// 导出常用的测试库函数，方便统一导入
export { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';

export { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';

export { userEvent } from '@testing-library/user-event';
