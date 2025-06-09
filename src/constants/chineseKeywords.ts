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
    wechat?: string;
    bilibili?: string;
  };
}

/**
 * Minecraft中文关键词词库
 */
export const MINECRAFT_CHINESE_KEYWORDS = {
  // 核心游戏术语
  coreTerms: [
    'Minecraft',
    'MC',
    '我的世界',
    '我世',
    'Mine',
    '麦块',
    '沙盒游戏',
    '像素游戏',
    '方块游戏',
    '建造游戏',
  ],

  // 服务器相关
  serverTerms: [
    '服务器',
    '服务端',
    '联机',
    '多人游戏',
    '在线游戏',
    'Java版服务器',
    '基岩版服务器',
    '跨平台服务器',
    '国服',
    '中文服务器',
    '中国服务器',
    '亚洲服务器',
  ],

  // 游戏模式
  gameModes: [
    '小游戏',
    '迷你游戏',
    'PVP',
    'PVE',
    '生存模式',
    '创造模式',
    '冒险模式',
    '观察者模式',
    '极限模式',
    '和平模式',
    '休闲游戏',
    '竞技游戏',
    '团队游戏',
  ],

  // 热门小游戏
  miniGames: [
    '起床战争',
    'BedWars',
    '空岛战争',
    'SkyWars',
    '饥饿游戏',
    '躲猫猫',
    '密室逃脱',
    '跑酷',
    'Parkour',
    '建筑比赛',
    '红石竞技',
    '塔防游戏',
    '射击游戏',
    'FPS',
  ],

  // 技术特性
  techFeatures: [
    '免费',
    '无需注册',
    '即玩即走',
    '跨版本兼容',
    '低延迟',
    '高性能',
    '稳定运行',
    '24小时在线',
    '中文客服',
    '防作弊',
    '公平游戏',
    '绿色游戏',
  ],

  // 社区相关
  communityTerms: [
    '玩家社区',
    'MC玩家',
    '建筑师',
    '红石工程师',
    '探险家',
    'QQ群',
    '微信群',
    '论坛',
    '攻略',
    '教程',
    '直播',
    '录播',
  ],
};

/**
 * 页面专用关键词配置
 */
export const PAGE_KEYWORDS_CONFIG: Record<string, PageKeywords> = {
  home: {
    title: 'Voidix - 最受欢迎的免费Minecraft小游戏服务器',
    description:
      'Voidix是国内领先的免费Minecraft小游戏服务器，提供起床战争、空岛战争、跑酷等热门小游戏。支持Java版和基岩版跨平台游戏，拥有活跃的中文玩家社区。立即加入，体验最好玩的我的世界多人游戏！',
    keywords: {
      primary: ['Voidix', 'Minecraft服务器', '免费MC服务器', '我的世界服务器'],
      secondary: ['Minecraft小游戏', 'MC小游戏服务器', '我的世界联机', '免费游戏服务器'],
      longTail: ['最好玩的Minecraft服务器', '免费的我的世界小游戏', '中文Minecraft服务器推荐'],
      gameTerms: ['起床战争', '空岛战争', 'BedWars', 'SkyWars', '跑酷'],
      localTerms: ['国服MC', '中文服务器', '华人游戏社区', 'QQ群'],
    },
    socialTags: {
      qq: '加入官方QQ群获取最新资讯',
      wechat: '关注微信公众号了解游戏攻略',
    },
  },

  status: {
    title: '服务器实时状态 - 在线监控 | Voidix',
    description:
      'Voidix服务器实时状态监控，查看当前在线玩家数、服务器延迟、运行状态等信息。我们保证99.9%的在线率，为玩家提供稳定可靠的游戏体验。',
    keywords: {
      primary: ['服务器状态', '在线监控', 'Minecraft服务器状态'],
      secondary: ['服务器延迟', '在线玩家数', '服务器稳定性'],
      longTail: ['Voidix服务器在线状态查询', 'MC服务器实时监控'],
      gameTerms: ['服务器性能', '游戏延迟', '连接状态'],
      localTerms: ['国服状态', '中文服务器监控'],
    },
    socialTags: {},
  },

  faq: {
    title: '常见问题解答 - 新手必看指南 | Voidix',
    description:
      'Voidix Minecraft服务器常见问题解答，包括如何加入服务器、游戏规则、技术支持、账号问题等详细指南。新手玩家必看，快速上手Minecraft多人游戏。',
    keywords: {
      primary: ['Minecraft常见问题', '服务器FAQ', '游戏指南'],
      secondary: ['新手教程', 'MC服务器帮助', '游戏规则'],
      longTail: ['如何加入Minecraft服务器', 'MC新手入门指南', 'Voidix服务器教程'],
      gameTerms: ['连接教程', '游戏模式介绍', '小游戏规则'],
      localTerms: ['中文教程', '国服连接方法'],
    },
    socialTags: {
      qq: '遇到问题？加入官方QQ群寻求帮助',
    },
  },

  bugReport: {
    title: 'Bug反馈与建议 - 联系我们 | Voidix',
    description:
      '向Voidix团队报告游戏Bug、提出建议或寻求技术支持。我们提供QQ群、Discord、邮件等多种联系方式，承诺24小时内响应玩家反馈。',
    keywords: {
      primary: ['Bug报告', '游戏反馈', '技术支持'],
      secondary: ['问题反馈', '建议提交', '客服联系'],
      longTail: ['如何报告Minecraft服务器Bug', 'Voidix客服联系方式'],
      gameTerms: ['游戏Bug', '服务器问题', '连接故障'],
      localTerms: ['中文客服', '国内技术支持'],
    },
    socialTags: {
      qq: '官方QQ群：实时客服支持',
      wechat: '微信客服：一对一问题解决',
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
    link: 'https://jq.qq.com/?_wv=1027&k=voidix', // 示例链接
    qrCode: '/images/qq-qr.png',
  },
  wechat: {
    name: '微信公众号',
    icon: '💬',
    description: '关注微信公众号，获取最新游戏资讯和攻略',
    link: '#',
    qrCode: '/images/wechat-qr.png',
  },
  bilibili: {
    name: 'B站',
    icon: '📺',
    description: '观看游戏视频，学习高级建筑和红石技巧',
    link: 'https://space.bilibili.com/voidix', // 示例链接
    followText: '关注我们的B站账号',
  },
  discord: {
    name: 'Discord',
    icon: '🎮',
    description: '国际玩家交流平台，语音开黑首选',
    link: 'https://discord.gg/voidix', // 示例链接
    inviteText: '加入Discord服务器',
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
