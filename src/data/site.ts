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
};

export const metadata: Record<string, Meta> = {
  home: { title: site.title, description: site.description },
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

export const privacySections = [
  [
    '我们收集的信息',
    '我们致力于最小化数据收集。我们主要收集以下类型的匿名化信息：\n• 访问日志：匿名的IP地址、浏览器类型、访问时间，用于安全审计和流量分析。\n• 使用数据：通过Google Analytics、Microsoft Clarity和百度统计(Baidu Tongji)收集匿名的页面浏览、点击、停留时间等聚合统计数据，以了解服务使用情况。\n• 技术信息：设备类型、操作系统等匿名技术信息，用于优化兼容性。\n我们不会收集或存储任何可直接识别您个人身份的信息（如姓名、邮箱地址）。',
  ],
  [
    '信息的使用',
    '我们收集的匿名信息主要用于：\n• 提供和维护我们的网站和服务。\n• 分析和理解用户行为，以改善和优化用户体验。\n• 监控我们服务的性能和稳定性，进行技术支持和故障排除。\n• 确保我们的服务安全，防范欺诈和滥用行为。\n• 遵守适用的法律法规要求。',
  ],
  [
    'Cookie及类似技术政策',
    '我们使用Cookie来运营和改善我们的网站。Cookie是存储在您设备上的小文本文件。我们主要使用以下两类Cookie：\n• 必要Cookie：这些Cookie是网站核心功能运行所必需的，例如保持会话状态。您无法禁用这些Cookie。\n• 分析Cookie：这些Cookie（来自Google Analytics、Clarity和百度统计）帮助我们统计访问量和流量来源，以便我们衡量和改进我们网站的性能。如果您不允许使用这些Cookie，我们将不知道您何时访问了我们的网站。\n您可以通过我们网站页脚的Cookie横幅随时管理您的Cookie偏好。',
  ],
  [
    '数据共享与披露',
    '我们不会出售您的任何信息。我们仅在以下情况下与第三方共享匿名的聚合数据：\n• 分析服务提供商：与Google(Google Analytics)、Microsoft(Clarity)和百度(Baidu Tongji)共享匿名的使用数据，以帮助我们分析服务。这些提供商有其自身的隐私政策，并被禁止将数据用于其他目的。\n• 法律要求：在法律法规要求或响应有效的法律程序时，我们可能会披露必要的信息。',
  ],
  [
    '数据保留与您的权利',
    '• 数据保留：我们通过Google Analytics收集的匿名用户和事件数据的保留期限为14个月。其他匿名日志数据的保留时间不超过90天。\n• 您的权利：根据GDPR等隐私法，您拥有多项权利。由于我们不收集您的个人身份信息，这些权利的应用场景有限。但您始终有权：\n  - 撤回同意：您可以随时通过我们网站的Cookie设置工具撤回对分析Cookie的同意。\n  - 投诉：您有权向您所在国家/地区的数据保护机构提出投诉。',
  ],
  [
    '数据安全',
    '我们采取以下安全措施：\n• HTTPS加密传输\n• 定期安全审计\n• 访问控制和权限管理\n• 数据备份和恢复机制\n• 安全监控和威胁检测',
  ],
  [
    '联系我们',
    '如有隐私相关问题，请联系：\n• QQ群：186438621\n• Discord：https://discord.gg/fUMyfhuQ5b\n• 邮箱：support@voidix.net\n我们将在收到请求后的合理时间内回复您的询问。',
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
