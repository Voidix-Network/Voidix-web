<div align="center">
  <a href="https://github.com/Voidix-Network/voidix-web">
    <img src="images/logo.png" alt="Logo" width="120" height="120">
  </a>
  <h1>Voidix Web</h1>
  <div align="center">
    <a href="../LICENSE_CODE"><img src="https://img.shields.io/badge/Code-AGPL_3.0-orange" alt="Code License" /></a>
    <a href="../LICENSE_CONTENT"><img src="https://img.shields.io/badge/Content-CC_BY_SA_4.0-orange" alt="Content License" /></a>
    <br />
    <a href="https://github.com/Voidix-Network/voidix-web/actions/workflows/check.yml"><img src="https://github.com/Voidix-Network/voidix-web/actions/workflows/check.yml/badge.svg" alt="Build Status" /></a>
    <a href="https://github.com/Voidix-Network/voidix-web/actions/workflows/CodeQL.yml"><img src="https://github.com/Voidix-Network/voidix-web/actions/workflows/CodeQL.yml/badge.svg" alt="Security" /></a>
    <a href="https://codecov.io/gh/voidix-network/voidix-web"><img src="https://codecov.io/gh/voidix-network/voidix-web/branch/master/graph/badge.svg?token=1UK18ZSXU5" alt="Coverage" /></a>
  </div>
  <br />
  <p align="center">
    Voidix 官方网站源码
    <br />
    <a href="https://www.voidix.net">在线预览</a>
    ·
    <a href="https://github.com/Voidix-Network/voidix-web/issues/new?template=bug_report.md">报告问题</a>
    ·
    <a href="https://github.com/Voidix-Network/voidix-web/issues/new?template=feature_request.md">功能建议</a>
  </p>
</div>

## 关于

Voidix Minecraft 服务器的官方网站，提供服务器状态监控、信息展示和社区交流功能。

技术栈：React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion

## 快速开始

```bash
# 克隆
git clone https://github.com/Voidix-Network/voidix-web.git
cd voidix-web

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173

## 常用命令

```bash
npm run dev          # 开发服务器
npm run build        # 生产构建
npm run test         # 运行测试
npm run type-check   # 类型检查
npm run style        # 格式化代码
```

## 项目结构

```
src/
├── components/    # React 组件
├── pages/         # 页面
├── hooks/         # 自定义 Hook
├── services/      # API 服务
├── stores/        # 状态管理
├── types/         # 类型定义
└── test/          # 测试文件
```

## 贡献

1. Fork 仓库
2. 创建分支：`git checkout -b feature/xxx`
3. 提交更改：`git commit -m "feat: xxx"`
4. 推送：`git push origin feature/xxx`
5. 创建 Pull Request

详见 [CONTRIBUTING.md](./CONTRIBUTING.md)

## 许可证

- 代码：[AGPL-3.0](../LICENSE_CODE)
- 内容：[CC BY-SA 4.0](../LICENSE_CONTENT)

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/Voidix-Network">Voidix Team</a>
</div>
