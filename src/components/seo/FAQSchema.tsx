import { globalSchemaManager } from '@/utils/schemaManager';
import React from 'react';

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
  /**
   * 安全地清理HTML标签，只保留纯文本用于结构化数据
   * 使用DOM API作为首选方法，循环替换作为备用方案
   * 防止HTML注入和XSS攻击
   */
  const cleanText = (text: string): string => {
    // 输入验证
    if (!text || typeof text !== 'string') {
      return '';
    }

    // 防止DoS攻击的长度限制
    if (text.length > 10000) {
      text = text.substring(0, 10000);
    }

    try {
      // 方法1: 使用DOM API安全提取文本内容 (首选)
      const div = document.createElement('div');
      div.innerHTML = text;
      const result = div.textContent || div.innerText || '';
      return result.trim();
    } catch (error) {
      // 方法2: 循环替换备用方案，防止嵌套标签绕过
      let cleanedText = text;
      let previousLength;

      // 持续应用正则表达式直到没有更多HTML标签
      do {
        previousLength = cleanedText.length;
        cleanedText = cleanedText.replace(/<[^>]*>/g, '');
      } while (cleanedText.length !== previousLength && cleanedText.includes('<'));

      return cleanedText.trim();
    }
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

  React.useEffect(() => {
    // 使用SchemaManager设置FAQ结构化数据
    globalSchemaManager.setSchema('FAQPage', faqSchema, 'faq-component');

    console.log('[FAQSchema] 已通过SchemaManager设置FAQ结构化数据');

    // 清理函数
    return () => {
      globalSchemaManager.removeSchemaBySource('faq-component');
    };
  }, [faqItems]);

  return null; // 这个组件不渲染任何可见内容
};

export default FAQSchema;
