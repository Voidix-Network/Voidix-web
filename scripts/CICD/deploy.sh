#!/bin/bash

# =============================================================================
# Voidix网站智能部署脚本
# =============================================================================
# 功能：完整部署流程 - 配置集成 → 构建 → 压缩 → 部署 → 重载
# 域名：www.voidix.net
# 目标路径：/var/www/voidix.net
# 特性：智能压缩 + 预渲染 + 完整nginx配置替换
# 注意：适用于专用服务器，会完全替换nginx主配置
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
NGINX_MAIN_CONFIG="/etc/nginx/nginx.conf"
# NGINX_HTTP_CONFIG 已不再需要，配置已集成到主配置文件
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

# 创建主nginx.conf配置函数
create_nginx_main_config() {
    cat > "$NGINX_MAIN_CONFIG" << 'EOF'
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    # 基础配置
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    # 性能优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    # 客户端请求配置
    client_max_body_size 64m;
    client_body_buffer_size 128k;
    client_header_buffer_size 3m;
    large_client_header_buffers 4 256k;

    # ========================================================================
    # Voidix 智能压缩映射配置
    # ========================================================================

    # 压缩文件后缀映射
    map $http_accept_encoding $compression_suffix {
        default "";
        "~*zstd" ".zst";
        "~*br" ".br";
        "~*gzip" ".gz";
    }

    # 根据客户端支持选择最佳压缩格式
    map $http_accept_encoding $best_compression {
        default "";
        "~*zstd" "zstd";
        "~*br" "br";
        "~*gzip" "gzip";
    }

    # 压缩格式对应的 Content-Encoding 头
    map $best_compression $compression_encoding {
        default "";
        "zstd" "zstd";
        "br" "br";
        "gzip" "gzip";
    }

    # ========================================================================
    # CDN 代理缓存配置
    # ========================================================================

    # 代理缓存路径配置
    proxy_cache_path /var/cache/nginx/voidix
        levels=1:2
        keys_zone=voidix_cache:10m
        inactive=60m
        max_size=1g;

    proxy_temp_path /var/cache/nginx/voidix_temp;

    # ========================================================================
    # 速率限制配置
    # ========================================================================

    # CDN API 请求限制
    limit_req_zone $binary_remote_addr zone=cdn_api:10m rate=30r/m;

    # CDN 资源请求限制
    limit_req_zone $binary_remote_addr zone=cdn_assets:10m rate=60r/m;

    # 一般请求限制
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;

    # ========================================================================
    # 引入站点配置
    # ========================================================================
    include /etc/nginx/sites-enabled/*;
}
EOF
    log_success "主nginx.conf配置已更新（包含智能压缩映射）"
}

# 检查权限
if [[ $EUID -ne 0 ]]; then
    log_error "需要root权限运行"
    echo "请使用: sudo $0"
    exit 1
fi

echo "🚀 开始智能部署..."
echo "📦 配置项目：Voidix官网"
echo "🗜️ 压缩功能：zstd + brotli + gzip"
echo "🔧 配置模式：完整替换nginx配置"
echo ""

# 1. 更新nginx配置
log_step "更新Nginx配置"

# 备份原配置
log_info "备份原配置文件"
if [[ -f "$NGINX_MAIN_CONFIG" ]]; then
    cp "$NGINX_MAIN_CONFIG" "$NGINX_MAIN_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
fi
# HTTP配置已集成到主配置文件，无需单独备份

# HTTP块配置已集成到主配置文件中，无需单独部署

# 部署站点配置
log_info "部署站点配置"
cp "$SERVER_PATH/nginx-production.conf" "$NGINX_CONFIG_PATH"

# 确保sites-available和sites-enabled目录存在
mkdir -p /etc/nginx/sites-available
mkdir -p /etc/nginx/sites-enabled

# 创建必要的缓存目录
log_info "创建缓存目录"
mkdir -p /var/cache/nginx/voidix
mkdir -p /var/cache/nginx/voidix_temp
chown -R nginx:nginx /var/cache/nginx/ 2>/dev/null || chown -R www-data:www-data /var/cache/nginx/
chmod -R 755 /var/cache/nginx/

# 创建或更新主nginx.conf以包含我们的配置
log_info "更新主nginx.conf配置"
create_nginx_main_config

# 创建软链接
if [[ -e "$NGINX_SYMLINK_PATH" ]]; then
    rm -f "$NGINX_SYMLINK_PATH"
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

# 3. 构建项目（包含智能压缩）
log_step "构建项目（包含预渲染和智能压缩）"
cd "$SERVER_PATH"
npm ci --production=false

# 完整构建：TypeScript编译 → Vite构建 → 站点地图 → 预渲染 → 智能压缩
npm run build

# 检查构建结果
if [[ ! -d "dist" ]] || [[ -z "$(ls -A dist 2>/dev/null)" ]]; then
    log_error "构建失败，dist目录不存在或为空"
    exit 1
fi

# 检查压缩文件生成
log_info "验证压缩文件生成"
compressed_count=$(find dist -name "*.gz" -o -name "*.br" -o -name "*.zst" | wc -l)
if [[ $compressed_count -gt 0 ]]; then
    log_success "发现 $compressed_count 个压缩文件"
else
    log_error "警告：未发现压缩文件，请检查压缩脚本"
fi

log_success "项目构建完成（包含智能压缩）"

# 4. 重载nginx
log_step "重载Nginx服务"
systemctl reload nginx
if systemctl is-active --quiet nginx; then
    log_success "Nginx服务重载成功"
else
    log_error "Nginx服务重载失败"
    exit 1
fi

# 5. 健康检查（包含压缩验证）
log_step "健康检查"
sleep 2

# 基础健康检查
if curl -f -s --max-time 10 "https://www.voidix.net/health" > /dev/null; then
    log_success "✅ 网站基础健康检查通过"
else
    log_error "网站基础健康检查失败，请手动检查网站状态"
    exit 1
fi

# 压缩功能检查
log_info "验证压缩功能"
compression_status=$(curl -s --max-time 10 -H "Accept-Encoding: gzip, br, zstd" "https://www.voidix.net/compression-status" 2>/dev/null)
if [[ -n "$compression_status" ]]; then
    log_success "✅ 压缩功能验证通过"
    log_info "压缩状态: $compression_status"
else
    log_error "⚠️  压缩功能验证失败，但网站可正常访问"
fi

log_success "🎉 智能部署完成！网站正常运行"

echo ""
echo "==============================================="
echo "✅ 智能部署成功完成"
echo "🌐 网站地址: https://www.voidix.net"
echo "📁 部署路径: $SERVER_PATH"
echo "⚙️  主配置: $NGINX_MAIN_CONFIG（包含智能压缩）"
echo "🌍 站点配置: $NGINX_CONFIG_PATH"
echo "🗜️ 压缩支持: zstd > brotli > gzip > 原始"
echo "📊 压缩文件: $compressed_count 个"
echo "==============================================="
