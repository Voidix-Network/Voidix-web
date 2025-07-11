import { useSchema } from '@/hooks/useSchema';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import React, { useEffect } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqItems: FAQItem[];
}

/**
 * FAQ结构化数据组件
 * 生成符合Schema.org标准的FAQ结构化数据，提升SEO表现
 */
export const FAQSchema: React.FC<FAQSchemaProps> = ({ faqItems }) => {
  const { addSchema, removeSchema } = useSchema();

  /**
   * 使用DOMPurify安全地清理HTML，只返回纯文本。
   * @param text 脏HTML字符串
   * @returns 清理后的纯文本
   */
  const cleanText = (text: string): string => {
    // 输入验证
    if (!text || typeof text !== 'string') {
      return '';
    }

    // 在浏览器环境中才执行清理
    if (typeof window === 'undefined') {
      // 在SSR或Node.js环境中使用jsdom来安全地清理HTML
      const window = new JSDOM('').window;
      // @ts-ignore
      const serverSideDOMPurify = DOMPurify(window);
      const sanitizedText = serverSideDOMPurify.sanitize(text, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      });
      return sanitizedText.trim();
    }

    // 使用DOMPurify移除所有HTML标签
    const sanitizedText = DOMPurify.sanitize(text, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });

    return sanitizedText.trim();
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: cleanText(item.question),
      acceptedAnswer: {
        '@type': 'Answer',
        text: cleanText(item.answer),
      },
    })),
  };

  useEffect(() => {
    const schemaId = 'faq-page-schema';
    // 使用SchemaManager设置FAQ结构化数据
    addSchema(schemaId, faqSchema);

    // 清理函数
    return () => {
      removeSchema(schemaId);
    };
  }, [faqItems, addSchema, removeSchema]); // 依赖项应包括add/remove函数

  return null; // 这个组件不渲染任何可见内容
};

export default FAQSchema;
