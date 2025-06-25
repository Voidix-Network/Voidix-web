<div align="center">
  <a href="https://github.com/Voidix-Network/voidix-web">
    <img src="images/logo.png" alt="Logo" width="120" height="120">
  </a>
  <h1>Voidix Web</h1>
  <div align="center">
<!-- 项目法律信息 -->
<a href="../LICENSE_CODE"><img src="https://img.shields.io/badge/Code-AGPL_3.0-orange" alt="Code License" /></a>
<a href="../LICENSE_CONTENT"><img src="https://img.shields.io/badge/Content-CC_BY_SA_4.0-orange" alt="Content License" /></a>
<br />
<!-- 开发质量指标 -->
<a href="https://github.com/Voidix-Network/voidix-web/actions/workflows/check.yml"><img src="https://github.com/Voidix-Network/voidix-web/actions/workflows/check.yml/badge.svg" alt="Build Status" /></a>
<a href="https://github.com/Voidix-Network/voidix-web/actions/workflows/CodeQL.yml"><img src="https://github.com/Voidix-Network/voidix-web/actions/workflows/CodeQL.yml/badge.svg" alt="Security" /></a>
<a href="https://codecov.io/gh/voidix-network/voidix-web"><img src="https://codecov.io/gh/voidix-network/voidix-web/branch/master/graph/badge.svg?token=1UK18ZSXU5" alt="Coverage" /></a>
<br />
<!-- 社区参与指标 -->
<a href="https://github.com/Voidix-Network/voidix-web/issues"><img src="https://img.shields.io/github/issues/Voidix-Network/voidix-web" alt="Issues" /></a>
<a href="https://github.com/Voidix-Network/voidix-web/pulls"><img src="https://img.shields.io/github/issues-pr/Voidix-Network/voidix-web" alt="Pull Requests" /></a>
<a href="https://github.com/Voidix-Network/voidix-web/stargazers"><img src="https://img.shields.io/github/stars/Voidix-Network/voidix-web?style=social" alt="Stars" /></a>
</div>
<br />
  <p align="center">
    Voidix 官方网站源码仓库
    <br />
    <a href="https://www.voidix.net">生产效果</a>
    &middot;
    <a href="https://github.com/Voidix-Network/voidix-web/issues/new?template=bug_report.md">报告错误</a>
    &middot;
    <a href="https://github.com/Voidix-Network/voidix-web/issues/new?template=feature_request.md">请求功能</a>
  </p>
</div>

<details>
  <summary>目录</summary>
  <ol>
    <li><a href="#关于项目">关于项目</a></li>
    <li><a href="#技术架构">技术架构</a></li>
    <li><a href="#功能特性">功能特性</a></li>
    <li><a href="#快速开始">快速开始</a></li>
    <li><a href="#开发指南">开发指南</a></li>
    <li><a href="#项目结构">项目结构</a></li>
    <li><a href="#脚本命令">脚本命令</a></li>
    <li><a href="#部署文档">部署文档</a></li>
    <li><a href="#贡献指南">贡献指南</a></li>
    <li><a href="#许可证">许可证</a></li>
  </ol>
</details>

## 关于项目

Voidix Web 是 **Voidix
Minecraft 服务器**的官方网站源码仓库。本项目致力于为 Minecraft 玩家提供优质的服务器信息展示和社区交流平台。

### ✨ 项目亮点

- 🎮 **状态监控** - 实时监控服务器状态，完整展示服务器信息
- ⚡ **新技术栈** - React 18 + TypeScript + Vite，享受最新的开发体验
- 🎨 **精美视觉** - Tailwind CSS + Framer Motion，流畅的动画效果
- 📱 **响应自适** - 完美适配桌面端和移动端，随时随地访问
- 🔍 **SEO 优化** - 静态预渲染 + 完整的 SEO 配置，搜索引擎友好
- 🗜️ **智能压缩** - 多格式压缩 (zstd/brotli/gzip) + 智能回退，85-98% 带宽节省
- 🛠️ **工程完善** - 代码覆盖率、CI/CD、模块化架构
- ⚡ **极致性能** - PWA、预渲染、代码分割、自动压缩

## 技术架构

### 核心技术栈

| 技术                      | 版本     | 用途     |
| ------------------------- | -------- | -------- |
| **React**                 | 18.2.0   | 前端框架 |
| **TypeScript**            | 5.2.2    | 类型安全 |
| **Vite**                  | 6.3.5    | 构建工具 |
| **Tailwind CSS**          | 3.3.6    | 样式框架 |
| **Framer Motion**         | 10.16.16 | 动画特效 |
| **Zustand**               | 4.4.7    | 状态管理 |
| **React Router**          | 7.6.2    | 路由管理 |
| **Vitest**                | 3.2.3    | 测试框架 |
| **React Testing Library** | 16.3.0   | 组件测试 |
| **vite-plugin-compression** | 0.5.1  | 构建压缩 |
| **Node.js zlib**          | 内置     | 压缩算法 |

### 架构特点

- 🏗️ **模块化设计** - 结构清晰，组件复用
- 🔒 **类型安全性** - 全面 TypeScript 支持
- 🧪 **测试完善性** - 单元集成全覆盖
- 📦 **代码分割化** - 按需加载提性能
- 🔧 **开发友好性** - 热重载规范一致

## 功能特性

### 🎮 核心功能

- **状态监控**

  - 实时在线玩家数统计
  - 服务器运行状态检测
  - 延迟和性能指标显示

- **信息展示**

  - 服务器详细介绍
  - 游戏模式和规则说明
  - 社区活动公告

- **用户交互**
  - 问题反馈系统
  - FAQ 常见问题解答
  - 联系方式和社交媒体链接

### 🗜️ 智能压缩系统

- **多格式支持**
  - **Zstd** - 最新压缩算法，最高压缩率
  - **Brotli** - 现代浏览器首选，平衡压缩率和速度
  - **Gzip** - 传统兼容格式，确保向后兼容

- **智能内容协商**
  - 优先级回退：zstd > brotli > gzip > 原始文件
  - 自动检测客户端支持的压缩格式
  - Nginx 配置自动选择最佳压缩版本

- **全面覆盖**
  - **静态资源**：JS、CSS、HTML、XML、SVG、JSON
  - **预渲染页面**：所有 SEO 预渲染的 HTML 文件
  - **站点地图**：sitemap.xml 和 robots.txt

- **性能优化**
  - **85-98% 带宽节省**：CSS (85%)、JS (67-79%)、HTML (75.5%)
  - **构建集成**：自动压缩预渲染页面和所有静态资源
  - **CDN 友好**：压缩文件适配 CDN 分发
  - **缓存优化**：压缩文件独立缓存策略
  - **向后兼容**：完全兼容不支持新压缩格式的客户端

### 💻 技术特性

- **PWA支持** - 支持离线访问和桌面安装
- **SEO优化** - 完整的元数据和结构化数据
- **智能压缩** - 自动多格式压缩，智能内容协商
- **响应式设计** - 完美适配各种设备屏幕
- **无障碍访问** - 遵循 WCAG 无障碍标准
- **国际化支持** - 多语言切换（计划中）

## 快速开始

### 环境要求

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0 或 **yarn** >= 1.22.0
- **Git** >= 2.0.0

### 安装步骤

1. **克隆仓库**

   ```bash
   git clone https://github.com/Voidix-Network/voidix-web.git
   cd voidix-web
   ```

2. **安装依赖**

   ```bash
   npm install
   # 或者使用 yarn
   yarn install
   ```

3. **启动开发服务器**

   ```bash
   npm run dev
   # 或者使用 yarn
   yarn dev
   ```

4. **访问应用**
   ```
   打开浏览器访问: http://localhost:5173
   (当端口被占用时候会自动分配其他端口)
   ```

### 快速体验

- 🌐 **官方网站**: 访问 [https://www.voidix.net](https://www.voidix.net)
  查看生产效果
- 📱 **移动体验**: 开发者工具模拟或手机直接访问
- 💻 **本地运行**: 按上述步骤在本地启动项目

## 开发指南

### 开发环境设置

推荐使用以下开发工具：

- **IDE**: [Visual Studio Code](https://code.visualstudio.com/) 或
  [WebStorm](https://www.jetbrains.com/webstorm/)
- **浏览器**: Chrome 或 Edge (支持 React DevTools)
- **Git客户端**: shell 或 GitHub Desktop

### 推荐的 VS Code 扩展

项目已配置了推荐扩展列表（`.vscode/extensions.json`），VS Code 会自动提示安装：

- **Tailwind CSS IntelliSense** - Tailwind 类名智能补全
- **Prettier** - 代码格式化
- **TypeScript Hero** - TypeScript 增强支持
- **Auto Rename Tag** - HTML/JSX 标签自动重命名

### 代码规范

项目使用以下工具确保代码质量：

- **Prettier** - 代码格式化
- **TypeScript** - 类型检查
- **Vitest** - 单元测试

运行代码检查：

```bash
# 格式化代码
npm run style

# 检查代码格式
npm run style:check

# 类型检查
npm run type-check

# 运行所有检查
npm run lint
```

### 工作流

详见 [CONTRIBUTING.md](./CONTRIBUTING.md) 文档。<3

## 项目结构

```
voidix-web/
├── .vscode/                # VS Code 工作区配置
│   ├── settings.json       # 编辑器设置
│   └── extensions.json     # 推荐扩展列表
├── public/                 # 静态资源
│   ├── icons/              # 应用图标
│   └── robots.txt          # 搜索引擎配置
├── src/                    # 源代码
│   ├── assets/             # 静态资源
│   ├── components/         # React 组件
│   │   ├── ui/             # 基础 UI 组件
│   │   ├── business/       # 业务组件
│   │   ├── layout/         # 布局组件
│   │   └── sections/       # 页面区块组件
│   ├── hooks/              # 自定义 Hook
│   ├── pages/              # 页面组件
│   ├── services/           # 服务层
│   ├── stores/             # 状态管理
│   ├── types/              # TypeScript 类型定义
│   ├── utils/              # 工具函数
│   └── test/               # 测试文件
├── scripts/                # 构建脚本
│   ├── utils/              # 工具模块
│   ├── prerender/          # 预渲染模块
│   ├── sitemap/            # 站点地图生成
│   ├── compressAssets*.cjs # 智能压缩脚本
│   └── testCompression.cjs # 压缩功能测试
└── docs/                   # 文档资源
    ├── images/             # 图片资源
    ├── README.md           # 项目说明文档
    ├── CONTRIBUTING.md     # 贡献指南
    ├── CODE_OF_CONDUCT.md  # 行为准则
    ├── SECURITY.md         # 安全政策
    ├── CDN.md              # CDN代理服务文档
    └── THIRD_PARTY_LICENSES.csv # 第三方许可证报告
```

### 核心目录说明

- **`.vscode`** - VS Code 工作区配置和推荐扩展
- **`src/components`** - 采用原子化设计，分为 UI、业务、布局等层次
- **`src/pages`** - 页面级组件，对应路由
- **`src/services`** - API 服务和数据处理
- **`src/stores`** - Zustand 状态管理
- **`src/types`** - 全局类型定义
- **`scripts`** - 构建和部署相关脚本，包含智能压缩、预渲染等功能
- **`docs`** - 项目文档和资源，包含第三方许可证报告

## 脚本命令

### 开发命令

```bash
# 启动开发服务器
npm run dev

# 类型检查
npm run type-check

# 代码格式化
npm run style

# 代码格式检查
npm run style:check

# 运行所有检查
npm run lint
```

### 测试命令

```bash
# 运行测试
npm run test

# 开发模式测试（监听文件变化）
npm run test:dev

# 监听模式测试
npm run test:watch

# 生成测试覆盖率报告
npm run test:coverage

# 启动测试 UI 界面
npm run test:ui
```

### 构建命令

```bash
# 基础构建（仅编译和打包）
npm run build:basic

# HTTP 构建（包含站点地图生成）
npm run build:http

# 完整构建（包含预渲染、站点地图和智能压缩，推荐用于生产环境）
npm run build

# 预览构建结果
npm run preview
```

### 压缩相关命令

```bash
# 压缩构建资源（自动压缩所有静态文件和预渲染页面）
npm run compress:assets

# 测试压缩功能（验证压缩效果和兼容性）
npm run test:compression

# 清理压缩测试文件
npm run test:compression:cleanup
```

### 专用脚本

```bash
# 生成站点地图
npm run generate:sitemap

# 预渲染页面
npm run prerender:puppeteer

# 压缩构建资源
npm run compress:assets

# 生成第三方许可证报告
npm run license:report

# 检查许可证合规性
npm run license:check
```

## 部署文档

### 构建生产版本

```bash
# 完整构建（推荐，包含智能压缩）
npm run build

# 构建产物位于 dist/ 目录
# 自动生成 .gz、.br、.zst 压缩版本
```

### Nginx 配置

项目包含了完整的生产环境 Nginx 配置：

**配置文件：**
- `nginx-production.conf` - 站点配置（支持智能压缩）
- `scripts/CICD/deploy.sh` - 智能部署脚本（自动生成完整 nginx 配置）

**部署步骤：**

1. **使用智能部署脚本**（推荐）：
   ```bash
   # 进入项目目录并执行部署
   cd /var/www/voidix.net
   sudo ./scripts/CICD/deploy.sh
   ```

2. **手动部署**（如需要）：
   ```bash
   # 手动配置需要将 map 指令添加到 nginx.conf 的 http 块
   # 请参考 NGINX_CONFIG_SETUP.md 了解详细配置
   ```

3. **主要特性**：
   - 智能压缩内容协商 (zstd > brotli > gzip > 原始)
   - 双证书支持 (ECC + RSA)
   - 完整的安全头配置
   - CDN 代理和缓存支持
   - 预渲染页面压缩
   - 一键部署脚本
```

### 部署选项

- **Nginx + 静态文件** - 推荐用于生产环境
- **CDN 部署** - 配合 Nginx 使用
- **Vercel/Netlify** - 适用于快速部署
- **Docker** - 容器化部署

### 环境变量

生产环境需要配置的环境变量：

```bash
# 网站基础 URL
VITE_BASE_URL=https://www.voidix.net

# API 服务地址
VITE_API_URL=https://api.voidix.net

# WebSocket 服务地址
VITE_WS_URL=wss://ws.voidix.net
```

## 贡献指南

我们欢迎社区贡献！请参阅我们的 **[贡献指南](./CONTRIBUTING.md)** 了解详细信息。

### 快速开始

1. **Fork 仓库**到你的 GitHub 账户
2. **创建分支**: `git checkout -b [类型]/[描述]`
   - 分支类型: `feature`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`,
     `perf`, `ci` 等
   - 示例: `feature/server-status`, `fix/mobile-layout`, `docs/api-reference`
3. **提交更改**: `git commit -m '[详见提交规范]`
4. **推送分支**: `git push origin [分支名]`
5. **创建 Pull Request**
   (将自动使用[PR模板](../.github/pull_request_template.md))

### 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat: add server status monitoring`
- `fix: resolve mobile responsive issue`
- `docs: update README installation guide`
- `style: format code with prettier`
- `refactor: extract common utility functions`
- `test: add unit tests for server service`

### 问题和建议

- 🐛
  [报告错误](https://github.com/Voidix-Network/voidix-web/issues/new?template=bug_report.md)
- ✨
  [功能请求](https://github.com/Voidix-Network/voidix-web/issues/new?template=feature_request.md)

### 社区规范

- 🤝 **[行为准则](./CODE_OF_CONDUCT.md)** - 社区参与的行为标准和价值观
- 🛡️ **[安全政策](./SECURITY.md)** - 安全漏洞报告和处理流程

## 许可证

本项目采用双许可证模式：

### 代码许可证

**[GNU Affero General Public License v3.0 (AGPL-3.0)](./LICENSE_CODE)**

- ✅ **商业使用** - 允许商业用途
- ✅ **修改** - 允许修改代码
- ✅ **分发** - 允许分发
- ✅ **专利使用** - 提供专利授权
- ✅ **私人使用** - 允许私人使用
- ❗ **网络使用强制开源** - 通过网络提供服务时必须开源
- ❗ **相同许可证** - 衍生作品必须使用相同许可证
- ❗ **包含许可证** - 必须包含许可证和版权声明
- ❗ **包含源码** - 必须提供源代码

### 内容许可证

**[Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)](./LICENSE_CONTENT)**

适用于文档、图片、设计等非代码内容：

- ✅ **署名** - 必须署名原作者
- ✅ **相同方式共享** - 衍生作品必须使用相同许可证
- ✅ **商业使用** - 允许商业用途
- ✅ **修改** - 允许修改内容

---

<div align="center">
  <p>感谢所有为 Voidix Web 项目做出贡献的开发者！</p>
  <p>Made with ❤️ by <a href="https://github.com/Voidix-Network">Voidix Team</a></p>
</div>
