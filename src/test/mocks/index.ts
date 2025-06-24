/**
 * Mock对象模块导出
 * 统一导出所有Mock功能
 */

import React from 'react';

// 浏览器API Mock
export * from './browserAPIs';

// WebSocket Mock
export * from './webSocketMocks';

// SEO组件Mock
export const SEOMocks = {
  SEO: ({ title, description, keywords, additionalMeta, pageKey }: any) =>
    React.createElement(
      'div',
      {
        'data-testid': 'seo',
        'data-title': title,
        'data-description': description,
        'data-keywords': keywords,
        'data-page-key': pageKey,
        'data-additional-meta': JSON.stringify(additionalMeta),
      },
      'SEO'
    ),
  FAQSchema: () => null,
  CookieConsent: () => null,
  SEOProvider: ({ children }: any) => children,
};
