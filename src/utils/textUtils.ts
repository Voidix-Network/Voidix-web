/**
 * 文本处理工具
 * 用于响应式文本截断
 */

/**
 * 获取当前屏幕尺寸分类
 */
export function getScreenSize(): 'xs' | 'sm' | 'md' | 'lg' | 'xl' {
  if (typeof window === 'undefined') return 'md'; // SSR fallback

  const width = window.innerWidth;
  if (width < 640) return 'xs'; // < 640px
  if (width < 768) return 'sm'; // 640-767px
  if (width < 1024) return 'md'; // 768-1023px
  if (width < 1280) return 'lg'; // 1024-1279px
  return 'xl'; // >= 1280px
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
 * 根据屏幕尺寸截断标题
 */
export function truncateTitleResponsive(text: string): string {
  const screenSize = getScreenSize();

  const limits = {
    xs: 18, // 手机竖屏 - 非常紧凑
    sm: 25, // 手机横屏 - 紧凑
    md: 25, // 平板 - 适中
    lg: 30, // 小桌面 - 较宽松
    xl: 45, // 大桌面 - 宽松
  };

  return truncateByChars(text, limits[screenSize]);
}

/**
 * 根据屏幕尺寸截断描述
 */
export function truncateDescriptionResponsive(text: string): string {
  const screenSize = getScreenSize();

  const limits = {
    xs: 35, // 手机竖屏
    sm: 60, // 手机横屏
    md: 60, // 平板
    lg: 75, // 小桌面 - 较宽松
    xl: 90, // 大桌面 - 宽松
  };

  return truncateByChars(text, limits[screenSize]);
}
