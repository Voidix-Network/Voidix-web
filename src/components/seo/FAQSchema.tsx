import { useSchema } from '@/hooks/useSchema';
import DOMPurify from 'dompurify';
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
   * 此函数现在是异步的，以便在Node.js环境中动态导入jsdom。
   * @param text 脏HTML字符串
   * @returns Promise<string> 清理后的纯文本
   */
  const cleanText = async (text: string): Promise<string> => {
    // 输入验证
    if (!text || typeof text !== 'string') {
      return '';
    }

    // 在Node.js环境中使用jsdom动态导入进行安全清理
    if (typeof window === 'undefined') {
      const { JSDOM } = await import('jsdom');
      const window = new JSDOM('').window;
      // @ts-ignore DOMPurify在Node.js中可以接受一个Window对象
      const serverSideDOMPurify = DOMPurify(window);
      const sanitizedText = serverSideDOMPurify.sanitize(text, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      });
      return sanitizedText.trim();
    }

    // 在浏览器环境中，同步执行
    const sanitizedText = DOMPurify.sanitize(text, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });

    return sanitizedText.trim();
  };

  useEffect(() => {
    const schemaId = 'faq-page-schema';

    const generateAndAddSchema = async () => {
      const mainEntity = await Promise.all(
        faqItems.map(async item => ({
          '@type': 'Question',
          name: await cleanText(item.question),
          acceptedAnswer: {
            '@type': 'Answer',
            text: await cleanText(item.answer),
          },
        }))
      );

      const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity,
      };

      addSchema(schemaId, faqSchema);
    };

    generateAndAddSchema();

    // 清理函数
    return () => {
      removeSchema(schemaId);
    };
  }, [faqItems, addSchema, removeSchema]);

  return null; // 这个组件不渲染任何可见内容
};

export default FAQSchema;
