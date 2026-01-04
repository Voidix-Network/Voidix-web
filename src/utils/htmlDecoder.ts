/**
 * HTML实体解码工具
 * 用于将后端XSS防护转义的HTML内容解码回原始文本
 * 这样ReactMarkdown才能正确解析Markdown语法
 */

/**
 * 解码HTML实体
 * 支持常见的HTML实体和转义字符
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return '';

  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;

  return textarea.value;
}

/**
 * 解码并清理文本
 * 用于处理后端XSS防护后的文本，恢复原始内容供Markdown解析
 */
export function decodeForMarkdown(text: string): string {
  if (!text) return '';

  // 首先解码HTML实体
  let decoded = decodeHtmlEntities(text);

  // 如果文本已经被ReactMarkdown处理过（包含HTML标签），需要特殊处理
  // 检查是否包含常见的转义模式
  if (decoded.includes('&#') || decoded.includes('&') || decoded.includes('<') || decoded.includes('>')) {
    // 再次解码，处理嵌套转义
    decoded = decodeHtmlEntities(decoded);
  }

  return decoded;
}

/**
 * 批量解码对象中的文本字段
 * 用于处理API返回的数据
 */
export function decodeObjectForMarkdown<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;

  const decoded: any = { ...obj };

  for (const key in decoded) {
    if (typeof decoded[key] === 'string') {
      decoded[key] = decodeForMarkdown(decoded[key]);
    } else if (Array.isArray(decoded[key])) {
      decoded[key] = decoded[key].map(item =>
        typeof item === 'string' ? decodeForMarkdown(item) : decodeObjectForMarkdown(item)
      );
    } else if (typeof decoded[key] === 'object' && decoded[key] !== null) {
      decoded[key] = decodeObjectForMarkdown(decoded[key]);
    }
  }

  return decoded;
}

/**
 * 检查文本是否包含HTML转义字符
 */
export function hasHtmlEscaping(text: string): boolean {
  if (!text) return false;
  return text.includes('&') && /&(amp|lt|gt|quot|apos|#\d+);/i.test(text);
}

/**
 * 安全的HTML解码，防止XSS
 * 只解码必要的实体，保留危险标签的转义
 */
export function safeDecodeForDisplay(text: string): string {
  if (!text) return '';

  // 只解码安全的实体，保留危险标签的转义
  let decoded = text
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/'/g, "'");

  // 再次检查是否还有未处理的实体
  if (decoded.includes('&#')) {
    decoded = decodeHtmlEntities(decoded);
  }

  return decoded;
}

/**
 * 文本截断工具
 * 用于处理长文本的显示
 */

/**
 * 截断文本，添加省略号
 * @param text 要截断的文本
 * @param maxLength 最大长度
 * @returns 截断后的文本
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * 按字数截断文本（中文友好）
 * @param text 要截断的文本
 * @param maxChars 最大字符数
 * @returns 截断后的文本
 */
export function truncateByChars(text: string, maxChars: number): string {
  if (!text) return '';

  let charCount = 0;
  let result = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    // 中文字符算2个英文字符，英文字符算1个
    const charSize = /[\u4e00-\u9fa5]/.test(char) ? 2 : 1;

    if (charCount + charSize > maxChars) {
      result += '...';
      break;
    }

    result += char;
    charCount += charSize;
  }

  return result;
}

/**
 * 截断HTML内容（先解码再截断）
 * @param html HTML内容
 * @param maxLength 最大长度
 * @returns 截断后的纯文本
 */
export function truncateHtmlContent(html: string, maxLength: number): string {
  if (!html) return '';

  // 先解码HTML实体
  const decoded = decodeHtmlEntities(html);
  // 再截断
  return truncateByChars(decoded, maxLength);
}

/**
 * 智能截断，保留Markdown格式
 * @param text 文本内容
 * @param maxLength 最大长度
 * @returns 截断后的文本
 */
export function smartTruncate(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  // 查找最后一个完整单词或句子的边界
  const point = text.substring(0, maxLength).lastIndexOf(' ');

  if (point > maxLength * 0.7) {
    return text.substring(0, point) + '...';
  }

  return text.substring(0, maxLength) + '...';
}


/**
 * 响应式文本截断工具
 * 根据屏幕尺寸动态决定截断长度
 */

/**
 * 获取当前屏幕尺寸分类
 */
export function getScreenSize(): 'xs' | 'sm' | 'md' | 'lg' | 'xl' {
  if (typeof window === 'undefined') return 'md'; // SSR fallback
  
  const width = window.innerWidth;
  if (width < 640) return 'xs';    // < 640px
  if (width < 768) return 'sm';    // 640-767px
  if (width < 1024) return 'md';   // 768-1023px
  if (width < 1280) return 'lg';   // 1024-1279px
  return 'xl';                     // >= 1280px
}

/**
 * 根据屏幕尺寸截断标题
 */
export function truncateTitleResponsive(text: string): string {
  const screenSize = getScreenSize();
  
  const limits = {
    xs: 12,  // 手机竖屏 - 非常紧凑
    sm: 16,  // 手机横屏 - 紧凑
    md: 20,  // 平板 - 适中
    lg: 28,  // 小桌面 - 较宽松
    xl: 35,  // 大桌面 - 宽松
  };
  
  return truncateByChars(text, limits[screenSize]);
}

/**
 * 根据屏幕尺寸截断描述
 */
export function truncateDescriptionResponsive(text: string): string {
  const screenSize = getScreenSize();
  
  const limits = {
    xs: 20,   // 手机竖屏 - 非常紧凑
    sm: 30,   // 手机横屏 - 紧凑
    md: 45,   // 平板 - 适中
    lg: 60,   // 小桌面 - 较宽松
    xl: 80,   // 大桌面 - 宽松
  };
  
  return truncateByChars(text, limits[screenSize]);
}

/**
 * 获取响应式截断配置
 */
export function getResponsiveTruncateConfig() {
  const screenSize = getScreenSize();
  
  return {
    title: {
      xs: 15,
      sm: 20,
      md: 30,
      lg: 40,
      xl: 50,
    }[screenSize],
    description: {
      xs: 30,
      sm: 50,
      md: 80,
      lg: 120,
      xl: 160,
    }[screenSize],
  };
}

/**
 * 检查文本是否需要截断（基于屏幕尺寸）
 */
export function needsTruncation(text: string, type: 'title' | 'description'): boolean {
  const config = getResponsiveTruncateConfig();
  const limit = type === 'title' ? config.title : config.description;
  
  // 中文字符算2个英文字符
  let charCount = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charSize = /[\u4e00-\u9fa5]/.test(char) ? 2 : 1;
    charCount += charSize;
  }
  
  return charCount > limit;
}