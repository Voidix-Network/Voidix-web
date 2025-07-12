# Voidix统一分析系统

## 概述

Voidix统一分析系统整合了Google Analytics 4和Microsoft
Clarity，提供了标准化的事件追踪接口。该系统支持隐私保护、延迟加载、错误重试等特性。

## 快速开始

### 1. 初始化分析系统

```typescript
import { initVoidixAnalytics } from '@/services/analytics';

// 在应用启动时初始化
await initVoidixAnalytics();
```

### 2. 追踪事件

```typescript
import { analytics } from '@/services/analytics';

// 追踪页面浏览
analytics.page('HomePage', { source: 'navigation' });

// 追踪自定义事件
analytics.track('button_click', {
  button: 'header_login',
  location: 'header',
});

// 追踪Bug报告
analytics.trackBugReport('ui_error', 'high');

// 追踪FAQ查看
analytics.trackFAQView('1', 'general_faq');
```

### 3. 管理用户同意

```typescript
import { setAnalyticsConsent } from '@/services/analytics';

// 设置用户同意状态
setAnalyticsConsent(
  true, // analytics: 允许分析数据收集
  true // performance: 允许性能数据收集
);
```

## API参考

### 核心方法

#### `initVoidixAnalytics()`

初始化分析系统。

#### `analytics.track(event, properties?)`

追踪自定义事件。

- `event`: 事件名称
- `properties`: 可选的事件属性

#### `analytics.page(name?, properties?)`

追踪页面浏览。

- `name`: 页面名称（可选，默认使用当前路径）
- `properties`: 可选的页面属性

#### `analytics.identify(userId, traits?)`

设置用户标识。

- `userId`: 用户ID
- `traits`: 可选的用户特征

### 专用追踪方法

#### `analytics.trackBugReport(reportType, severity)`

追踪Bug报告。

#### `analytics.trackFAQView(questionId, category)`

追踪FAQ查看。

#### `analytics.trackPagePerformance()`

追踪页面性能指标。

### 状态管理

#### `getAnalyticsStatus()`

获取分析系统状态。

#### `setAnalyticsConsent(analytics, performance?)`

设置用户同意状态。

#### `destroyAnalytics()`

清理分析系统（用于测试）。

## 配置

### 环境变量

```env
# Google Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_ENABLE_ANALYTICS=true

# Microsoft Clarity
VITE_CLARITY_PROJECT_ID=xxxxxxxxx
VITE_ENABLE_CLARITY=true
```

### 自定义配置

```typescript
import { VoidixAnalytics, type AnalyticsConfig } from '@/services/analytics';

const customConfig: AnalyticsConfig = {
  googleAnalytics: {
    measurementId: 'G-XXXXXXXXXX',
    enabled: true,
    debugMode: false,
  },
  microsoftClarity: {
    projectId: 'xxxxxxxxx',
    enabled: true,
  },
  privacy: {
    requireConsent: true,
    cookielessMode: false,
  },
  performance: {
    scriptDelay: 3000,
    enableRetry: true,
    maxRetries: 3,
  },
};

const analytics = VoidixAnalytics.getInstance();
await analytics.init(customConfig);
```

## 特性

### 🔒 隐私保护

- 支持GDPR合规
- 用户同意管理
- 可选的Cookie-less模式

### 🚀 性能优化

- 延迟加载脚本
- 事件队列机制
- 失败重试机制

### 🛡️ 错误处理

- 全局错误捕获
- Promise拒绝追踪
- 详细的日志记录

### 📊 调试支持

- 开发环境调试模式
- 状态检查接口
- 详细的控制台日志

## 最佳实践

### 1. 性能考虑

- 在应用启动时初始化分析系统
- 使用事件队列避免阻塞渲染
- 合理设置脚本延迟时间

### 2. 隐私合规

- 在收集数据前获取用户同意
- 提供清晰的隐私政策链接
- 允许用户撤回同意

### 3. 事件命名

- 使用清晰的事件名称
- 保持命名一致性
- 包含有意义的属性

### 4. 错误处理

- 不要依赖分析系统的可用性
- 处理初始化失败的情况
- 在测试环境中禁用或模拟分析

## 向后兼容性

新系统保持与旧API的向后兼容：

```typescript
// 旧的API仍然可用
window.voidixUnifiedAnalytics.trackBugReport('error', 'high');
window.voidixUnifiedAnalytics.trackFAQView('1', 'general');
window.voidixUnifiedAnalytics.trackCustomEvent('ui', 'click', 'button');
```

但建议使用新的API获得更好的类型安全和功能支持。

## 故障排除

### 常见问题

1. **分析脚本加载失败**
   - 检查网络连接
   - 验证配置ID是否正确
   - 查看控制台错误信息

2. **事件未出现在Analytics中**
   - 确认用户已同意数据收集
   - 检查分析系统是否已初始化
   - 验证事件参数格式

3. **开发环境中无法追踪**
   - 检查DEV_ANALYTICS_CONFIG配置
   - 确认调试模式是否启用
   - 查看控制台日志

### 调试命令

```javascript
// 在浏览器控制台中执行
import { getAnalyticsStatus } from '@/services/analytics';
console.log(getAnalyticsStatus());
```
