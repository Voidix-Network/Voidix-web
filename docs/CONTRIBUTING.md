# 贡献指南

欢迎为 Voidix Web 项目贡献代码！

## 开始之前

1. Fork 仓库到你的账户
2. 克隆到本地：`git clone https://github.com/YOUR_USERNAME/voidix-web.git`
3. 添加上游：`git remote add upstream https://github.com/Voidix-Network/voidix-web.git`
4. 安装依赖：`npm install`

## 开发流程

1. 从 master 创建分支：`git checkout -b feature/xxx`
2. 进行开发
3. 运行检查：`npm run lint && npm run test`
4. 提交更改
5. 推送并创建 PR

## 提交规范

尽量使用 [Conventional Commits](https://www.conventionalcommits.org/)：

```
feat: 添加服务器状态监控
fix: 修复移动端布局问题
docs: 更新安装说明
style: 格式化代码
refactor: 重构工具函数
test: 添加单元测试
```

## 代码检查

提交前请确保通过：

```bash
npm run style:check   # 格式检查
npm run type-check    # 类型检查
npm run test          # 测试
```

## PR 要求

- 描述清晰
- 通过所有 CI 检查
- 关联相关 Issue（如有）

## 问题反馈

- [报告 Bug](https://github.com/Voidix-Network/voidix-web/issues/new?template=bug_report.md)
- [功能建议](https://github.com/Voidix-Network/voidix-web/issues/new?template=feature_request.md)

---

感谢你的贡献！
