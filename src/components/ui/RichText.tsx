import type { RichTextSegment } from '@/types';
import React from 'react';

interface RichTextProps {
  segments?: RichTextSegment[];
  fallbackText?: string;
  className?: string;
}

/**
 * Minecraft颜色映射
 * 将Minecraft颜色代码转换为CSS颜色
 */
const MINECRAFT_COLORS: Record<string, string> = {
  // 基础颜色
  '0': '#000000', // 黑色
  '1': '#0000AA', // 深蓝色
  '2': '#00AA00', // 深绿色
  '3': '#00AAAA', // 深青色
  '4': '#AA0000', // 深红色
  '5': '#AA00AA', // 深紫色
  '6': '#FFAA00', // 金色
  '7': '#AAAAAA', // 灰色
  '8': '#555555', // 深灰色
  '9': '#5555FF', // 蓝色
  a: '#55FF55', // 绿色
  b: '#55FFFF', // 青色
  c: '#FF5555', // 红色
  d: '#FF55FF', // 紫色
  e: '#FFFF55', // 黄色
  f: '#FFFFFF', // 白色

  // 颜色名称映射
  black: '#000000',
  dark_blue: '#0000AA',
  dark_green: '#00AA00',
  dark_aqua: '#00AAAA',
  dark_red: '#AA0000',
  dark_purple: '#AA00AA',
  gold: '#FFAA00',
  gray: '#AAAAAA',
  dark_gray: '#555555',
  blue: '#5555FF',
  green: '#55FF55',
  aqua: '#55FFFF',
  red: '#FF5555',
  light_purple: '#FF55FF',
  yellow: '#FFFF55',
  white: '#FFFFFF',
};

/**
 * 富文本渲染组件
 * 支持Minecraft样式的富文本渲染
 */
export const RichText: React.FC<RichTextProps> = ({ segments, fallbackText, className = '' }) => {
  // 如果没有富文本数据，使用fallback文本
  if (!segments || segments.length === 0) {
    return <span className={className}>{fallbackText || ''}</span>;
  }

  // 将颜色转换为CSS颜色值
  const getColor = (color?: string): string | undefined => {
    if (!color) return undefined;

    // 直接CSS颜色值（如#FF5722）
    if (color.startsWith('#')) {
      return color;
    }

    // Minecraft颜色代码或名称
    const normalizedColor = color.toLowerCase().replace(/[&§]/g, '');
    return MINECRAFT_COLORS[normalizedColor] || color;
  };

  // 构建样式对象
  const getStyle = (segment: RichTextSegment): React.CSSProperties => {
    const style: React.CSSProperties = {};

    const color = getColor(segment.color);
    if (color) {
      style.color = color;
    }

    if (segment.bold) {
      style.fontWeight = 'bold';
    }

    if (segment.italic) {
      style.fontStyle = 'italic';
    }

    if (segment.underlined) {
      style.textDecoration = 'underline';
    }

    if (segment.strikethrough) {
      style.textDecoration = style.textDecoration
        ? `${style.textDecoration} line-through`
        : 'line-through';
    }

    return style;
  };

  return (
    <span className={className}>
      {segments.map((segment, index) => (
        <span key={index} style={getStyle(segment)}>
          {segment.text}
        </span>
      ))}
    </span>
  );
};

/**
 * 传统Minecraft颜色代码解析器
 * 用于解析 &a、§a 等格式的文本
 */
export const parseMinecraftText = (text: string): RichTextSegment[] => {
  const segments: RichTextSegment[] = [];
  const regex = /[&§]([0-9a-fklmnor])/gi;

  let lastIndex = 0;
  let currentColor = '';
  let currentBold = false;
  let currentItalic = false;
  let currentUnderlined = false;
  let currentStrikethrough = false;

  let match;
  while ((match = regex.exec(text)) !== null) {
    // 添加当前段落
    if (match.index > lastIndex) {
      const segmentText = text.substring(lastIndex, match.index);
      if (segmentText) {
        segments.push({
          text: segmentText,
          color: currentColor || undefined,
          bold: currentBold || undefined,
          italic: currentItalic || undefined,
          underlined: currentUnderlined || undefined,
          strikethrough: currentStrikethrough || undefined,
        });
      }
    }

    // 处理格式化代码
    const code = match[1].toLowerCase();
    if (MINECRAFT_COLORS[code]) {
      currentColor = code;
      // 颜色代码会重置所有格式
      currentBold = false;
      currentItalic = false;
      currentUnderlined = false;
      currentStrikethrough = false;
    } else {
      switch (code) {
        case 'l':
          currentBold = true;
          break;
        case 'o':
          currentItalic = true;
          break;
        case 'n':
          currentUnderlined = true;
          break;
        case 'm':
          currentStrikethrough = true;
          break;
        case 'r':
          // 重置所有格式
          currentColor = '';
          currentBold = false;
          currentItalic = false;
          currentUnderlined = false;
          currentStrikethrough = false;
          break;
      }
    }

    lastIndex = regex.lastIndex;
  }

  // 添加剩余文本
  if (lastIndex < text.length) {
    const segmentText = text.substring(lastIndex);
    if (segmentText) {
      segments.push({
        text: segmentText,
        color: currentColor || undefined,
        bold: currentBold || undefined,
        italic: currentItalic || undefined,
        underlined: currentUnderlined || undefined,
        strikethrough: currentStrikethrough || undefined,
      });
    }
  }

  return segments;
};

/**
 * 智能文本渲染组件
 * 自动选择富文本或传统文本渲染
 */
export const SmartText: React.FC<{
  richText?: RichTextSegment[];
  plainText?: string;
  className?: string;
}> = ({ richText, plainText, className }) => {
  // 优先使用富文本
  if (richText && richText.length > 0) {
    return <RichText segments={richText} className={className} />;
  }

  // 其次尝试解析传统Minecraft格式
  if (plainText && (plainText.includes('&') || plainText.includes('§'))) {
    const parsedSegments = parseMinecraftText(plainText);
    return <RichText segments={parsedSegments} className={className} />;
  }

  // 最后使用纯文本
  return <span className={className}>{plainText || ''}</span>;
};
