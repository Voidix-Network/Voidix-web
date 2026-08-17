export const site = {
  url: 'https://www.voidix.net',
  name: 'Voidix',
  title: 'Voidix Minecraft公益服务器 - 免费我的世界生存与小游戏服务器',
  description:
    'Voidix是一个永久免费的Minecraft公益服务器，提供稳定的MC小游戏与生存服务器体验。包含起床战争、空岛战争等热门小游戏，低延迟连接，致力于为玩家打造公平、互助、绿色的MC玩家社区。',
  api: 'https://webba.voidix.net:5699',
  websocket: 'wss://api.voidix.net:10203',
};

export type Meta = {
  title: string;
  description: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  publishedTime?: string;
  updatedTime?: string;
};

export const metadata: Record<string, Meta> = {
  home: {
    title: site.title,
    description: site.description,
    publishedTime: '2025-07-01T00:00:00+08:00',
    updatedTime: '2026-08-17T00:00:00+08:00',
  },
  status: {
    title: '服务器实时状态 - 在线玩家与延迟监控 | Voidix',
    description:
      '查看Voidix服务器的实时状态监控。我们提供精确的在线玩家数量、服务器延迟和版本信息，支持Java版和基岩版连接。实时监控确保为所有玩家提供稳定、流畅的低延迟游戏环境。',
  },
  faq: {
    title: '常见问题解答 - Voidix问题解答 | Voidix',
    description:
      'Voidix服务器常见问题（FAQ）完整解答。为新手玩家提供保姆级教程，涵盖如何免费加入服务器、游戏规则、小游戏玩法介绍、连接方法等详细指南，助您快速开始游戏体验。',
    type: 'article',
  },
  bugReport: {
    title: 'Bug反馈与建议 - 联系我们 | Voidix',
    description:
      '发现游戏Bug或有任何建议？请通过此页面向Voidix管理团队提交。我们提供QQ群、Discord和邮件等多种联系方式，并承诺会认真对待每一条反馈。',
  },
  privacy: {
    title: '隐私政策 | Voidix',
    description:
      'Voidix隐私政策。我们尊重并保护您的隐私，不会收集任何不必要的个人信息。我们承诺只收集必要的数据，并确保数据的安全性和隐私性。',
    type: 'article',
  },
  issue: {
    title: 'Issue 系统 | Voidix',
    description: '查看、提交和追踪 Voidix 社区 Issue。',
    noindex: true,
  },
  login: { title: '登录 | Voidix', description: '使用游戏账号登录 Voidix。', noindex: true },
};

export const navigation = [
  { href: '/status/', label: '状态页' },
  { href: '/faq/', label: '常见问题' },
  { href: '/bug-report/', label: 'Bug反馈' },
  { href: '/issue/', label: 'Issue系统' },
];

export const faq = [
  [
    '如何加入Voidix服务器？',
    '请参考我们首页的Java版和基岩版连接指南。通常您只需要在游戏的多人游戏菜单中添加我们的服务器地址即可。',
  ],
  [
    '服务器是免费的吗？有付费项目吗？',
    '是的，Voidix是一个纯公益服务器，完全免费。我们没有任何付费项目或道具，致力于提供一个公平的游戏环境。',
  ],
  [
    '服务器支持哪些Minecraft版本？',
    '我们的小游戏服务器支持26.1-26.1.2(信息更新可能滞后)的Java版，生存服务器则使用最新的Java版，但也支持1.7.2-最新版。同时，通过GeyserMC技术，基岩版玩家也可以连接到我们的服务器，基岩版一般支持最新版，过旧的基岩版可能不会被支持。',
  ],
  [
    '如果我遇到了Bug或者有建议，应该怎么办？',
    '您可以通过我们的Bug反馈页面提交问题，或者在我们的QQ群/Discord社群中向管理员反馈。',
  ],
  [
    '我可以申请成为管理团队的一员吗？',
    '我们欣赏您的这份热情！我们的“开放”理念，意味着我们乐见任何为社群做出卓越贡献、并展现出责任心的成员成为我们的一员。管理团队的加入并非通过简单申请，而是基于您在社群中的长期贡献、专业能力以及与社群理念的契合度。如果您确信自己符合要求，欢迎您通过电子邮件或现管理成员提交一份正式的申请，阐述您的动机、构想和能为社群带来的价值。我们将认真评估每一份用心的申请。',
  ],
] as const;

export const timeline = [
  [
    '2022年7月16日',
    'VBPIXEL成立',
    'VBPIXEL开始运营，在之后的两年里保持稳定运行，积累了110+名入群玩家。但由于初期架构原因，技术债逐渐积累，仅Neko一人已难以处理所有服务器问题。',
  ],
  [
    '2025年5月4日',
    '新服务器的构想',
    'Neko在EternalStar中与cyh2讨论是否需要搭建新服务器的问题，开始规划Voidix的雏形，最终正式确定将Voidix设为服务器名称。',
  ],
  ['2025年5月10日', 'Voidix开始搭建', '基于全新的技术架构，Voidix项目正式启动开发，采用现代化技术栈解决历史遗留问题。'],
  [
    '2025年5月11日',
    '新老交替',
    'Voidix正式替换VBPIXEL，后者完成历史使命。Voidix同时继承了EternalStar和VBPIXEL的核心理念：公益、免费、和谐的游戏环境。',
  ],
  ['2025年5月13日', '官网建设', 'Voidix官网开始搭建，采用现代化设计语言，展示服务器理念和技术特点。'],
  ['2025年7月1日', 'Voidix正式启航', 'Voidix正式启航，开启全新的Minecraft服务器篇章。'],
] as const;

/*
 * Privacy copy mirrors the data actually handled by the site. Keep this list
 * explicit so adding a new analytics or account feature requires updating the
 * policy in the same change.
 */
export const privacySections = [
  [
    '我们收集的信息',
    '我们会根据您使用的功能处理以下信息：\n• 网站访问与技术信息：IP地址、访问时间、浏览器和设备信息、请求日志及错误信息，用于安全、故障排查和服务运行。\n• 分析信息（仅在您同意分析Cookie后）：页面浏览、来源、设备信息、点击和使用情况，可能由Google Analytics、Microsoft Clarity、百度统计和字节跳动相关统计脚本处理。\n• Issue功能信息：登录时提交的用户名和密码、服务器返回的账号标识（如UUID）及登录令牌；您提交的Issue、评论、标签和相关时间信息。登录令牌保存在浏览器本地存储中，用于维持登录状态。\n• 联系信息：您主动通过邮件、QQ群或Discord提供的内容。\n请勿在Issue、评论或联系渠道中提交身份证号、支付信息、密码等不必要的敏感信息。',
  ],
  [
    '信息的使用',
    '我们使用上述信息用于：\n• 提供网站、登录、Issue提交和服务器状态等功能。\n• 维护网站和服务器的安全，识别滥用、攻击和故障。\n• 在您同意后统计访问和使用情况，改进性能、内容和用户体验。\n• 回复反馈、处理Bug和提供技术支持。\n• 履行适用的法律义务或保护用户、服务和运营方的合法权益。',
  ],
  [
    'Cookie及类似技术政策',
    '本网站使用Cookie及浏览器本地存储：\n• 必要技术：用于保存Cookie选择、登录状态和网站基本功能。没有这些数据，部分功能可能无法正常工作。\n• 分析技术（可选）：在您点击同意后，Google Analytics、Microsoft Clarity、百度统计和字节跳动相关脚本可能写入Cookie或读取设备信息，用于访问统计、来源分析、体验分析和页面时间因子。\n• 拒绝或撤回：您可以在Cookie设置中拒绝或撤回分析同意。撤回后我们会停止后续脚本加载，并尝试清除浏览器可访问的相关Cookie；第三方已收集的数据及第三方域名下的Cookie可能无法由本网站直接删除。',
  ],
  [
    '数据共享与第三方服务',
    '为提供功能和统计服务，信息可能传输给以下第三方：\n• 分析服务：Google Analytics、Microsoft Clarity、百度统计和字节跳动相关统计服务。它们会依据各自的隐私政策处理数据；请在其官方网站查看最新条款。\n• 网站和服务器服务：网站托管、网络加速、API/WebSocket、头像或外部链接服务可能接收处理请求中的IP、设备和请求信息。\n• 法律或安全需要：在法律要求、有效法律程序或处理安全事件时，我们可能披露必要信息。\n我们不出售个人信息，也不会将Issue登录令牌主动提供给统计服务。',
  ],
  [
    '数据保留与您的权利',
    '• 保留期限：网站访问日志、Issue数据、账号信息和第三方统计数据的实际保留期限取决于服务器配置、业务需要及相应服务商的设置；我们不会在未核实配置前承诺固定期限。\n• 您可以请求了解、更正或删除我们控制范围内的个人信息，也可以撤回分析Cookie同意。部分信息可能因安全、法律或争议处理需要依法保留。\n• 您可以向所在地的数据保护监管机构投诉。由于不同地区的法律要求不同，具体权利和适用范围以当地法律为准。',
  ],
  [
    '数据安全',
    '我们采取合理的安全措施，包括HTTPS传输、访问控制、权限管理、输入校验和异常监控。互联网传输和电子存储无法保证绝对安全；如发生可能影响您的安全事件，我们会依据适用法律采取通知和补救措施。',
  ],
  [
    '联系我们',
    '如有隐私相关问题、访问或删除请求，请联系：\n• 邮箱：support@voidix.net\n• QQ群：186438621\n• Discord：https://discord.gg/fUMyfhuQ5b\n请在请求中说明您的需求和可用于核验的信息。我们会在合理期限内回复，并可能在处理前进行必要的身份核验。',
  ],
] as const;

export type TeamMember = {
  name: string;
  role: string;
  description: string;
  avatar?: string;
  aka?: readonly string[];
  contributions: readonly string[];
};

export const team: readonly TeamMember[] = [
  {
    name: 'NekoSora',
    role: '核心开发者',
    description: '项目创始人，主导服务器架构设计和核心插件开发',
    avatar: 'neko110923',
    aka: ['Neko*'],
    contributions: [
      '2025-至今: Voidix项目创始人',
      '成立VBPIXEL的服主，在运营两年VBPIXEL后认为VBPIXEL问题过多，于是带上CYsonHab开启了Voidix的旅途',
      '励志于搭建一个环境友好，无需付费，可以和大家欢乐游玩的地方',
      '负责网站后端服务搭建与主要编程开发',
    ],
  },
  {
    name: 'CYAN-HEX',
    role: '核心开发者',
    description: '项目联合创始人，主导插件开发与服务器维护等，也参与部分服务器架构搭建',
    avatar: 'cyh2',
    aka: ['cyh', 'CYsonHab'],
    contributions: ['2025-至今: Voidix联合创始人', '现任EternalStar服主', '负责次要编程开发'],
  },
  {
    name: 'Almost Declaes',
    role: '服务器管理员',
    description: '游戏玩法设计师，擅长构思创新玩法并提出建设性意见',
    avatar: 'Almost_Declaes',
    aka: ['Hao_zi-Rat'],
    contributions: ['2025-至今: 服务器玩法顾问', '提出多个服务器特色玩法方案', '善于发现游戏平衡性问题并提供解决方案'],
  },
  {
    name: 'ASKLL',
    role: '服务器管理员',
    description: '网站设计，负责Voidix官网的视觉设计和用户体验',
    avatar: 'ASKLL',
    contributions: ['2025-至今: 网站设计与开发', '负责Voidix网站功能设计', '提升用户界面友好度和交互体验'],
  },
  {
    name: 'Momoi123',
    role: '测试组成员',
    description: '测试Voidix的各项新功能以确保正确',
    avatar: 'Momoi123',
    aka: ['才羽桃井'],
    contributions: ['2026-至今: 功能与玩法测试', '负责Voidix新功能的测试与反馈', '提升用户界面友好度与确保功能正确'],
  },
  { name: '玩家们', role: '服务器支持者', description: '正因为有了你们游玩，Voidix才会继续走下去', contributions: [] },
] as const;
