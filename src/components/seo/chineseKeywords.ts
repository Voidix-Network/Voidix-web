/**
 * 中文关键词和本土化SEO配置
 * 针对中国用户搜索习惯和游戏术语优化
 */

export interface ChineseKeywords {
  primary: string[]; // 主要关键词
  secondary: string[]; // 次要关键词
  longTail: string[]; // 长尾关键词
  gameTerms: string[]; // 游戏术语
  localTerms: string[]; // 本土化术语
}

export interface PageKeywords {
  title: string;
  description: string;
  keywords: ChineseKeywords;
  socialTags: {
    qq?: string;
    discord?: string;
    email?: string;
  };
}

/**
 * 页面专用关键词配置
 */
export const PAGE_KEYWORDS_CONFIG: Record<string, PageKeywords> = {
  home: {
    title: 'Voidix Minecraft公益服务器 - 最佳我的世界生存与小游戏服务器',
    description:
      'Voidix是一个永久免费的Minecraft公益服务器，我们提供稳定的起床战争、空岛战争等小游戏。低延迟，致力于为玩家打造一个公平、互助、绿色的MC玩家社区。',
    keywords: {
      primary: [
        'Voidix',
        '我的世界服务器',
        'Minecraft服务器',
        'MC服务器',
        '小游戏服务器',
        '生存服务器',
      ],
      secondary: ['公益'],
      longTail: ['我的世界公益服务器推荐', '我的世界小游戏服务器推荐'],
      gameTerms: ['小游戏', '生存'],
      localTerms: ['中国'],
    },
    socialTags: {
      qq: '加入官方QQ群获取最新资讯',
      discord: '加入Discord服务器与国际玩家交流',
      email: '发送邮件获取技术支持和合作咨询',
    },
  },

  status: {
    title: '服务器实时状态 - 在线玩家与延迟监控 | Voidix',
    description:
      '查看Voidix服务器的实时状态。我们提供精确的在线玩家数量、服务器延迟和版本信息。我们的目标是为所有玩家提供一个稳定、流畅的低延迟游戏环境。',
    keywords: {
      primary: ['Voidix', '小游戏服务器监控', '我的世界服务器监控', 'MC服务器监控'],
      secondary: ['我的世界小游戏服务器', '我的世界生存服务器'],
      longTail: [],
      gameTerms: [],
      localTerms: [],
    },
    socialTags: {},
  },

  monitor: {
    title: '服务器运行时间监控 - 可用性显示 | Voidix',
    description:
      'Voidix服务器运行时间与性能监控系统。我们公开展示过去90天的服务可用性、历史运行数据和详细性能指标，让您对服务器的稳定性和健康状态一目了然。',
    keywords: {
      primary: ['Voidix', '小游戏服务器监控', '我的世界服务器监控', 'MC服务器监控'],
      secondary: ['我的世界小游戏服务器', '我的世界生存服务器'],
      longTail: [],
      gameTerms: [],
      localTerms: [],
    },
    socialTags: {
      qq: '加入QQ群实时了解服务器状态',
      discord: '在Discord获取服务器维护通知',
      email: '发送邮件获取监控数据支持',
    },
  },

  faq: {
    title: '常见问题解答 - Voidix问题解答 | Voidix',
    description:
      'Voidix服务器常见问题（FAQ）。为新手玩家提供保姆级教程，涵盖如何免费加入服务器、游戏规则、小游戏玩法介绍、连接方法等，助您快速开始游戏。',
    keywords: {
      primary: ['Voidix', 'Minecraft服务器', '服务器FAQ'],
      secondary: ['我的世界小游戏服务器', '我的世界生存服务器'],
      longTail: ['我的世界如何加入服务器', '我的世界小游戏服务器', '我的世界公益服怎么玩'],
      gameTerms: [],
      localTerms: [],
    },
    socialTags: {
      qq: '遇到问题？加入官方QQ群寻求帮助',
      discord: 'Discord社区提供英文技术支持',
      email: '发送邮件获取详细帮助',
    },
  },

  bugReport: {
    title: 'Bug反馈与建议 - 联系我们 | Voidix',
    description:
      '发现游戏Bug或有任何建议？请通过此页面向Voidix管理团队提交。我们提供QQ群、Discord和邮件等多种联系方式，并承诺会认真对待每一条反馈。',
    keywords: {
      primary: ['Voidix', 'Bug报告', '游戏反馈', '技术支持', '联系我们'],
      secondary: ['我的世界小游戏服务器', '我的世界生存服务器'],
      longTail: ['Voidix客服联系方式'],
      gameTerms: [],
      localTerms: [],
    },
    socialTags: {
      qq: '官方QQ群：实时客服支持',
      discord: 'Discord：国际社区技术支持',
      email: '发送邮件获取技术支持',
    },
  },
};

/**
 * 社交媒体平台配置
 */
export const SOCIAL_MEDIA_CONFIG = {
  qq: {
    name: 'QQ群',
    icon: '🐧',
    description: '加入官方QQ群，与万千玩家一起游戏交流',
    link: 'https://qm.qq.com/cgi-bin/qm/qr?k=aMRoacVuxcGVSzEwfjb49oN4CWCv6yHj&jump_from=webapi&authKey=hw0EhRKGDGN1vmHD4AfK2yJCzPzSA+AXGJOEcugZpsA7KfK9GhNXpe9GNWCjCcmr', // 示例链接
    qrCode: '/images/qq-qr.png',
  },
  discord: {
    name: 'Discord',
    icon: '🎮',
    description: '国际玩家交流平台，语音开黑首选',
    link: 'https://discord.gg/fUMyfhuQ5b',
    inviteText: '加入Discord服务器',
  },
  email: {
    name: '邮箱联系',
    icon: '📧',
    description: '发送邮件获取技术支持和商务合作',
    link: 'mailto:support@voidix.net',
    contactText: '发送邮件联系我们',
  },
};

/**
 * 生成页面关键词字符串
 */
export function generateKeywordsString(pageKey: string): string {
  const config = PAGE_KEYWORDS_CONFIG[pageKey];
  if (!config) return '';

  const { keywords } = config;
  const allKeywords = [
    ...keywords.primary,
    ...keywords.secondary,
    ...keywords.longTail,
    ...keywords.gameTerms,
    ...keywords.localTerms,
  ];

  return allKeywords.join(',');
}

/**
 * 获取页面SEO配置
 */
export function getPageSEOConfig(pageKey: string) {
  return PAGE_KEYWORDS_CONFIG[pageKey] || PAGE_KEYWORDS_CONFIG.home;
}
