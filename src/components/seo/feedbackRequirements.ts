/**
 * 反馈要求配置接口
 */
export interface FeedbackRequirementConfig {
  iconName: 'Bug' | 'Clock' | 'CheckCircle' | 'Camera' | 'User';
  title: string;
  description: string;
}

/**
 * 反馈信息要求数据配置
 */
export const FEEDBACK_REQUIREMENTS_CONFIG: readonly FeedbackRequirementConfig[] = [
  {
    iconName: 'Bug',
    title: '您当时所在的服务器',
    description: '例如：小游戏服、生存服',
  },
  {
    iconName: 'Clock',
    title: 'Bug发生的具体时间和日期',
    description: '大致即可',
  },
  {
    iconName: 'CheckCircle',
    title: 'Bug的详细描述',
    description: '您做了什么操作？预期结果是什么？实际发生了什么？',
  },
  {
    iconName: 'CheckCircle',
    title: '复现步骤',
    description: '如果可能，请提供如何让Bug再次出现的步骤',
  },
  {
    iconName: 'Camera',
    title: '截图或录屏',
    description: '这对于我们理解问题非常有帮助',
  },
  {
    iconName: 'User',
    title: '您的游戏内ID',
    description: '帮助我们定位相关的游戏记录',
  },
] as const;
