import { useInView } from '@/hooks/useInView';
import React, { useCallback, useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean; // 是否为关键图片，不懒加载
  placeholder?: string; // 占位图片
  sizes?: string; // 响应式图片尺寸
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * 优化的图像组件
 * 支持懒加载、WebP格式、响应式图片、渐进式加载
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNjY2Ii8+PC9zdmc+',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(priority ? src : placeholder);

  // 懒加载检测
  const { ref: inViewRef, isInView } = useInView({
    threshold: 0.1,
    rootMargin: '50px', // 提前50px开始加载
  });

  // 合并ref的回调函数
  const setRefs = useCallback(
    (node: HTMLImageElement | null) => {
      // 直接将节点赋值给inViewRef
      if (inViewRef && 'current' in inViewRef) {
        (inViewRef as React.MutableRefObject<HTMLImageElement | null>).current = node;
      }
    },
    [inViewRef]
  );

  // 处理图片加载
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  // 处理图片错误
  const handleError = useCallback(() => {
    setHasError(true);
    setImageSrc(placeholder); // 回退到占位图
    onError?.();
  }, [placeholder, onError]);

  // 当图片进入视口时开始加载
  React.useEffect(() => {
    if (!priority && isInView && imageSrc === placeholder) {
      setImageSrc(src);
    }
  }, [isInView, priority, src, imageSrc, placeholder]);

  /**
   * 检查URL是否属于允许的Voidix域名
   * 使用URL构造函数进行精确的域名解析和验证，防止域名绕过攻击
   */
  const isAllowedVoidixDomain = (url: string): boolean => {
    try {
      const urlObj = new URL(url, window.location.origin);
      const hostname = urlObj.hostname.toLowerCase();

      // 允许的域名白名单
      const allowedDomains = [
        'www.voidix.net',
      ];

      return allowedDomains.includes(hostname);
    } catch (error) {
      // URL 解析失败，视为不安全
      return false;
    }
  };

  /**
   * 获取WebP支持的图片源
   * 安全地验证图片URL，防止域名绕过攻击
   */
  const getOptimizedSrc = (originalSrc: string): string => {
    // 检查是否为相对路径（内部资源）
    if (originalSrc.startsWith('/')) {
      // 尝试WebP格式
      const webpSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      return webpSrc;
    }

    // 检查是否为允许的Voidix域名
    if (isAllowedVoidixDomain(originalSrc)) {
      // 尝试WebP格式
      const webpSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      return webpSrc;
    }

    // 外部域名不进行WebP优化，直接返回原始URL
    return originalSrc;
  };

  // 生成srcSet for 响应式图片
  const generateSrcSet = (src: string): string => {
    if (src === placeholder || hasError) return '';

    const baseSrc = src.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    const ext = src.match(/\.(jpg|jpeg|png|webp)$/i)?.[0] || '.jpg';

    // 生成不同分辨率的图片URL
    return [
      `${baseSrc}-320w${ext} 320w`,
      `${baseSrc}-640w${ext} 640w`,
      `${baseSrc}-1280w${ext} 1280w`,
      `${baseSrc}-1920w${ext} 1920w`,
    ].join(', ');
  };

  const imageProps = {
    ref: setRefs,
    src: getOptimizedSrc(imageSrc),
    alt,
    className: `transition-opacity duration-300 ${
      isLoaded ? 'opacity-100' : 'opacity-0'
    } ${className}`,
    onLoad: handleLoad,
    onError: handleError,
    loading: priority ? ('eager' as const) : ('lazy' as const),
    decoding: 'async' as const,
    ...(width && { width }),
    ...(height && { height }),
    ...(sizes && { sizes }),
    ...(imageSrc !== placeholder &&
      !hasError && {
        srcSet: generateSrcSet(imageSrc),
      }),
  };

  return (
    <div className="relative overflow-hidden">
      {/* 占位符背景 */}
      {!isLoaded && (
        <div
          className={`absolute inset-0 bg-gray-300 animate-pulse ${className}`}
          style={{
            aspectRatio: width && height ? `${width}/${height}` : 'auto',
          }}
        />
      )}

      {/* 实际图片 */}
      <img {...imageProps} />

      {/* 加载失败提示 */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
          图片加载失败
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
