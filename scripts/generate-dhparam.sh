#!/bin/bash

# 🔥 生成2048位DH参数 - SSL Labs Key Exchange满分关键
# 此脚本用于生成高安全性的DH参数文件，确保DHE密码套件正常工作

echo "🔥 开始生成2048位DH参数 - 通常1-2分钟完成..."
echo "   用于SSL Labs Key Exchange满分评级"
echo ""

# 创建SSL目录（如果不存在）
sudo mkdir -p /etc/nginx/ssl

# 生成2048位DH参数（平衡安全性和性能，生产环境推荐）
echo "⚡ 生成2048位DH参数文件..."
sudo openssl dhparam -out /etc/nginx/ssl/dhparam.pem 2048

# 设置正确的权限
sudo chmod 600 /etc/nginx/ssl/dhparam.pem
sudo chown nginx:nginx /etc/nginx/ssl/dhparam.pem

echo ""
echo "✅ DH参数生成完成！"
echo "📁 文件位置: /etc/nginx/ssl/dhparam.pem"
echo "🔒 权限设置: 600 (仅nginx用户可读)"
echo ""
echo "🚀 现在可以重启nginx应用新的SSL配置："
echo "   sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "🏆 预期效果："
echo "   - SSL Labs Key Exchange评分将达到100分满分"
echo "   - 支持DHE密码套件，增强古董设备兼容性"
echo "   - 现代浏览器继续使用ECDHE（性能最佳）"
echo "   - 2048位DH参数：安全性足够 + 生成速度快"
