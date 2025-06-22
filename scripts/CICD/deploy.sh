#!/bin/bash

# =============================================================================
# Voidix网站简化部署脚本
# =============================================================================
# 功能：简单部署流程 - 更新配置 → 构建 → 部署 → 重载
# 域名：www.voidix.net
# 目标路径：/var/www/voidix.net
# 注意：代码应已通过CI/CD准备好，此脚本不包含git pull
# =============================================================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置变量
SERVER_PATH="/var/www/voidix.net"
NGINX_CONFIG_PATH="/etc/nginx/sites-available/voidix.net"
NGINX_SYMLINK_PATH="/etc/nginx/sites-enabled/voidix.net"
WEB_USER="www-data"
WEB_GROUP="www-data"

# 获取脚本所在目录（scripts/CICD/）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# 项目根目录（向上两级：CICD -> scripts -> project root）
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

echo "Debug: SCRIPT_DIR=$SCRIPT_DIR"
echo "Debug: PROJECT_DIR=$PROJECT_DIR"

# 日志函数
log_info() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')] INFO:${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')] SUCCESS:${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date '+%H:%M:%S')] ERROR:${NC} $1"
}

log_step() {
    echo -e "${YELLOW}[$(date '+%H:%M:%S')] STEP:${NC} $1"
}

# 检查权限
if [[ $EUID -ne 0 ]]; then
    log_error "需要root权限运行"
    echo "请使用: sudo $0"
    exit 1
fi

echo "🚀 开始简化部署..."

# 1. 更新nginx配置
log_step "更新Nginx配置"
cp "$SERVER_PATH/nginx-production.conf" "$NGINX_CONFIG_PATH"

# 创建软链接
if [[ -L "$NGINX_SYMLINK_PATH" ]]; then
    rm "$NGINX_SYMLINK_PATH"
fi
ln -s "$NGINX_CONFIG_PATH" "$NGINX_SYMLINK_PATH"
log_success "Nginx配置更新完成"

# 2. 测试nginx配置
log_step "测试Nginx配置"
if ! nginx -t; then
    log_error "Nginx配置测试失败"
    exit 1
fi
log_success "Nginx配置测试通过"

# 3. 构建项目
log_step "构建项目"
cd "$SERVER_PATH"
npm ci --production=false
npm run build

# 检查构建结果
if [[ ! -d "dist" ]] || [[ -z "$(ls -A dist 2>/dev/null)" ]]; then
    log_error "构建失败，dist目录不存在或为空"
    exit 1
fi
log_success "项目构建完成"

# 4. 重载nginx
log_step "重载Nginx服务"
systemctl reload nginx
if systemctl is-active --quiet nginx; then
    log_success "Nginx服务重载成功"
else
    log_error "Nginx服务重载失败"
    exit 1
fi

# 5. 简单健康检查
log_step "健康检查"
sleep 2
if curl -f -s --max-time 10 "https://www.voidix.net/health" > /dev/null; then
    log_success "🎉 部署完成！网站正常运行"
else
    log_error "健康检查失败，请手动检查网站状态"
    exit 1
fi

echo ""
echo "==============================================="
echo "✅ 部署成功完成"
echo "🌐 网站地址: https://www.voidix.net"
echo "📁 部署路径: $SERVER_PATH"
echo "⚙️  配置文件: $NGINX_CONFIG_PATH"
echo "==============================================="

echo "[Bing Webmaster] 正在批量提交新页面URL..."

# === Bing Webmaster API 配置 ===
SITEMAP_PATH="/var/www/voidix.net/dist/sitemap.xml"
BING_SITE_URL="https://www.voidix.net"

# 需要提交的URL列表自动从 sitemap.xml 读取
if [ ! -f "$SITEMAP_PATH" ]; then
  echo "[Bing Webmaster] 未找到 sitemap.xml，跳过URL提交。"
else
  # 解析 sitemap.xml，提取所有 <loc> 标签内容
  mapfile -t BING_URL_LIST < <(grep -oP '(?<=<loc>)[^<]+' "$SITEMAP_PATH")

  # 构造JSON数据
  BING_JSON_DATA=$(jq -n \
    --arg siteUrl "$BING_SITE_URL" \
    --argjson urlList "$(printf '%s\n' "${BING_URL_LIST[@]}" | jq -R . | jq -s .)" \
    '{siteUrl: $siteUrl, urlList: $urlList}')

  # 提交到Bing Webmaster API
  BING_RESPONSE=$(curl -s -X POST "https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=$BING_API_KEY" \
    -H "Content-Type: application/json; charset=utf-8" \
    -d "$BING_JSON_DATA")

  if echo "$BING_RESPONSE" | grep -q '"d":null'; then
    echo "[Bing Webmaster] URL批量提交成功！"
  else
    echo "[Bing Webmaster] URL提交失败，返回：$BING_RESPONSE"
  fi
fi

echo "==============================================="
