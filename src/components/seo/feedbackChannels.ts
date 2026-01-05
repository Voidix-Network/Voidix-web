/**
 * 反馈渠道配置接口
 */
export interface FeedbackChannelConfig {
  iconName: 'MessageSquare' | 'Globe' | 'Mail' | 'Github';
  name: string;
  description: string;
  link: string;
  color: string;
  isInternal?: boolean; // 是否为内部链接
}

/**
 * 反馈渠道数据配置
 */
export const FEEDBACK_CHANNELS_CONFIG: readonly FeedbackChannelConfig[] = [
  {
    iconName: 'MessageSquare',
    name: 'QQ群',
    description: '186438621 (推荐，可截图和实时交流)',
    link: 'https://qm.qq.com/cgi-bin/qm/qr?k=aMRoacVuxcGVSzEwfjb49oN4CWCv6yHj&jump_from=webapi&authKey=hw0EhRKGDGN1vmHD4AfK2yJCzPzSA+AXGJOEcugZpsA7KfK9GhNXpe9GNWCjCcmr',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    iconName: 'Globe',
    name: 'Discord服务器',
    description: '加入我们的 Discord',
    link: 'https://discord.gg/fUMyfhuQ5b',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    iconName: 'Mail',
    name: '邮件支持',
    description: 'support@voidix.net',
    link: 'mailto:support@voidix.net',
    color: 'from-green-500 to-emerald-500',
  },
  {
    iconName: 'Github',
    name: 'Issue系统',
    description: '在我们的Issue系统中提交Bug',
    link: '/issue',
    color: 'from-gray-500 to-slate-500',
    isInternal: true,
  },
] as const;
