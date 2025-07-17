import type {
  ServerConfig,
  StatusClasses,
  StatusTexts,
  TimeConstants,
  WebSocketConfig,
} from '@/types';

// 导出服务器分组配置
export * from './serverGroups';

// WebSocket配置常量
export const WEBSOCKET_CONFIG: WebSocketConfig = {
  url: 'wss://server.voidix.top:10203',
  maxReconnectAttempts: 5,
  reconnectIntervals: [1000, 2000, 5000, 10000, 30000],
  disableReconnect: false,
  // 协议版本 - 必须与后端匹配
  SUPPORTED_PROTOCOL_VERSION: 2,
  connectionTimeout: 5000, // 5秒连接超时
};

// 时间常量
export const TIME_CONSTANTS: TimeConstants = {
  SECONDS_IN_MINUTE: 60,
  SECONDS_IN_HOUR: 3600,
  SECONDS_IN_DAY: 24 * 3600,
  SECONDS_IN_YEAR: 365 * 24 * 3600,
};

// 小游戏服务器键值
export const MINIGAME_KEYS = [
  'bedwars',
  'bedwars_solo',
  'bedwars_other',
  'knockioffa',
  'buildbattle',
  'thepit',
];

// 服务器显示名称
export const SERVER_DISPLAY_NAMES = {
  minigames_aggregate: '小游戏服务器 (总览)',
  bedwars_sub_aggregate: '起床战争 (总览)',
  bedwars: '起床大厅 (bedwars)',
  bedwars_solo: '起床战争 (单人)',
  bedwars_other: '起床战争 (其他)',
  survival: '生存服务器',
  login: '登录服务器',
  thepit: '天坑乱斗 (thepit)',
  knockioffa: '击退战场 (knockioffa)',
  buildbattle: '建筑大师 (buildbattle)',
} as const;

// 状态文本常量
export const STATUS_TEXTS: StatusTexts = {
  loading: '获取中...',
  online: '在线',
  offline: '离线',
  disconnected: '连接已断开',
  unknown: '状态未知',
  partialUnknown: '部分状态未知',
  lessThanAMinute: '<1分',
  errorConnecting: '连接错误',
  maintenance: '维护中',
  maintenanceStartTimePrefix: '维护开始于: ',
  connectionFailedPermanently: '连接失败',
  reconnecting: '重连中...',
  playerDataLoading: '玩家数据加载中...',
  noPlayersOnline: '该服务器当前没有玩家在线。',
  unknownTime: '未知时间',
  invalidTimestamp: '无效的时间戳',
  timeFormatError: '时间格式错误',
};

// CSS类名常量
export const STATUS_CLASSES: StatusClasses = {
  indexPage: {
    dotBase: 'w-4 h-4 flex-shrink-0 rounded-full',
    colorGreen: 'bg-green-500',
    colorYellow: 'bg-yellow-500',
    colorRed: 'bg-red-500',
    animatePulse: 'animate-pulse',
  },
  statusPage: {
    dotOnline: 'w-3 h-3 rounded-full bg-green-500 flex-shrink-0 mr-2',
    dotOffline: 'w-3 h-3 rounded-full bg-red-500 flex-shrink-0 mr-2',
    dotMaintenance: 'w-3 h-3 rounded-full bg-yellow-500 flex-shrink-0 mr-2',
  },
  textGreen: 'text-green-400',
  textYellow: 'text-yellow-400',
  textRed: 'text-red-400',
  textMonoGreen: 'font-mono text-green-400',
  textMonoRed: 'font-mono text-red-400',
  textMonoYellow: 'font-mono text-yellow-400',
};

// 服务器配置
export const SERVER_CONFIG: ServerConfig = {
  minigames_aggregate: {
    keys: MINIGAME_KEYS,
    isAggregate: true,
  },
  bedwars_sub_aggregate: {
    keys: ['bedwars', 'bedwars_solo', 'bedwars_other'],
    isAggregate: true,
  },
  bedwars: {
    statusPageElements: {
      statusEl: 'bedwars-status',
      dotEl: 'bedwars-dot',
      displayNameEl: 'bedwars-display-name',
    },
    keys: ['bedwars'],
  },
  bedwars_solo: {
    statusPageElements: {
      statusEl: 'bedwars_solo-status',
      dotEl: 'bedwars_solo-dot',
      displayNameEl: 'bedwars_solo-display-name',
    },
    keys: ['bedwars_solo'],
  },
  bedwars_other: {
    statusPageElements: {
      statusEl: 'bedwars_other-status',
      dotEl: 'bedwars_other-dot',
      displayNameEl: 'bedwars_other-display-name',
    },
    keys: ['bedwars_other'],
  },
  survival: {
    statusPageElements: {
      statusEl: 'survival-live-status',
      dotEl: 'survival-dot',
      displayNameEl: 'survival-display-name',
    },
    indexPageElements: {
      badge: 'survival-status-badge-desktop',
      dot: 'survival-status-dot-desktop',
    },
    keys: ['survival'],
  },
  lobby1: {
    statusPageElements: {
      statusEl: 'lobby-live-status',
      dotEl: 'lobby-dot',
      displayNameEl: 'lobby-display-name',
    },
    indexPageElements: {
      badge: 'lobby-status-badge-desktop',
      dot: 'lobby-status-dot-desktop',
    },
    keys: ['lobby1'],
  },
  knockioffa: {
    statusPageElements: {
      statusEl: 'knockioffa-live-status',
      dotEl: 'knockioffa-dot',
      displayNameEl: 'knockioffa-display-name',
    },
    keys: ['knockioffa'],
  },
  buildbattle: {
    statusPageElements: {
      statusEl: 'buildbattle-live-status',
      dotEl: 'buildbattle-dot',
      displayNameEl: 'buildbattle-display-name',
    },
    keys: ['buildbattle'],
  },
  thepit: {
    statusPageElements: {
      statusEl: 'thepit-live-status',
      dotEl: 'thepit-dot',
      displayNameEl: 'thepit-display-name',
    },
    keys: ['thepit'],
  },
};

// Logo资源配置
export const LOGO_ASSETS = {
  PWA_ICON: '/android-chrome-512x512.png', // 仅PWA清单使用
  BRAND_LOGO: '/logo.png', // 品牌展示和Logo组件
  SEO_IMAGE: '/logo.png', // SEO和社交媒体分享
} as const;
