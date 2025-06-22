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
    'Discord',
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
    title: 'Voidix Minecraft服务器 - 中文公益小游戏社区首选',
    description:
      'Voidix中文公益Minecraft服务器，为玩家提供公平、透明、无氪金的联机游戏平台。体验起床战争、空岛战争等丰富的小游戏，加入我们，一起构建开放包容的游戏社区！',
    keywords: {
      primary: [
        'Voidix',
        'Minecraft服务器',
        '中文公益社区',
        '免费小游戏服务器',
        '我的世界联机平台',
        '公益服务器',
        '公平游戏',
        '包容社区',
        '开放服务器',
        '公益服务器推荐',
        '免费公益服务器',
        '公益服列表',
        '如何加入公益服务器',
        '我的世界公益服玩法',
        '我的世界公益服推荐',
        '公益服务器有哪些',
        '我的世界公益服服务器',
      ],
      secondary: [
        'Minecraft小游戏',
        'MC小游戏服务器',
        '我的世界联机',
        '无氪金',
        '互助',
        '透明',
        '责任',
        '社区自治',
        '反作弊',
        '绿色游戏',
        '开放社区',
        '新手友好',
        '技术分享',
        '玩法攻略',
        '社区共建',
        '无障碍',
        '多元包容',
        '公益活动',
        '玩家互助',
        '开放源码',
        '安全合规',
      ],
      longTail: [
        '公益Minecraft服务器',
        '公平的我的世界小游戏',
        '包容开放的MC社区',
        '无氪金MC服务器',
        '公益游戏服务器推荐',
        '最好玩的Minecraft服务器',
        '免费的我的世界小游戏',
        '中文Minecraft服务器推荐',
        'Voidix服务器在线状态查询',
        'MC服务器实时监控',
        'Voidix服务器运行时间查询',
        'MC服务器稳定性监控',
        '服务器历史运行数据',
        '如何报告Minecraft服务器Bug',
        'Voidix客服联系方式',
        'MC新手入门指南',
        'Voidix服务器教程',
        '如何加入Minecraft服务器',
        'MC服务器帮助',
        '游戏规则',
        '连接教程',
        '游戏模式介绍',
        '小游戏规则',
        '中文教程',
        '国服连接方法',
        '服务器性能',
        '游戏延迟',
        '连接状态',
        '国服状态',
        '中文服务器监控',
        '服务器运行时间',
        '可用性统计',
        '服务器健康状态',
        '系统监控',
        '国服监控',
        '中文服务器监控系统',
        '服务器状态页面',
      ],
      gameTerms: ['起床战争', '空岛战争', 'BedWars', 'SkyWars', '跑酷'],
      localTerms: ['国服MC', '中文服务器', '华人游戏社区', 'QQ群'],
    },
    socialTags: {
      qq: '加入官方QQ群获取最新资讯',
      discord: '加入Discord服务器与国际玩家交流',
      email: '发送邮件获取技术支持和合作咨询',
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

  monitor: {
    title: '服务器监控系统 - 运行时间监控 | Voidix',
    description:
      'Voidix服务器监控系统，实时显示过去90天的运行时间统计、服务可用性监控和性能指标。透明的服务质量展示，让玩家了解服务器稳定性和运行状态。',
    keywords: {
      primary: ['服务器监控', '运行时间监控', 'Minecraft服务器监控'],
      secondary: ['服务器可用性', '运行时间统计', '服务器性能监控'],
      longTail: ['Voidix服务器运行时间查询', 'MC服务器稳定性监控', '服务器历史运行数据'],
      gameTerms: ['服务器运行时间', '可用性统计', '服务器健康状态', '系统监控'],
      localTerms: ['国服监控', '中文服务器监控系统', '服务器状态页面'],
    },
    socialTags: {
      qq: '加入QQ群实时了解服务器状态',
      discord: '在Discord获取服务器维护通知',
      email: '发送邮件获取监控数据支持',
    },
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
      discord: 'Discord社区提供英文技术支持',
      email: '发送邮件获取详细帮助',
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
