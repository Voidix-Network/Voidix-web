#!/bin/bash

# =============================================================================
# Voidix网站极致性能部署脚本
# =============================================================================
# 功能：更新配置 → 构建 → 极致压缩 → 部署 → 重载
# 特色：集成Brotli-11 + Gzip-9极致压缩（适合低并发高性能服务器）
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

echo "🏆 开始极致性能部署..."

# 1. 更新nginx配置
log_step "更新Nginx配置"
cp "$SERVER_PATH/nginx-production.conf" "$NGINX_CONFIG_PATH"

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

# 4. 🏆 极致压缩静态文件（低并发专用）
log_step "预压缩静态文件（Brotli-11 + Gzip-9）"

# 配置变量
DIST_DIR="./dist"
MIN_SIZE=512  # 最小压缩文件大小（字节）

# 计数器
total_files=0
gzip_files=0
brotli_files=0
skipped_files=0

# 查找需要压缩的文件类型
file_types=("*.js" "*.css" "*.svg" "*.json" "*.html" "*.xml" "*.txt")

log_info "开始预压缩，最小文件大小: ${MIN_SIZE} 字节"

for pattern in "${file_types[@]}"; do
    while IFS= read -r -d '' file; do
        ((total_files++))

        # 检查文件大小
        file_size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null || echo 0)

        if [ "$file_size" -lt "$MIN_SIZE" ]; then
            ((skipped_files++))
            continue
        fi

        filename=$(basename "$file")

        # 生成Gzip文件（最高压缩级别）
        if gzip -9 -c "$file" > "$file.gz" 2>/dev/null; then
            gzip_size=$(stat -c%s "$file.gz" 2>/dev/null || stat -f%z "$file.gz" 2>/dev/null || echo 0)
            if [ "$gzip_size" -gt 0 ] && [ "$gzip_size" -lt "$file_size" ]; then
                ((gzip_files++))
                log_info "Gzip压缩: $filename ($(($file_size-$gzip_size)) 字节节省)"
            else
                rm -f "$file.gz"
            fi
        fi

        # 生成Brotli文件（最高压缩级别）
        if command -v brotli &> /dev/null; then
            if brotli -q 11 -o "$file.br" "$file" 2>/dev/null; then
                brotli_size=$(stat -c%s "$file.br" 2>/dev/null || stat -f%z "$file.br" 2>/dev/null || echo 0)
                if [ "$brotli_size" -gt 0 ] && [ "$brotli_size" -lt "$file_size" ]; then
                    ((brotli_files++))
                    log_info "Brotli压缩: $filename ($(($file_size-$brotli_size)) 字节节省)"
                else
                    rm -f "$file.br"
                fi
            fi
        fi

    done < <(find "$DIST_DIR" -name "$pattern" -type f -print0 2>/dev/null)
done

# 显示压缩统计
log_success "预压缩完成！统计信息:"
log_info "  📁 总文件: $total_files | 🗜️ Gzip: $gzip_files | 🚀 Brotli: $brotli_files | ⏭️ 跳过: $skipped_files"

# 计算总体压缩效果
if [ $gzip_files -gt 0 ] || [ $brotli_files -gt 0 ]; then
    total_original_size=0
    total_gzip_size=0
    total_brotli_size=0

    for pattern in "${file_types[@]}"; do
        while IFS= read -r -d '' file; do
            file_size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null || echo 0)
            if [ "$file_size" -ge "$MIN_SIZE" ]; then
                total_original_size=$((total_original_size + file_size))

                if [ -f "$file.gz" ]; then
                    gzip_size=$(stat -c%s "$file.gz" 2>/dev/null || stat -f%z "$file.gz" 2>/dev/null || echo 0)
                    total_gzip_size=$((total_gzip_size + gzip_size))
                fi

                if [ -f "$file.br" ]; then
                    brotli_size=$(stat -c%s "$file.br" 2>/dev/null || stat -f%z "$file.br" 2>/dev/null || echo 0)
                    total_brotli_size=$((total_brotli_size + brotli_size))
                fi
            fi
        done < <(find "$DIST_DIR" -name "$pattern" -type f -print0 2>/dev/null)
    done

    if [ $total_original_size -gt 0 ]; then
        if [ $total_gzip_size -gt 0 ]; then
            gzip_ratio=$(echo "scale=1; ($total_original_size-$total_gzip_size)*100/$total_original_size" | bc -l 2>/dev/null || echo "计算失败")
            log_info "  🗜️ Gzip总压缩率: $gzip_ratio%"
        fi

        if [ $total_brotli_size -gt 0 ]; then
            brotli_ratio=$(echo "scale=1; ($total_original_size-$total_brotli_size)*100/$total_original_size" | bc -l 2>/dev/null || echo "计算失败")
            log_info "  🚀 Brotli总压缩率: $brotli_ratio%"
        fi
    fi
fi

# 5. 重载nginx
log_step "重载Nginx服务"
systemctl reload nginx
if systemctl is-active --quiet nginx; then
    log_success "Nginx服务重载成功"
else
    log_error "Nginx服务重载失败"
    exit 1
fi

# 6. 简单健康检查
log_step "健康检查"
sleep 2
if curl -f -s --max-time 10 "https://www.voidix.net/health" > /dev/null; then
    log_success "🏆 极致性能部署完成！网站正常运行"
else
    log_error "健康检查失败，请手动检查网站状态"
    exit 1
fi

echo ""
echo "==============================================="
echo "🏆 极致性能部署成功完成"
echo "🌐 网站地址: https://www.voidix.net"
echo "📁 部署路径: $SERVER_PATH"
echo "⚙️  配置文件: $NGINX_CONFIG_PATH"
echo "🚀 压缩配置: Brotli-11 + Gzip-9 + 预压缩文件"
echo "💡 压缩收益: 预计节省80%+带宽"
echo "==============================================="
