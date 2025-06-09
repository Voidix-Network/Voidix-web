# 许可证信息

版权所有 (c) 2025 Voidix-Network

## 📋 许可证概览

本项目采用混合许可证模式，不同组件使用不同许可证：

### 🔧 项目源代码

- **许可证**: GNU Affero General Public License v3.0 (AGPLv3)
- **适用范围**: `src/` 目录中的源代码、配置文件等
- **完整文本**: 见 `LICENSE_CODE` 文件

### 📝 文档和内容

- **许可证**: Creative Commons Attribution-ShareAlike 4.0 International (CC
  BY-SA 4.0)
- **适用范围**: 文档、图像、文本内容等
- **完整文本**: 见 `LICENSE_CONTENT` 文件

### 📦 第三方依赖

本项目使用以下开源库，按许可证类型分组：

#### MIT 许可证 (24个库)

- **主要库**: React, React-DOM, React Router, Framer Motion, Zustand, clsx
- **类型定义**: @types/react, @types/react-dom, @types/react-router-dom
- **工具库**: js-tokens, loose-envify, scheduler, use-sync-external-store 等

#### Apache 2.0 许可证 (2个库)

- **react-helmet-async**: SEO 和文档头管理
- **web-vitals**: Web 性能指标收集

#### ISC 许可证 (1个库)

- **lucide-react**: 图标库

#### 0BSD 许可证 (1个库)

- **tslib**: TypeScript 运行时库

## 🔄 自动化许可证管理

### 生成完整许可证报告

```bash
# 生成当前依赖的完整许可证信息
npm run license:report

# 检查许可证兼容性
npm run license:check
```

### 添加到 package.json scripts:

```json
{
  "scripts": {
    "license:report": "npx license-checker --production --csv > docs/THIRD_PARTY_LICENSES.csv",
    "license:check": "npx license-checker --production --onlyAllow \"MIT;Apache-2.0;ISC;0BSD;BSD-2-Clause;BSD-3-Clause\""
  }
}
```

## 📊 许可证统计

- **总依赖数**: 28个生产依赖
- **MIT**: 24个 (85.7%)
- **Apache-2.0**: 2个 (7.1%)
- **ISC**: 1个 (3.6%)
- **0BSD**: 1个 (3.6%)

## ✅ 合规性

### 允许的许可证类型

- ✅ MIT License
- ✅ Apache License 2.0
- ✅ ISC License
- ✅ BSD 2-Clause/3-Clause License
- ✅ 0BSD License
- ✅ BlueOak-1.0.0
- ✅ CC-BY-4.0

### 禁止的许可证类型

- ❌ GPL-2.0, GPL-3.0 (Copyleft 冲突)
- ❌ AGPL (除项目本身)
- ❌ 商业专有许可证

## 🤝 贡献

提交代码即表示同意：

- 代码贡献使用 AGPLv3 许可证
- 文档贡献使用 CC BY-SA 4.0 许可证
- 确保引入的依赖使用兼容许可证

## 📖 详细信息

- **完整依赖列表**: 运行 `npm run license:report` 生成
- **许可证全文**: 查看 `LICENSE_CODE` 和 `LICENSE_CONTENT`
- **第三方许可证**: 各库的 `node_modules/[包名]/LICENSE` 文件

---

**最后更新**: 2025年6月15日  
**依赖数量**: 28个生产依赖  
**合规状态**: ✅ 全部兼容

---

# LICENSE (English)

Copyright (c) 2025 Voidix-Network

## 📋 License Overview

This project uses a hybrid licensing model with different licenses for different
components:

### 🔧 Project Source Code

- **License**: GNU Affero General Public License v3.0 (AGPLv3)
- **Scope**: Source code in `src/` directory, configuration files, etc.
- **Full Text**: See `LICENSE_CODE` file

### 📝 Documentation and Content

- **License**: Creative Commons Attribution-ShareAlike 4.0 International (CC
  BY-SA 4.0)
- **Scope**: Documentation, images, textual content, etc.
- **Full Text**: See `LICENSE_CONTENT` file

### 📦 Third-Party Dependencies

This project uses the following open source libraries, grouped by license type:

#### MIT License (24 libraries)

- **Main Libraries**: React, React-DOM, React Router, Framer Motion, Zustand,
  clsx
- **Type Definitions**: @types/react, @types/react-dom, @types/react-router-dom
- **Utilities**: js-tokens, loose-envify, scheduler, use-sync-external-store,
  etc.

#### Apache 2.0 License (2 libraries)

- **react-helmet-async**: SEO and document head management
- **web-vitals**: Web performance metrics collection

#### ISC License (1 library)

- **lucide-react**: Icon library

#### 0BSD License (1 library)

- **tslib**: TypeScript runtime library

## 🔄 Automated License Management

### Generate Complete License Report

```bash
# Generate complete license information for current dependencies
npm run license:report

# Check license compatibility
npm run license:check
```

## 📊 License Statistics

- **Total Dependencies**: 28 production dependencies
- **MIT**: 24 (85.7%)
- **Apache-2.0**: 2 (7.1%)
- **ISC**: 1 (3.6%)
- **0BSD**: 1 (3.6%)

## ✅ Compliance

### Allowed License Types

- ✅ MIT License
- ✅ Apache License 2.0
- ✅ ISC License
- ✅ BSD 2-Clause/3-Clause License
- ✅ 0BSD License
- ✅ BlueOak-1.0.0
- ✅ CC-BY-4.0

### Prohibited License Types

- ❌ GPL-2.0, GPL-3.0 (Copyleft conflict)
- ❌ AGPL (except project itself)
- ❌ Commercial proprietary licenses

**Last Updated**: June 15, 2025  
**Dependency Count**: 28 production dependencies  
**Compliance Status**: ✅ All compatible
