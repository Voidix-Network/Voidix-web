/**
 * 全局结构化数据管理器
 * 确保每种类型的Schema.org数据只有一个实例，彻底解决重复问题
 */

interface SchemaManagerOptions {
  enableDebug?: boolean;
}

class SchemaManager {
  private activeSchemas = new Map<string, string>(); // 跟踪活跃的schema
  private options: SchemaManagerOptions;

  constructor(options: SchemaManagerOptions = {}) {
    this.options = options;
  }

  /**
   * 添加或更新结构化数据
   * @param type Schema类型 (如 'Organization', 'VideoGame', 'FAQPage')
   * @param data Schema数据
   * @param source 数据源标识 (如 'seo-component', 'faq-component')
   */
  setSchema(type: string, data: any, source: string = 'unknown'): void {
    // 移除所有同类型的现有schema
    this.removeSchemaByType(type);

    // 创建新的schema script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema-type', type);
    script.setAttribute('data-schema-source', source);
    script.setAttribute('data-schema-manager', 'true');
    script.textContent = JSON.stringify(data, null, 0);

    // 添加到document head
    document.head.appendChild(script);

    // 记录活跃的schema
    const schemaKey = `${type}-${source}`;
    this.activeSchemas.set(schemaKey, script.textContent);

    if (this.options.enableDebug) {
      console.log(`[SchemaManager] 设置 ${type} schema (来源: ${source})`);
    }
  }

  /**
   * 移除特定类型的所有结构化数据
   */
  removeSchemaByType(type: string): void {
    // 移除DOM中的scripts
    document.querySelectorAll(`script[data-schema-type="${type}"]`).forEach(script => {
      script.remove();
    });

    // 移除没有标记但类型匹配的scripts
    document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
      try {
        const data = JSON.parse(script.textContent || '');
        if (data['@type'] === type) {
          script.remove();
        }
      } catch {
        // 忽略无效JSON
      }
    });

    // 更新记录
    for (const [key] of this.activeSchemas) {
      if (key.startsWith(type + '-')) {
        this.activeSchemas.delete(key);
      }
    }

    if (this.options.enableDebug) {
      console.log(`[SchemaManager] 移除所有 ${type} schema`);
    }
  }

  /**
   * 移除特定来源的结构化数据
   */
  removeSchemaBySource(source: string): void {
    document.querySelectorAll(`script[data-schema-source="${source}"]`).forEach(script => {
      const type = script.getAttribute('data-schema-type');
      script.remove();

      if (type) {
        const schemaKey = `${type}-${source}`;
        this.activeSchemas.delete(schemaKey);
      }
    });

    if (this.options.enableDebug) {
      console.log(`[SchemaManager] 移除来源为 ${source} 的所有schema`);
    }
  }

  /**
   * 清理所有结构化数据
   */
  clearAll(): void {
    document.querySelectorAll('script[data-schema-manager="true"]').forEach(script => {
      script.remove();
    });

    this.activeSchemas.clear();

    if (this.options.enableDebug) {
      console.log('[SchemaManager] 清理所有schema');
    }
  }

  /**
   * 获取当前活跃的schema统计
   */
  getStats(): { [key: string]: number } {
    const stats: { [key: string]: number } = {};

    document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
      try {
        const data = JSON.parse(script.textContent || '');
        const type = data['@type'];
        if (type) {
          stats[type] = (stats[type] || 0) + 1;
        }
      } catch {
        // 忽略无效JSON
      }
    });

    return stats;
  }

  /**
   * 验证schema唯一性
   */
  validateUniqueness(): { isValid: boolean; duplicates: string[] } {
    const stats = this.getStats();
    const duplicates = Object.entries(stats)
      .filter(([_, count]) => count > 1)
      .map(([type]) => type);

    return {
      isValid: duplicates.length === 0,
      duplicates,
    };
  }

  /**
   * 调试：打印当前schema状态
   */
  debug(): void {
    const stats = this.getStats();
    const validation = this.validateUniqueness();

    console.group('[SchemaManager] 调试信息');
    console.log('Schema统计:', stats);
    console.log('唯一性验证:', validation);
    console.log('活跃schema记录:', Array.from(this.activeSchemas.keys()));
    console.groupEnd();
  }
}

// 创建全局实例
export const globalSchemaManager = new SchemaManager({
  enableDebug: import.meta.env.DEV,
});

// 在窗口对象上暴露调试功能
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).schemaManager = globalSchemaManager;
}

export default SchemaManager;
