import React, { useState } from 'react';

interface MinecraftAvatarProps {
  username: string;
  size?: number;
  fallbackText?: string;
  className?: string;
}

/**
 * Minecraft玩家头像组件
 * 支持多种MC头像API服务，自动回退机制
 */
export const MinecraftAvatar: React.FC<MinecraftAvatarProps> = ({
  username,
  size = 64,
  fallbackText,
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // MC头像API列表，通过CDN代理提高速度和可靠性
  const avatarApis = [
    `https://https://minotar.net/helm/${username}/${size}`,
    `https://https://crafatar.com/avatars/${username}?size=${size}&overlay=true`,
    `https://mc-heads.net/avatar/avatar/${username}/${size}`,
  ];

  const [currentApiIndex, setCurrentApiIndex] = useState(0);

  const handleImageError = () => {
    if (currentApiIndex < avatarApis.length - 1) {
      // 尝试下一个API
      setCurrentApiIndex(currentApiIndex + 1);
    } else {
      // 所有API都失败，显示回退内容
      setHasError(true);
    }
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  // 回退显示文本（通常是缩写）
  const displayFallback = fallbackText || username.charAt(0).toUpperCase();

  if (hasError) {
    return (
      <div
        className={`bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center text-white font-bold ${className}`}
        style={{ width: size, height: size }}
      >
        <span style={{ fontSize: size * 0.4 }}>{displayFallback}</span>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{ width: size, height: size }}
    >
      {/* 加载占位符 */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-700 animate-pulse flex items-center justify-center text-white font-bold">
          <span style={{ fontSize: size * 0.4 }}>{displayFallback}</span>
        </div>
      )}

      {/* MC头像图片 */}
      <img
        src={avatarApis[currentApiIndex]}
        alt={`${username}的Minecraft头像`}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          imageRendering: 'pixelated', // 保持MC像素风格
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))', // 添加阴影效果
        }}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
    </div>
  );
};

export default MinecraftAvatar;
