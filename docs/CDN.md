# Voidix CDN 代理服务

## 概述

Voidix CDN (cdn.voidix.net) 提供外部API代理和缓存服务，提高网站性能和可用性。

## 支持的服务

### Minecraft 头像 API
- **MC-Heads**: `https://cdn.voidix.net/mc-heads/{username}/{size}`
- **Minotar**: `https://cdn.voidix.net/minotar/{username}/{size}`
- **Crafatar**: `https://cdn.voidix.net/crafatar/{username}?size={size}&overlay=true`
- **缓存时间**: 1天

### UptimeRobot API
- **路径**: `https://cdn.voidix.net/uptime/{endpoint}`
- **缓存时间**: 5分钟

### Google Fonts
- **CSS**: `https://cdn.voidix.net/fonts/css/{css_path}`
- **文件**: `https://cdn.voidix.net/fonts/files/{font_path}`
- **缓存时间**: 7-30天

### 健康检查
- **状态**: `https://cdn.voidix.net/cdn-status`

## 使用示例

```javascript
// Minecraft头像
const avatar = `https://cdn.voidix.net/mc-heads/Notch/64`;

// UptimeRobot API
fetch('https://cdn.voidix.net/uptime/getMonitors', {
  method: 'POST',
  body: 'api_key=your_key&format=json'
});

// Google Fonts
<link rel="stylesheet" href="https://cdn.voidix.net/fonts/css/css2?family=Inter:wght@400;500;600;700&display=swap">
```

## 部署配置

### 主 nginx.conf 设置
```nginx
http {
    proxy_cache_path /var/cache/nginx/voidix levels=1:2 keys_zone=voidix_cache:10m inactive=60m;
    proxy_temp_path /var/cache/nginx/voidix_temp;
}
```

### 部署步骤
```bash
# 1. 创建缓存目录
sudo mkdir -p /var/cache/nginx/voidix{,_temp}
sudo chown -R nginx:nginx /var/cache/nginx/

# 2. 备份并部署配置
sudo cp /etc/nginx/sites-available/voidix.net{,.backup.$(date +%Y%m%d_%H%M%S)}
sudo cp nginx-production.conf /etc/nginx/sites-available/voidix.net

# 3. 测试并重载
sudo nginx -t && sudo systemctl reload nginx
```

### 验证测试
```bash
# CDN状态检查
curl -I https://cdn.voidix.net/cdn-status

# 头像代理测试
curl -I https://cdn.voidix.net/mc-heads/Notch/64

# 缓存状态验证
curl -I https://cdn.voidix.net/mc-heads/Notch/64 | grep X-Cache-Status
```

## 安全策略

- **分析JS排除**: Google Analytics、字节跳动等分析脚本不通过CDN代理
- **CORS配置**: 头像和字体允许跨域，API限制为voidix.net
- **HTTPS强制**: 仅支持HTTPS访问

## 注意事项

1. 需要支持 `*.voidix.net` 通配符SSL证书
2. 分析脚本必须直接加载，不可代理
3. 监控缓存目录磁盘空间使用
4. 定期检查外部API可用性

---

*最后更新: 2025年6月22日*