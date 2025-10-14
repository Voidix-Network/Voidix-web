# Voidix Web 安全政策

## 🛡️ 安全承诺

Voidix
Web 项目致力于为用户和社区提供安全可靠的服务。我们认真对待安全问题，并建立了完善的安全漏洞处理机制。

## 📋 支持的版本

我们为以下版本提供安全更新和支持：

| 版本类型                      | 支持状态    | 安全更新        | 最后更新 |
| ----------------------------- | ----------- | --------------- | -------- |
| 🚀 **Production (生产版本)**  | ✅ 完全支持 | ✅ 立即修复     | 持续更新 |
| 🧪 **Development (开发版本)** | ✅ 有限支持 | ⚠️ 下个版本修复 | 每日构建 |
| 📦 **Release Candidates**     | ✅ 测试支持 | ✅ 快速修复     | 发布前   |
| 📚 **Legacy (历史版本)**      | ❌ 不再支持 | ❌ 不提供修复   | 已停止   |

### 🔄 版本生命周期

- **生产版本**: 主分支 (main/master) 的稳定发布
- **开发版本**: 开发分支 (develop) 的最新代码
- **候选版本**: 预发布的候选版本 (rc-\*)
- **历史版本**: 超过6个月的旧版本

## 🚨 漏洞报告流程

### 📞 报告渠道

#### 🔒 私密报告（推荐）

- **📧 安全邮箱**: security@voidix.net
- **🔐 PGP 加密**: 可用 (见下方公钥)
- **⏰ 响应时间**: 24小时内确认

#### 🌐 GitHub 安全顾问

- **🔗 GitHub Security**:
  [私密漏洞报告](https://github.com/Voidix-Network/voidix-web/security/advisories)
- **✅ 优势**: 集成的漏洞管理流程
- **⏰ 响应时间**: 48小时内确认

#### 📱 紧急联系

- **🆘 紧急情况**: admin@voidix.net
- **⚡ 响应时间**: 6小时内响应

### 📝 报告模板

请在报告安全漏洞时包含以下信息：

```markdown
## 🔍 漏洞概述

简要描述发现的安全问题

## 🎯 影响范围

- 受影响的组件/页面
- 潜在的安全风险
- 影响的用户范围

## 🔬 技术细节

- 漏洞类型 (XSS, CSRF, SQL注入等)
- 触发条件和复现步骤
- 技术实现细节

## 🧪 复现步骤

1. 第一步操作
2. 第二步操作
3. 观察到的异常行为

## 💻 环境信息

- 浏览器版本
- 操作系统
- 网络环境
- 其他相关配置

## 📸 证明材料

- 截图或录屏
- 网络请求记录
- 错误日志
- 概念验证代码 (PoC)

## 💡 修复建议

如果有修复建议，请提供
```

### ⚠️ 漏洞严重程度

| 级别                   | 描述                 | 响应时间 | 修复时间 |
| ---------------------- | -------------------- | -------- | -------- |
| 🔴 **Critical (严重)** | 可导致系统完全妥协   | 6小时    | 24小时   |
| 🟠 **High (高危)**     | 可获取敏感数据或权限 | 24小时   | 72小时   |
| 🟡 **Medium (中危)**   | 可绕过安全控制       | 72小时   | 1周      |
| 🟢 **Low (低危)**      | 信息泄露或拒绝服务   | 1周      | 2周      |

#### 严重程度评估标准

**🔴 Critical - 严重**

- 远程代码执行 (RCE)
- SQL 注入导致数据库完全妥协
- 身份验证绕过
- 敏感数据大规模泄露

**🟠 High - 高危**

- 跨站脚本攻击 (XSS) 影响管理员
- 跨站请求伪造 (CSRF) 高权限操作
- 本地文件包含 (LFI) 或路径遍历
- 用户权限提升

**🟡 Medium - 中危**

- 反射型 XSS
- 信息泄露 (技术细节、配置等)
- 拒绝服务攻击 (DoS)
- 不安全的直接对象引用

**🟢 Low - 低危**

- 存储型 XSS (限制影响)
- 信息泄露 (版本、错误信息)
- 安全配置问题
- 社会工程学向量

## ⏰ 响应时间承诺

### 📅 处理时间线

| 阶段         | 时间框架     | 说明                       |
| ------------ | ------------ | -------------------------- |
| **确认收到** | 24-48小时    | 发送确认邮件，分配追踪编号 |
| **初步评估** | 2-5个工作日  | 评估严重程度和影响范围     |
| **详细分析** | 5-10个工作日 | 深入分析和复现验证         |
| **修复开发** | 根据严重程度 | 开发和测试安全补丁         |
| **发布修复** | 根据严重程度 | 部署修复和发布公告         |

### 🔄 沟通更新

- **进度更新**: 每周一次状态更新
- **重要节点**: 及时通知关键进展
- **修复确认**: 修复完成后的验证确认

## 🤝 负责任的披露政策

### 📋 披露原则

我们遵循负责任的安全漏洞披露政策：

#### ✅ 我们的承诺

- **🔒 保密处理** - 在修复前不公开漏洞细节
- **🏃 快速响应** - 按承诺时间响应和修复
- **🙏 致谢认可** - 在安全公告中感谢报告者
- **💰 奖励机制** - 适当的漏洞奖励（规划中）

#### ✅ 期望配合

- **🤐 保密期间** - 在我们修复前不公开披露
- **🎯 善意测试** - 仅在必要范围内进行测试
- **📚 负责报告** - 提供详细、准确的漏洞信息
- **⏳ 合理时间** - 给予我们合理的修复时间

### 📢 公开披露

修复完成后，我们将：

1. **📰 发布安全公告** - 在 GitHub Security Advisories
2. **📝 更新文档** - 更新相关安全文档
3. **🙏 致谢贡献者** - 公开感谢漏洞报告者
4. **📊 分享经验** - 分享修复过程和经验教训

### 🏆 致谢政策

我们将在以下地方致谢安全研究者：

- GitHub Security Advisories
- 项目官方网站安全页面
- 相关技术博客文章
- 年度安全报告

## 🔐 PGP 公钥

用于加密敏感安全信息：

**密钥信息**:

- 用户标识: `security@voidix.net`
- 有效期自: 2025/6/15 17:43
- 有效期至: 2028/6/15 12:00
- 文件系统: 4,096 位 RSA(绝密密钥可用)
- 用途: 签名, 仅加密, 认证用户 ID
- 指纹: `7276AB60206478F1E7B6FFD48A5FDFA89AF56B37`

```
-----BEGIN PGP PUBLIC KEY BLOCK-----

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
=4l5O
-----END PGP PUBLIC KEY BLOCK-----
```

## 🚫 超出范围的问题

以下问题不在我们的安全政策范围内：

### ❌ 不适用的问题

- **📧 垃圾邮件或钓鱼** - 非技术安全问题
- **🌐 第三方服务** - 不受我们控制的外部服务
- **📱 客户端软件** - 用户设备上的安全问题
- **🔧 配置错误** - 用户自己的错误配置
- **📋 合规问题** - 非技术的合规性问题

### ⚖️ 法律边界

- **🚫 恶意攻击** - 真实的攻击行为
- **📊 数据窃取** - 大量下载或窃取数据
- **💥 破坏性测试** - 可能损害服务的测试
- **👥 社会工程** - 针对用户或员工的欺骗

## 📞 联系信息

### 🔒 安全团队

- **📧 主要联系**: security@voidix.net
- **🆘 紧急联系**: admin@voidix.net

### 👥 团队成员

- **🛡️ 安全负责人**: Security Lead (@voidix-team)
- **🔧 技术负责人**: Tech Lead (@voidix-team)

### ⏰ 工作时间

- **🌅 常规响应**: 周一至周五 9:00-18:00 (UTC+8)
- **🚨 紧急响应**: 24/7 (严重安全事件)
- **🌙 非工作时间**: 将在下个工作日响应

## 📚 安全资源

### 🔗 相关链接

- **📖 安全最佳实践**: [Security Guide](./docs/SECURITY_GUIDE.md)
- **🤝 行为准则**: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- **📋 贡献指南**: [CONTRIBUTING.md](./docs/CONTRIBUTING.md)

### 📰 安全公告

- **🔔 订阅更新**: Watch 此仓库的安全更新
- **📱 RSS 订阅**: 通过 GitHub RSS 获取安全公告
- **📧 邮件通知**: security@voidix.net

---

> 🛡️ **安全是我们共同的责任**。感谢您帮助保护 Voidix Web 和用户的安全！

**最后更新**: 2025年6月15日 **版本**: 1.0.0
