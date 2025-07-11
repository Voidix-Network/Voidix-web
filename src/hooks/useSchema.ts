import { SchemaContext } from '@/components/seo/SEOProvider';
import { useContext } from 'react';

/**
 * 自定义钩子，用于访问Schema上下文
 * 提供了一种更安全、更方便的方式来添加和移除结构化数据
 */
export const useSchema = () => {
  const context = useContext(SchemaContext);

  if (!context) {
    throw new Error('useSchema 必须在 SEOProvider 内部使用');
  }

  return context;
};
