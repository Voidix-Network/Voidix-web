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
   * 添加或更新结构化数据（防重复增强版）
   * @param type Schema类型 (如 'Organization', 'VideoGame', 'FAQPage')
   * @param data Schema数据
   * @param source 数据源标识 (如 'seo-component', 'faq-component')
   */
  setSchema(type: string, data: any, source: string = 'unknown'): void {
    // 移除所有同类型的现有schema
    this.removeSchemaByType(type);

    // 防止React严格模式重复渲染：检查相同内容是否已存在
    const newContent = JSON.stringify(data, null, 0);
    const existingScript = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]')
    ).find(script => {
      try {
        const existingData = JSON.parse(script.textContent || '');
        return existingData['@type'] === type && script.textContent === newContent;
      } catch {
        return false;
      }
    });

    if (existingScript) {
      if (this.options.enableDebug) {
        console.log(`[SchemaManager] ${type} schema 已存在相同内容，跳过重复设置`);
      }
      return;
    }

    // 创建新的schema script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema-type', type);
    script.setAttribute('data-schema-source', source);
    script.setAttribute('data-schema-manager', 'true');
    script.textContent = newContent;

    // 添加到document head
    document.head.appendChild(script);

    // 记录活跃的schema
    const schemaKey = `${type}-${source}`;
    this.activeSchemas.set(schemaKey, newContent);

    // 最终去重检查：确保只有一个该类型的schema
    setTimeout(() => {
      this.deduplicate(type);
    }, 0);

    if (this.options.enableDebug) {
      console.log(`[SchemaManager] 设置 ${type} schema (来源: ${source})`);
    }
  }

  /**
   * 去重指定类型的结构化数据（保留第一个）
   */
  private deduplicate(type: string): void {
    const scripts = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]')
    ).filter(script => {
      try {
        const data = JSON.parse(script.textContent || '');
        return data['@type'] === type;
      } catch {
        return false;
      }
    });

    if (scripts.length > 1) {
      // 保留第一个，移除其余的
      scripts.slice(1).forEach(script => {
        script.remove();
      });

      if (this.options.enableDebug) {
        console.log(`[SchemaManager] 去重 ${type}：移除了 ${scripts.length - 1} 个重复项`);
      }
    }
  }

  /**
   * 移除特定类型的所有结构化数据（增强版去重）
   */
  removeSchemaByType(type: string): void {
    let removedCount = 0;

    // 移除DOM中的scripts（标记的）
    document.querySelectorAll(`script[data-schema-type="${type}"]`).forEach(script => {
      script.remove();
      removedCount++;
    });

    // 移除没有标记但类型匹配的scripts（兜底清理）
    document
      .querySelectorAll('script[type="application/ld+json"]:not([data-schema-manager])')
      .forEach(script => {
        try {
          const data = JSON.parse(script.textContent || '');
          if (data['@type'] === type) {
            script.remove();
            removedCount++;
          }
        } catch {
          // 忽略无效JSON
        }
      });

    // 彻底清理：扫描所有 JSON-LD scripts 找重复
    const seenTypes = new Set<string>();
    document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
      try {
        const data = JSON.parse(script.textContent || '');
        const schemaType = data['@type'];
        if (schemaType === type) {
          if (seenTypes.has(schemaType)) {
            // 发现重复，移除
            script.remove();
            removedCount++;
          } else {
            seenTypes.add(schemaType);
          }
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
      console.log(`[SchemaManager] 移除了 ${removedCount} 个 ${type} schema`);
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
   * 全局去重：移除所有重复的结构化数据
   */
  globalDeduplicate(): void {
    const typeCount: { [key: string]: Element[] } = {};

    // 按类型分组所有JSON-LD scripts
    document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
      try {
        const data = JSON.parse(script.textContent || '');
        const type = data['@type'];
        if (type) {
          if (!typeCount[type]) {
            typeCount[type] = [];
          }
          typeCount[type].push(script);
        }
      } catch {
        // 忽略无效JSON
      }
    });

    let totalRemoved = 0;
    // 每种类型只保留第一个
    Object.entries(typeCount).forEach(([type, scripts]) => {
      if (scripts.length > 1) {
        const toRemove = scripts.slice(1);
        toRemove.forEach(script => script.remove());
        totalRemoved += toRemove.length;

        if (this.options.enableDebug) {
          console.log(`[SchemaManager] 全局去重 ${type}：移除了 ${toRemove.length} 个重复项`);
        }
      }
    });

    if (this.options.enableDebug && totalRemoved > 0) {
      console.log(`[SchemaManager] 全局去重完成：总共移除了 ${totalRemoved} 个重复项`);
    }
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

    // 如果发现重复，自动执行去重
    if (!validation.isValid) {
      console.warn('🚨 发现重复结构化数据，执行自动去重...');
      this.globalDeduplicate();
      console.log('✅ 去重完成，更新后的统计:', this.getStats());
    }

    console.groupEnd();
  }
}

// 创建全局实例
export const globalSchemaManager = new SchemaManager({
  enableDebug: import.meta.env.DEV,
});

// 全局重复监控和自动清理（生产环境也启用）
if (typeof window !== 'undefined') {
  // 开发环境的调试功能
  if (import.meta.env.DEV) {
    (window as any).schemaManager = globalSchemaManager;
    (window as any).fixSchemasDuplicates = () => globalSchemaManager.globalDeduplicate();
  }

  // 定期检查并清理重复（生产环境也运行）
  const startDuplicateMonitoring = () => {
    // 立即执行一次清理
    setTimeout(() => {
      globalSchemaManager.globalDeduplicate();

      // 每5秒检查一次重复（防止动态插入的重复）
      const intervalId = setInterval(() => {
        const validation = globalSchemaManager.validateUniqueness();
        if (!validation.isValid) {
          console.warn('[SchemaManager] 检测到重复结构化数据，自动清理中...');
          globalSchemaManager.globalDeduplicate();
        }
      }, 5000);

      // 页面卸载时清理定时器
      window.addEventListener('beforeunload', () => {
        clearInterval(intervalId);
      });
    }, 1000);
  };

  // 页面加载完成后启动监控
  if (document.readyState === 'complete') {
    startDuplicateMonitoring();
  } else {
    window.addEventListener('load', startDuplicateMonitoring);
  }
}

export default SchemaManager;
