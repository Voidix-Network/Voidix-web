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
    title: 'Voidix Minecraft公益服务器 - 免费我的世界生存与小游戏服务器',
    description:
      'Voidix是一个永久免费的Minecraft公益服务器，提供稳定的MC小游戏与生存服务器体验。包含起床战争、空岛战争等热门小游戏，低延迟连接，致力于为玩家打造公平、互助、绿色的MC玩家社区。',
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
      longTail: ['生存服务器推荐', '小游戏服务器推荐', 'MC小游戏服务器'],
      gameTerms: ['生存'],
      localTerms: ['中国'],
    },
    socialTags: {
      qq: '加入官方QQ群获取最新资讯',
      discord: '加入Discord服务器与玩家交流',
      email: '发送邮件获取技术支持和合作咨询',
    },
  },

  status: {
    title: '服务器实时状态 - 在线玩家与延迟监控 | Voidix',
    description:
      '查看Voidix服务器的实时状态监控。我们提供精确的在线玩家数量、服务器延迟和版本信息，支持Java版和基岩版连接。实时监控确保为所有玩家提供稳定、流畅的低延迟游戏环境。',
    keywords: {
      primary: ['Voidix', '小游戏服务器监控', '我的世界服务器监控', 'MC服务器监控'],
      secondary: ['我的世界小游戏服务器', '我的世界生存服务器'],
      longTail: [],
      gameTerms: [],
      localTerms: [],
    },
    socialTags: {},
  },

  faq: {
    title: '常见问题解答 - Voidix问题解答 | Voidix',
    description:
      'Voidix服务器常见问题（FAQ）完整解答。为新手玩家提供保姆级教程，涵盖如何免费加入服务器、游戏规则、小游戏玩法介绍、连接方法等详细指南，助您快速开始游戏体验。',
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

  privacy: {
    title: '隐私政策 | Voidix',
    description:
      'Voidix隐私政策。我们尊重并保护您的隐私，不会收集任何不必要的个人信息。我们承诺只收集必要的数据，并确保数据的安全性和隐私性。',
    keywords: {
      primary: ['Voidix', '隐私政策', '数据保护', '个人信息保护', '隐私保护'],
      secondary: ['我的世界小游戏服务器', '我的世界生存服务器'],
      longTail: [],
      gameTerms: [],
      localTerms: [],
    },
    socialTags: {},
  },

  banHistory: {
    title: '封禁查询 - 玩家处罚记录查询 | Voidix',
    description:
      '查询Voidix服务器的玩家封禁记录。输入玩家ID即可查看处罚历史、封禁原因和解封时间，确保游戏环境公平透明。',
    keywords: {
      primary: ['Voidix', '封禁查询', '处罚记录', '玩家封禁', 'MC封禁查询'],
      secondary: ['我的世界服务器封禁', 'Minecraft封禁记录'],
      longTail: ['查询玩家封禁记录', '服务器处罚查询'],
      gameTerms: [],
      localTerms: [],
    },
    socialTags: {
      qq: '对封禁有疑问？加入QQ群申诉',
      discord: 'Discord提交申诉请求',
      email: '发送邮件进行封禁申诉',
    },
  },

  terms: {
    title: '服务条款 | Voidix',
    description:
      'Voidix服务条款。使用我们的Minecraft服务器服务需要遵守的规则和条款，包括用户行为准则、账户安全、公益性质等内容。',
    keywords: {
      primary: ['Voidix', '服务条款', '用户协议', '使用条款', '游戏规则'],
      secondary: ['我的世界小游戏服务器', '我的世界生存服务器'],
      longTail: ['Minecraft服务器规则', '游戏服务器条款'],
      gameTerms: [],
      localTerms: [],
    },
    socialTags: {
      qq: '加入QQ群了解详细规则',
      discord: 'Discord社区讨论游戏规则',
      email: '发送邮件咨询条款问题',
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
