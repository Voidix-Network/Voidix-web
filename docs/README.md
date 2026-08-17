<div align="center">
  <a href="https://github.com/Voidix-Network/voidix-web">
    <img src="https://www.voidix.net/logo.png" alt="Voidix Logo" width="120" height="120">
  </a>
  <h1>Voidix Web</h1>
  <div align="center">
    <a href="./LICENSE_CODE"><img src="https://img.shields.io/badge/Code-AGPL_3.0-orange" alt="Code License" /></a>
    <a href="./LICENSE_CONTENT"><img src="https://img.shields.io/badge/Content-CC_BY_SA_4.0-orange" alt="Content License" /></a>
    <br />
    <a href="https://github.com/Voidix-Network/voidix-web/actions/workflows/check.yml"><img src="https://github.com/Voidix-Network/voidix-web/actions/workflows/check.yml/badge.svg" alt="Build Status" /></a>
    <a href="https://github.com/Voidix-Network/voidix-web/actions/workflows/CodeQL.yml"><img src="https://github.com/Voidix-Network/voidix-web/actions/workflows/CodeQL.yml/badge.svg" alt="Security" /></a>
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

Voidix Minecraft 服务器的官方网站，提供服务器状态、服务器信息和社区入口。

技术栈：Astro 5 + TypeScript + Tailwind CSS

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

访问 http://localhost:4321

## 常用命令

```bash
npm run dev      # 开发服务器
npm run check    # Astro 类型和模板检查
npm run build    # 生产构建
npm run preview  # 预览构建产物
```

## 项目结构

```
src/
├── components/  # 页面组件
├── data/        # 站点与页面数据
├── layouts/     # 全局布局
├── pages/       # 路由页面
├── scripts/     # 浏览器端脚本
└── styles/      # 全局样式
```

## 贡献

1. Fork 仓库
2. 创建分支：`git checkout -b feature/xxx`
3. 提交更改：`git commit -m "feat: xxx"`
4. 推送：`git push origin feature/xxx`
5. 创建 Pull Request

## 许可证

- 代码：[AGPL-3.0](./LICENSE_CODE)
- 内容：[CC BY-SA 4.0](./LICENSE_CONTENT)

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/Voidix-Network">Voidix Team</a>
</div>
