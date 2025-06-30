#!/bin/bash

# =============================================================================
# Voidix网站部署脚本 v2.0 - 模块化版本
# =============================================================================
# 功能：Git更新 → 更新配置 → 构建 → 压缩 → 部署 → 重载
# 特色：集成Git自动更新 + Brotli + Gzip预压缩（适合低并发服务器）
# 模块化：支持单独执行各个部署步骤
# 域名：www.voidix.net
# 目标路径：/var/www/voidix.net
# 优化：使用git stash + git pull自动更新代码仓库
# =============================================================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

log_module() {
    echo -e "${PURPLE}[$(date '+%H:%M:%S')] MODULE:${NC} $1"
}

# 显示帮助信息
show_help() {
    echo -e "${CYAN}Voidix 部署脚本 v2.0 - 模块化版本${NC}"
    echo ""
    echo "用法："
    echo "  $0 [选项]"
    echo ""
    echo "选项："
    echo "  -g, --git      仅更新Git代码仓库"
    echo "  -n, --nginx    仅更新Nginx配置"
    echo "  -b, --build    仅构建项目（包含压缩）"
    echo "  -c, --compress 仅压缩静态文件"
    echo "  -r, --reload   仅重载Nginx服务"
    echo "  -h, --help     显示此帮助信息"
    echo ""
    echo "组合选项："
    echo "  --git-build        Git更新 + 构建"
    echo "  --git-build-reload Git更新 + 构建 + 重载"
    echo "  --nginx-reload     Nginx配置更新 + 重载"
    echo "  --build-reload     构建 + 重载"
    echo ""
    echo "示例："
    echo "  $0                     # 完整部署（默认）"
    echo "  $0 --nginx             # 只更新Nginx配置"
    echo "  $0 --build             # 只构建项目"
    echo "  $0 --git-build         # 更新代码并构建"
    echo "  $0 --git-build-reload  # 更新代码、构建并重载"
    echo ""
    echo "注意：所有操作都需要root权限"
}

# 检查权限
check_permissions() {
    if [[ $EUID -ne 0 ]]; then
        log_error "需要root权限运行"
        echo "请使用: sudo $0"
        exit 1
    fi
}

# 1. Git更新代码模块
update_git() {
    log_module "Git更新代码仓库"
    cd "$SERVER_PATH"

    # 暂存任何本地更改
    log_info "暂存本地更改..."
    git stash push -m "Auto-stash before deployment $(date '+%Y-%m-%d %H:%M:%S')" || true

    # 获取远程更新
    log_info "获取远程更新..."
    git fetch origin

    # 检查当前分支状态
    CURRENT_BRANCH=$(git branch --show-current)

    if [[ -z "$CURRENT_BRANCH" ]]; then
        # 处理detached HEAD状态
        log_info "检测到detached HEAD状态，切换到主分支..."

        # 尝试确定目标分支（优先级：master > main > ci/deploy）
        TARGET_BRANCH=""
        if git show-ref --verify --quiet refs/remotes/origin/master; then
            TARGET_BRANCH="master"
        elif git show-ref --verify --quiet refs/remotes/origin/main; then
            TARGET_BRANCH="main"
        elif git show-ref --verify --quiet refs/remotes/origin/ci/deploy; then
            TARGET_BRANCH="ci/deploy"
        else
            log_error "无法找到有效的目标分支"
            git stash pop || true
            exit 1
        fi

        log_info "切换到分支: $TARGET_BRANCH"
        if ! git checkout -B "$TARGET_BRANCH" "origin/$TARGET_BRANCH"; then
            log_error "分支切换失败"
            git stash pop || true
            exit 1
        fi

        CURRENT_BRANCH="$TARGET_BRANCH"
    fi

    # 获取最新代码
    log_info "拉取最新代码到分支: $CURRENT_BRANCH"
    if ! git pull origin "$CURRENT_BRANCH"; then
        log_error "Git pull失败"
        # 尝试恢复暂存的更改
        git stash pop || true
        exit 1
    fi

    log_success "代码更新完成"
}

# 2. 更新nginx配置模块
update_nginx() {
    log_module "更新Nginx配置"

    # 备份当前配置
    if [[ -f "$NGINX_CONFIG_PATH" ]]; then
        cp "$NGINX_CONFIG_PATH" "$NGINX_CONFIG_PATH.backup.$(date +%Y%m%d_%H%M%S)"
        log_info "已备份当前Nginx配置"
    fi

    # 复制新配置
    cp "$SERVER_PATH/nginx-production.conf" "$NGINX_CONFIG_PATH"

    # 创建软链接
    if [[ -e "$NGINX_SYMLINK_PATH" ]]; then
        rm -f "$NGINX_SYMLINK_PATH"
    fi
    ln -s "$NGINX_CONFIG_PATH" "$NGINX_SYMLINK_PATH"

    # 测试配置
    log_info "测试Nginx配置..."
    if ! nginx -t; then
        log_error "Nginx配置测试失败"
        # 恢复备份
        if [[ -f "$NGINX_CONFIG_PATH.backup.$(date +%Y%m%d_%H%M%S)" ]]; then
            cp "$NGINX_CONFIG_PATH.backup.$(date +%Y%m%d_%H%M%S)" "$NGINX_CONFIG_PATH"
            log_info "已恢复备份配置"
        fi
        exit 1
    fi

    log_success "Nginx配置更新完成"
}

# 3. 构建项目模块
build_project() {
    log_module "构建项目"
    cd "$SERVER_PATH"

    # 安装依赖
    log_info "安装/更新依赖..."
    npm ci --production=false

    # 构建项目
    log_info "开始构建..."
    npm run build

    # 检查构建结果
    if [[ ! -d "dist" ]] || [[ -z "$(ls -A dist 2>/dev/null)" ]]; then
        log_error "构建失败，dist目录不存在或为空"
        exit 1
    fi

    log_success "项目构建完成"
}

# 4. 压缩静态文件模块
compress_files() {
    log_module "预压缩静态文件（Brotli + Gzip）"
    cd "$SERVER_PATH"

    # 配置变量
    DIST_DIR="./dist"
    MIN_SIZE=512  # 最小压缩文件大小（字节）

    if [[ ! -d "$DIST_DIR" ]]; then
        log_error "dist目录不存在，请先构建项目"
        exit 1
    fi

    log_info "开始预压缩，最小文件大小: ${MIN_SIZE} 字节"

    # 创建临时文件列表
    temp_filelist="/tmp/voidix_compress_files.txt"
    > "$temp_filelist"

    # 查找所有需要压缩的文件
    log_info "扫描需要压缩的文件..."
    find "$DIST_DIR" \( -name "*.js" -o -name "*.css" -o -name "*.svg" -o -name "*.json" -o -name "*.html" -o -name "*.xml" -o -name "*.txt" \) -type f > "$temp_filelist"

    # 计数器
    total_files=0
    gzip_files=0
    brotli_files=0
    skipped_files=0

    # 处理每个文件
    while IFS= read -r file; do
        if [[ -f "$file" ]]; then
            total_files=$((total_files + 1))

            # 检查文件大小
            file_size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null || echo 0)

            if [ "$file_size" -lt "$MIN_SIZE" ]; then
                skipped_files=$((skipped_files + 1))
                continue
            fi

            filename=$(basename "$file")

            # 生成Gzip文件（最高压缩级别）
            if gzip -9 -c "$file" > "$file.gz" 2>/dev/null; then
                gzip_size=$(stat -c%s "$file.gz" 2>/dev/null || stat -f%z "$file.gz" 2>/dev/null || echo 0)
                if [ "$gzip_size" -gt 0 ] && [ "$gzip_size" -lt "$file_size" ]; then
                    gzip_files=$((gzip_files + 1))
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
                        brotli_files=$((brotli_files + 1))
                        log_info "Brotli压缩: $filename ($(($file_size-$brotli_size)) 字节节省)"
                    else
                        rm -f "$file.br"
                    fi
                fi
            else
                log_info "警告: brotli命令不可用，跳过Brotli压缩"
            fi
        fi
    done < "$temp_filelist"

    # 清理临时文件
    rm -f "$temp_filelist"

    # 显示压缩统计
    log_success "预压缩完成！统计信息:"
    log_info "  📁 总文件: $total_files | 🗜️ Gzip: $gzip_files | 🚀 Brotli: $brotli_files | ⏭️ 跳过: $skipped_files"

    # 简单的总体效果统计
    if [ $gzip_files -gt 0 ] || [ $brotli_files -gt 0 ]; then
        log_info "  ✅ 压缩完成，提升网站加载速度"
        log_info "  💡 预期效果: Brotli可节省约80%带宽，Gzip节省约70%带宽"
    else
        log_info "  ⚠️  没有生成压缩文件，请检查文件大小和压缩工具"
    fi
}

# 5. 重载nginx服务模块
reload_nginx() {
    log_module "重载Nginx服务"

    # 再次测试配置
    log_info "最终测试Nginx配置..."
    if ! nginx -t; then
        log_error "Nginx配置测试失败，取消重载"
        exit 1
    fi

    # 重载服务
    nginx -s reload
    log_success "Nginx服务重载完成"
}

# 6. 设置文件权限模块
set_permissions() {
    log_module "设置文件权限"
    cd "$SERVER_PATH"

    if [[ -d "dist" ]]; then
        chown -R "$WEB_USER:$WEB_GROUP" dist/
        find dist/ -type f -exec chmod 644 {} \;
        find dist/ -type d -exec chmod 755 {} \;
        log_success "文件权限设置完成"
    else
        log_info "dist目录不存在，跳过权限设置"
    fi
}

# 显示部署完成信息
show_completion() {
    echo ""
    echo "==============================================="
    echo "✅ 部署完成"
    echo "🌐 网站地址: https://www.voidix.net"
    echo "📁 部署路径: $SERVER_PATH"
    echo "⚙️  配置文件: $NGINX_CONFIG_PATH"
    echo "🔄 Git更新: 自动暂存本地更改 + 拉取最新代码"
    echo "📦 压缩配置: Brotli + Gzip 预压缩文件"
    echo "💡 压缩收益: 预计节省约80%带宽"
    echo "==============================================="
}

# 主函数 - 解析参数并执行相应操作
main() {
    # 默认执行所有步骤
    DO_GIT=false
    DO_NGINX=false
    DO_BUILD=false
    DO_COMPRESS=false
    DO_RELOAD=false
    DO_PERMISSIONS=false
    DO_FULL_DEPLOY=true

    # 解析参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -g|--git)
                DO_GIT=true
                DO_FULL_DEPLOY=false
                ;;
            -n|--nginx)
                DO_NGINX=true
                DO_FULL_DEPLOY=false
                ;;
            -b|--build)
                DO_BUILD=true
                DO_COMPRESS=true
                DO_PERMISSIONS=true
                DO_FULL_DEPLOY=false
                ;;
            -c|--compress)
                DO_COMPRESS=true
                DO_FULL_DEPLOY=false
                ;;
            -r|--reload)
                DO_RELOAD=true
                DO_FULL_DEPLOY=false
                ;;
            --git-build)
                DO_GIT=true
                DO_BUILD=true
                DO_COMPRESS=true
                DO_PERMISSIONS=true
                DO_FULL_DEPLOY=false
                ;;
            --git-build-reload)
                DO_GIT=true
                DO_BUILD=true
                DO_COMPRESS=true
                DO_PERMISSIONS=true
                DO_RELOAD=true
                DO_FULL_DEPLOY=false
                ;;
            --nginx-reload)
                DO_NGINX=true
                DO_RELOAD=true
                DO_FULL_DEPLOY=false
                ;;
            --build-reload)
                DO_BUILD=true
                DO_COMPRESS=true
                DO_PERMISSIONS=true
                DO_RELOAD=true
                DO_FULL_DEPLOY=false
                ;;
            *)
                log_error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
        shift
    done

    # 检查权限
    check_permissions

    echo "📦 开始部署..."

    # 根据参数执行相应操作
    if [ "$DO_FULL_DEPLOY" = true ]; then
        # 完整部署
        update_git
        update_nginx
        build_project
        compress_files
        set_permissions
        reload_nginx
        show_completion
    else
        # 模块化执行
        [ "$DO_GIT" = true ] && update_git
        [ "$DO_NGINX" = true ] && update_nginx
        [ "$DO_BUILD" = true ] && build_project
        [ "$DO_COMPRESS" = true ] && compress_files
        [ "$DO_PERMISSIONS" = true ] && set_permissions
        [ "$DO_RELOAD" = true ] && reload_nginx

        log_success "✅ 指定操作完成"
    fi
}

# 执行主函数
main "$@"
