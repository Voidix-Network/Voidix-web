import React, { createContext, useCallback, useMemo, useState } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';

interface SEOProviderProps {
  children: React.ReactNode;
}

interface Schema {
  id: string;
  data: Record<string, any>;
}

interface SchemaContextType {
  addSchema: (id: string, data: Record<string, any>) => void;
  removeSchema: (id: string) => void;
}

export const SchemaContext = createContext<SchemaContextType | null>(null);

/**
 * SEO Provider - 为整个应用提供react-helmet-async上下文和结构化数据管理
 * 必须包装在应用的最顶层，才能使所有SEO功能正常工作
 */
export const SEOProvider: React.FC<SEOProviderProps> = ({ children }) => {
  const [schemas, setSchemas] = useState<Schema[]>([]);

  const addSchema = useCallback((id: string, data: Record<string, any>) => {
    setSchemas(prevSchemas => {
      // 防止重复添加
      if (prevSchemas.some(schema => schema.id === id)) {
        return prevSchemas;
      }
      return [...prevSchemas, { id, data }];
    });
  }, []);

  const removeSchema = useCallback((id: string) => {
    setSchemas(prevSchemas => prevSchemas.filter(schema => schema.id !== id));
  }, []);

  const contextValue = useMemo(() => ({ addSchema, removeSchema }), [addSchema, removeSchema]);

  return (
    <HelmetProvider>
      <SchemaContext.Provider value={contextValue}>
        <Helmet>
          {schemas.map(({ id, data }) => (
            <script key={id} type="application/ld+json">
              {JSON.stringify(data)}
            </script>
          ))}
        </Helmet>
        {children}
      </SchemaContext.Provider>
    </HelmetProvider>
  );
};

export default SEOProvider;
