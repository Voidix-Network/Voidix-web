import React from 'react';
import { HelmetProvider } from 'react-helmet-async';

interface SEOProviderProps {
  children: React.ReactNode;
}

/**
 * SEO Provider - 为整个应用提供react-helmet-async上下文
 * 必须包装在应用的最顶层，才能使PageSEO组件正常工作
 */
export const SEOProvider: React.FC<SEOProviderProps> = ({ children }) => {
  return <HelmetProvider>{children}</HelmetProvider>;
};

export default SEOProvider;
