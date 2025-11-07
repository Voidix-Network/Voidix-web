# 🤝 贡献指南

感谢您对 Voidix
Web 项目的关注！我们欢迎并鼓励社区贡献，无论是代码、文档、bug报告还是功能建议。

## 📋 目录

- [开始贡献](#开始贡献)
- [开发环境设置](#开发环境设置)
- [提交代码](#提交代码)
- [许可证维护](#许可证维护)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [Pull Request 流程](#pull-request-流程)
- [问题报告](#问题报告)
- [功能请求](#功能请求)
- [代码审查](#代码审查)
- [社区准则](#社区准则)

## 开始贡献

### 🔍 寻找贡献机会

1. **浏览 Issues** - 查看
   [GitHub Issues](https://github.com/Voidix-Network/voidix-web/issues)
   寻找标记为 `good first issue` 或 `help wanted` 的问题
2. **改进文档** - 发现文档中的错误或不清晰的地方
3. **报告 Bug** - 发现并报告项目中的问题
4. **提出功能** - 建议新的功能或改进现有功能
5. **优化性能** - 提升代码性能和用户体验

### 🎯 贡献类型

- **代码贡献** - 新功能、Bug修复、性能优化
- **文档贡献** - README、API文档、教程
- **测试贡献** - 单元测试、集成测试、端到端测试
- **设计贡献** - UI/UX改进、图标、图片
- **翻译贡献** - 多语言支持（计划中）

## 开发环境设置

### 📋 环境要求

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0 或 **yarn** >= 1.22.0
- **Git** >= 2.0.0

### 🛠️ 推荐工具

- **IDE**: [Visual Studio Code](https://code.visualstudio.com/) 或
  [WebStorm](https://www.jetbrains.com/webstorm/)
- **浏览器**: Chrome 或 Edge (支持 React DevTools)
- **Git客户端**: shell 或 GitHub Desktop

### 🔌 VS Code 扩展

安装以下扩展以获得最佳开发体验：

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag"
  ]
}
```

### ⚙️ 本地设置

1. **Fork 仓库**

   ```bash
   # 在 GitHub 上 Fork 仓库，然后克隆到本地
   git clone https://github.com/YOUR_USERNAME/voidix-web.git
   cd voidix-web
   ```

2. **添加上游远程仓库**

   ```bash
   git remote add upstream https://github.com/Voidix-Network/voidix-web.git
   ```

3. **安装依赖**

   ```bash
   npm install
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

## 提交代码

### 🌿 分支管理

遵循以下分支命名规范：

- **feature/** - 新功能开发
- **fix/** - Bug修复
- **docs/** - 文档更新
- **refactor/** - 代码重构
- **test/** - 测试相关
- **chore/** - 构建过程或辅助工具的变动
- **style/** - 代码格式（不影响功能）
- **perf/** - 性能优化
- **ci/** - CI/CD 相关更改

### 📝 提交流程

1. **创建功能分支**

   ```bash
   # 从最新的 master 分支创建
   git checkout master
   git pull upstream master
   git checkout -b [类型]/[描述]
   ```

   **分支类型**: `feature`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`,
   `perf`, `ci` 等

   **示例**: `feature/server-status`, `fix/mobile-layout`, `docs/api-reference`

2. **进行开发**

   ```bash
   # 进行代码更改
   # 运行测试确保一切正常
   npm run test
   npm run type-check
   npm run style:check
   ```

3. **提交更改**

   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **推送分支**

   ```bash
   git push origin [分支名]
   ```

5. **创建 Pull Request**
   - 在 GitHub 上创建 PR
   - 详细描述更改内容
   - 链接相关 Issues

## 许可证维护

### 📜 第三方许可证文件

本项目维护一个 `THIRD_PARTY_LICENSES.csv`
文件来追踪所有第三方依赖的许可证信息。这个文件需要在以下情况下更新：

- 添加新的 npm 依赖包
- 更新现有依赖包版本
- 移除依赖包
- 定期审查（建议每月进行一次）

### 🔄 更新许可证文件

当你对项目依赖进行任何更改时，请按照以下步骤更新许可证文件：

1. **安装或更新依赖后**

   ```bash
   # 安装新依赖或更新现有依赖
   npm install package-name
   # 或
   npm update
   ```

2. **生成最新许可证信息**

   ```bash
   # 生成最新的第三方许可证文件
   npx license-checker --csv --out docs/THIRD_PARTY_LICENSES.csv --excludePrivatePackages
   ```

3. **验证更改**

   ```bash
   # 查看许可证文件的更改
   git diff docs/THIRD_PARTY_LICENSES.csv
   ```

4. **提交许可证文件更新**

   ```bash
   # 添加更新的许可证文件
   git add docs/THIRD_PARTY_LICENSES.csv
   git commit -m "chore: update third-party licenses"
   ```

### ⚠️ 重要注意事项

- **CI/CD 检查**: GitHub Actions 会自动检查许可证文件是否为最新状态
- **PR 要求**: 如果许可证文件过期，PR 将无法通过检查
- **许可证兼容性**: 请确保新添加的依赖使用兼容的开源许可证
- **自动化**: 推荐在本地开发环境中设置 git hooks 来自动更新许可证文件

### 🛠️ 许可证文件格式

生成的 `THIRD_PARTY_LICENSES.csv` 文件包含以下列：

- **module name** - 包名称
- **license** - 许可证类型
- **repository** - 仓库地址
- **url** - 许可证URL
- **licenseText** - 许可证文本（如可用）

### 🔍 常见问题排查

**问题**: CI 显示许可证文件过期 **解决**: 运行
`npx license-checker --csv --out docs/THIRD_PARTY_LICENSES.csv --excludePrivatePackages`
并提交更新

**问题**: 新依赖许可证不兼容
**解决**: 检查许可证兼容性，必要时寻找替代包或联系维护团队

**问题**: 许可证文件生成失败 **解决**: 确保 `node_modules` 已正确安装，运行
`npm install` 后重试

## 代码规范

### 🎨 代码风格

项目使用以下工具确保代码质量：

- **Prettier** - 自动代码格式化
- **TypeScript** - 类型检查和静态分析
- **Vitest** - 单元测试

### 🧪 质量检查

在提交代码前，请运行以下命令：

```bash
# 格式化代码
npm run style

# 检查代码格式
npm run style:check

# TypeScript 类型检查
npm run type-check

# 运行测试
npm run test

# 运行所有检查
npm run lint
```

### 📐 编码标准

- **使用 TypeScript** - 所有新代码都应该使用 TypeScript
- **函数式编程** - 优先使用函数式编程范式
- **组件化** - 创建可复用的组件
- **性能优化** - 避免不必要的重渲染和计算
- **无障碍性** - 遵循 WCAG 无障碍标准

## 提交规范

### 📋 Conventional Commits

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
type(scope): description

[optional body]

[optional footer]
```

### 🏷️ 提交类型

- **feat** - 新功能
- **fix** - Bug修复
- **docs** - 文档更新
- **style** - 代码格式（不影响功能）
- **refactor** - 代码重构
- **test** - 测试相关
- **chore** - 构建过程或辅助工具的变动
- **perf** - 性能优化
- **ci** - CI/CD 相关更改

### ✅ 提交示例

```bash
# 新功能
git commit -m "feat: add server status monitoring component"

# Bug修复
git commit -m "fix: resolve mobile responsive issue on homepage"

# 文档更新
git commit -m "docs: update installation guide in README"

# 代码格式
git commit -m "style: format code with prettier"

# 重构
git commit -m "refactor: extract common utility functions"

# 测试
git commit -m "test: add unit tests for server service"

# 性能优化
git commit -m "perf: optimize component rendering performance"

# CI/CD
git commit -m "ci: update GitHub Actions workflow"
```

## Pull Request 流程

### 📝 PR 模板

创建 PR 时，请包含以下信息：

```markdown
## 描述

简要描述此 PR 的目的和更改内容

## 更改类型

- [ ] 新功能 (feat)
- [ ] Bug修复 (fix)
- [ ] 文档更新 (docs)
- [ ] 代码重构 (refactor)
- [ ] 性能优化 (perf)
- [ ] 测试 (test)
- [ ] 代码格式 (style)
- [ ] 构建配置 (chore)
- [ ] CI/CD更改 (ci)

## 测试

描述如何测试这些更改

## 截图（如适用）

添加相关截图

## 相关问题

关联相关的 Issues: #123
```

### ✅ PR 检查清单

在提交 PR 前，确保：

- [ ] 代码通过所有测试
- [ ] 代码格式符合项目标准
- [ ] 添加了必要的测试
- [ ] 更新了相关文档
- [ ] 提交信息遵循规范
- [ ] PR 描述清晰完整

### 🔍 代码审查

所有 PR 都需要通过：

- ✅ **自动化检查**
  - 代码格式检查（Prettier）
  - 类型检查（TypeScript）
  - 单元测试（Vitest）
  - 构建测试

- ✅ **人工审查**
  - 代码质量审查
  - 架构设计审查
  - 功能测试
  - 文档完整性

## 问题报告

### 🐛 Bug 报告

发现 Bug？请使用
[Bug 报告模板](https://github.com/Voidix-Network/voidix-web/issues/new?template=bug_report.md)：

**包含信息：**

- 问题描述
- 重现步骤
- 预期行为
- 实际行为
- 环境信息
- 截图或录屏

### 📋 Bug 报告模板

```markdown
**Bug 描述** 简要描述遇到的问题

**重现步骤**

1. 进入 '...'
2. 点击 '....'
3. 滚动到 '....'
4. 看到错误

**预期行为** 描述你期望发生的情况

**截图** 如果适用，添加截图来帮助解释你的问题

**环境信息：**

- 操作系统: [例如 Windows 11]
- 浏览器: [例如 Chrome 91]
- 版本: [例如 v1.0.0]
```

## 功能请求

### ✨ 功能建议

想要新功能？请使用
[功能请求模板](https://github.com/Voidix-Network/voidix-web/issues/new?template=feature_request.md)：

**包含信息：**

- 功能描述
- 使用场景
- 解决的问题
- 可能的实现方案
- 其他替代方案

### 📋 功能请求模板

```markdown
**功能请求** 简要描述你想要的功能

**问题背景** 描述这个功能解决什么问题

**期望解决方案** 描述你想要的功能如何工作

**替代方案** 描述你考虑过的其他替代解决方案

**附加信息** 添加任何其他相关信息或截图
```

## 代码审查

### 👥 审查流程

1. **自动化检查** - CI/CD 自动运行测试
2. **初步审查** - 检查基本代码质量
3. **功能审查** - 验证功能实现
4. **安全审查** - 检查安全隐患
5. **性能审查** - 评估性能影响
6. **最终批准** - 维护者最终审批

### 📝 审查标准

**代码质量：**

- 代码清晰易读
- 良好的变量命名
- 适当的注释
- 遵循项目架构

**功能性：**

- 功能按预期工作
- 边界情况处理
- 错误处理完善
- 性能表现良好

**测试覆盖：**

- 单元测试充分
- 集成测试合理
- 边界情况测试
- 回归测试通过

## 社区准则

### 🤝 行为准则

我们致力于为每个人提供友好、安全和欢迎的环境：

- **尊重** - 尊重不同的观点和经验
- **包容** - 欢迎来自不同背景的贡献者
- **建设性** - 提供建设性的反馈和建议
- **专业** - 保持专业和友好的交流

### 📞 联系方式

如果你有任何问题或需要帮助：

- **GitHub Issues** - 技术问题和Bug报告
- **Discussions** - 一般讨论和问题
- **Email** - 敏感问题或私人联系

### 🎉 感谢贡献者

我们感谢所有为项目做出贡献的人！你的贡献使 Voidix Web 变得更好。

---

<div align=\"center\">
  <p>再次感谢你对 Voidix Web 项目的贡献！</p>
  <p>Made with ❤️ by <a href=\"https://github.com/Voidix-Network\">Voidix Team</a></p>
</div>
