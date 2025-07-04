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

# 获取脚本所在目录（scripts/CICD/）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# 项目根目录（向上两级：CICD -> scripts -> project root）
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

# 配置变量
SERVER_PATH="$PROJECT_DIR"  # 使用项目根目录作为服务器路径
NGINX_CONFIG_PATH="/etc/nginx/sites-available/voidix.net"
NGINX_SYMLINK_PATH="/etc/nginx/sites-enabled/voidix.net"
WEB_USER="www-data"
WEB_GROUP="www-data"

echo "Debug: SCRIPT_DIR=$SCRIPT_DIR"
echo "Debug: PROJECT_DIR=$PROJECT_DIR"
echo "Debug: SERVER_PATH=$SERVER_PATH"

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
    echo "  -b, --build    仅构建项目（包含压缩和变化检测）"
    echo "  -c, --compress 仅压缩静态文件"
    echo "  -r, --reload   仅重载Nginx服务"
    echo "  -s, --submit   仅提交变化的URL到搜索引擎"
    echo "  --force-submit 强制提交所有URL（忽略首次构建检测）"
    echo "  -h, --help     显示此帮助信息"
    echo ""
    echo "组合选项："
    echo "  --git-build         Git更新 + 构建 + URL提交"
    echo "  --git-build-reload  Git更新 + 构建 + URL提交 + 重载"
    echo "  --nginx-reload      Nginx配置更新 + 重载"
    echo "  --git-nginx-reload  Git更新 + Nginx配置更新 + 重载"
    echo "  --build-reload      构建 + URL提交 + 重载"
    echo "  --build-submit      构建 + URL提交"
    echo ""
    echo "示例："
    echo "  $0                     # 完整部署（默认）"
    echo "  $0 --nginx             # 只更新Nginx配置"
    echo "  $0 --build             # 只构建项目（含变化检测）"
    echo "  $0 --git-build         # 更新代码、构建并提交变化URL"
    echo "  $0 --git-build-reload  # 更新代码、构建、提交URL并重载"
    echo "  $0 --submit            # 只提交变化的URL"
    echo "  $0 --force-submit      # 强制提交所有URL（忽略首次构建检测）"
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

# 3. 构建项目模块（含HTML变化检测）
build_project() {
    log_module "构建项目"
    cd "$SERVER_PATH"

    # 临时文件和目录路径
    local dist_before_dir="/tmp/voidix_dist_before_build"
    local dist_after_dir="$SERVER_PATH/dist"
    local changed_files_log="/tmp/voidix_changed_files.txt"
    local changed_urls_log="/tmp/voidix_changed_urls.txt"

    # 清理上次的日志
    > "$changed_files_log"
    > "$changed_urls_log"

    log_info "🔍 HTML变化检测配置："
    log_info "  - 备份当前dist目录用于对比"
    log_info "  - 规范化处理动态值（CSS动画、时间戳等）"
    log_info "  - 对比规范化后的文件内容以检测真实变化"
    log_info "  - 排除404页面"

    # 1. 备份当前dist目录
    if [ -d "$dist_after_dir" ]; then
        log_info "备份当前 'dist' 目录到 '$dist_before_dir'..."
        rm -rf "$dist_before_dir"
        mv "$dist_after_dir" "$dist_before_dir"
        log_success "'dist' 目录已备份"
    else
        log_info "'dist' 目录不存在，跳过备份。所有生成的文件将被视为新文件。"
        mkdir -p "$dist_before_dir" # 确保目录存在以避免后续命令失败
    fi

    # 2. 运行构建命令 (npm run build)
    log_step "执行构建命令 (npm run build)..."
    if ! npm run build; then
        log_error "项目构建失败"
        # 恢复备份的dist目录
        if [ -d "$dist_before_dir/dist" ]; then # 在某些情况下，mv后目录结构会变成/tmp/voidix_dist_before_build/dist
            mv "$dist_before_dir/dist" "$dist_after_dir"
        else
            mv "$dist_before_dir" "$dist_after_dir"
        fi
        log_info "已恢复构建前的 'dist' 目录"
        exit 1
    fi
    log_success "项目构建完成"

    # 3. 对比文件并检测变化
    log_step "对比构建前后的HTML文件..."
    if [ ! -d "$dist_after_dir" ]; then
        log_error "构建后 'dist' 目录未找到！"
        exit 1
    fi

    local changed_count=0
    # 遍历构建后的所有HTML文件
    find "$dist_after_dir" -name "*.html" -type f | while read -r new_file; do
        # 排除404页面
        if echo "$new_file" | grep -qE "(404|not-found|notfound)"; then
            log_info "⏭️  排除404页面: $new_file"
            continue
        fi

        local relative_path="${new_file#$dist_after_dir/}"
        local old_file="$dist_before_dir/$relative_path"
        local is_new=false
        local has_changed=false

        if [ ! -f "$old_file" ]; then
            is_new=true
            has_changed=true
        else
            # 规范化文件内容以进行比较
            local cleaned_new_file_content
            cleaned_new_file_content=$(sed -E \
                -e 's/translate[XY]\([0-9.-]+(px|em|rem|%|vw|vh)\)/translate(NORMALIZED)/g' \
                -e 's/scale\([0-9.-]+\)/scale(NORMALIZED)/g' \
                -e 's/rotate\([0-9.-]+deg\)/rotate(NORMALIZED)/g' \
                -e 's/opacity: [0-9.]+/opacity: NORMALIZED/g' \
                -e 's/transition-delay: [0-9.]+s/transition-delay: NORMALIZED/g' \
                -e 's/([?&])v=[0-9a-zA-Z._-]+/\1v=NORMALIZED/g' \
                -e 's/最后更新: [0-9]{2}:[0-9]{2}:[0-9]{2}/最后更新: NORMALIZED/g' \
                -e '/[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}/d' \
                -e 's/data-timestamp="[0-9]+"/data-timestamp="NORMALIZED"/g' \
                "$new_file")

            local cleaned_old_file_content
            cleaned_old_file_content=$(sed -E \
                -e 's/translate[XY]\([0-9.-]+(px|em|rem|%|vw|vh)\)/translate(NORMALIZED)/g' \
                -e 's/scale\([0-9.-]+\)/scale(NORMALIZED)/g' \
                -e 's/rotate\([0-9.-]+deg\)/rotate(NORMALIZED)/g' \
                -e 's/opacity: [0-9.]+/opacity: NORMALIZED/g' \
                -e 's/transition-delay: [0-9.]+s/transition-delay: NORMALIZED/g' \
                -e 's/([?&])v=[0-9a-zA-Z._-]+/\1v=NORMALIZED/g' \
                -e 's/最后更新: [0-9]{2}:[0-9]{2}:[0-9]{2}/最后更新: NORMALIZED/g' \
                -e '/[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}/d' \
                -e 's/data-timestamp="[0-9]+"/data-timestamp="NORMALIZED"/g' \
                "$old_file")

            # 比较规范化后的内容
            if [ "$cleaned_new_file_content" != "$cleaned_old_file_content" ]; then
                has_changed=true
            fi
        fi

        # 如果是新文件或内容有变化，则记录
        if [ "$has_changed" = true ]; then
            if [ "$is_new" = true ]; then
                log_success "✨ 新增文件: $relative_path"
            else
                log_success "🔄 内容变化: $relative_path"
            fi
            echo "$relative_path" >> "$changed_files_log"
            changed_count=$((changed_count + 1))
        else
            log_info "👌 内容未变: $relative_path"
        fi
    done

    # 4. 生成URL列表
    log_step "生成变化的URL列表..."
    if [ -s "$changed_files_log" ]; then
        map_files_to_urls "$changed_files_log" > "$changed_urls_log"
        local url_count
        url_count=$(wc -l < "$changed_urls_log")
        log_success "已生成 $url_count 个变化的URL"
        echo -e "${CYAN}📋 即将提交的URL列表：${NC}"
        while read -r url; do
            echo -e "  🔗 ${PURPLE}$url${NC}"
        done < "$changed_urls_log"
    else
        log_info "没有检测到任何内容变化，无需提交URL。"
    fi
}

# 函数：将文件路径映射为URL
map_files_to_urls() {
    local file_list="$1"
    local base_url="https://www.voidix.net"

    while read -r file; do
        local url_path
        # 特殊处理index.html -> /
        if [[ "$(basename "$file")" == "index.html" ]]; then
            # 如果是根目录的index.html
            if [[ "$(dirname "$file")" == "." || "$(dirname "$file")" == "dist" || "$(dirname "$file")" == "$SERVER_PATH/dist" ]]; then
                 url_path="/"
            else
                 # 如果是子目录的index.html, e.g., about/index.html -> /about/
                 url_path="/$(dirname "$file")/"
            fi
        else
            # 移除.html后缀
            url_path="/${file%.html}"
        fi

        # 移除路径中的'dist/'前缀
        url_path=$(echo "$url_path" | sed 's#^/dist/##')
        # 确保路径以/开头
        if [[ ! "$url_path" =~ ^/ ]]; then
            url_path="/$url_path"
        fi
        # 修正双斜杠
        url_path=$(echo "$url_path" | sed 's#//#/#g')

        echo "${base_url}${url_path}"
    done < "$file_list"
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

# 7. 提交变化的URL到搜索引擎
submit_changed_urls() {
    log_module "提交变化的URL到搜索引擎"

    # 检查是否有变化的URL文件
    CHANGED_URLS_LOG="/tmp/voidix_changed_urls.txt"

    if [[ ! -f "$CHANGED_URLS_LOG" ]]; then
        log_info "未找到变化的URL文件，跳过URL提交"
        return 0
    fi

    if [[ ! -s "$CHANGED_URLS_LOG" ]]; then
        # 检查是否为首次构建
        if [[ -f "/tmp/voidix_build_mode.txt" && $(cat "/tmp/voidix_build_mode.txt" | grep "FIRST_BUILD=true") ]]; then
            log_info "🚫 首次构建模式：已自动跳过URL提交，节省API限额"
            log_info "💡 这是正常的！后续部署会智能检测变化并只提交修改的页面"
        else
            log_info "✅ 没有检测到HTML文件变化，跳过URL提交"
            log_info "💰 节省API限额：只有真正变化的页面才会被提交"
        fi
        return 0
    fi

    # 计算要提交的URL数量
    url_count=$(wc -l < "$CHANGED_URLS_LOG" 2>/dev/null || echo 0)

    if [[ "$url_count" -eq 0 ]]; then
        log_info "没有要提交的URL，跳过URL提交"
        return 0
    fi

    log_info "准备提交 $url_count 个变化的URL到搜索引擎..."

    # 调用submitUrls.sh脚本提交变化的URL
    SUBMIT_SCRIPT="$SCRIPT_DIR/submitUrls.sh"

    if [[ ! -f "$SUBMIT_SCRIPT" ]]; then
        log_error "未找到URL提交脚本: $SUBMIT_SCRIPT"
        return 1
    fi

    # 使用-f参数传递URL文件
    if bash "$SUBMIT_SCRIPT" -f "$CHANGED_URLS_LOG"; then
        log_success "变化的URL提交成功！节省了API限额"
    else
        log_error "URL提交失败，请检查网络连接和API配置"
        return 1
    fi

    # 清理临时文件
    rm -f "/tmp/voidix_html_hashes_before.txt" \
          "/tmp/voidix_html_hashes_after.txt" \
          "/tmp/voidix_changed_files.txt" \
          "/tmp/voidix_changed_urls.txt" \
          "/tmp/voidix_build_mode.txt"

    log_info "已清理临时文件"
}

# 显示部署完成信息
show_completion() {
    echo ""
    echo "==============================================="
    echo "✅ 部署完成"
    echo "🌐 网站地址: https://www.voidix.net"
    echo "📁 项目路径: $SERVER_PATH"
    echo "⚙️  配置文件: $NGINX_CONFIG_PATH"
    echo "🔄 Git更新: 自动暂存本地更改 + 拉取最新代码"
    echo "📦 压缩配置: Brotli + Gzip 预压缩文件"
    echo "🔍 变化检测: 智能检测HTML文件变化"
    echo "🚀 URL提交: 精准提交变化的URL，节省API限额"
    echo "💡 优化效果: 预计节省约80%带宽 + 智能SEO更新"
    echo "==============================================="
}

# 主函数 - 解析参数并执行相应操作
main() {
    check_permissions

    # 如果没有参数，执行完整部署
    if [ $# -eq 0 ]; then
        log_step "开始完整部署流程..."
        update_git
        update_nginx
        build_project
        compress_files
        set_permissions
        submit_changed_urls
        reload_nginx
        show_completion
        exit 0
    fi

    # 解析参数
    while [[ "$1" != "" ]]; do
        case $1 in
            -g | --git)
                update_git
                shift
                ;;
            -n | --nginx)
                update_nginx
                shift
                ;;
            -b | --build)
                build_project
                compress_files
                set_permissions
                shift
                ;;
            -c | --compress)
                compress_files
                set_permissions
                shift
                ;;
            -r | --reload)
                reload_nginx
                shift
                ;;
            -s | --submit)
                submit_changed_urls
                shift
                ;;
            --force-submit)
                # 强制提交模式：从sitemap读取所有URL并提交
                log_module "强制提交所有URL到搜索引擎"
                SUBMIT_SCRIPT="$SCRIPT_DIR/submitUrls.sh"
                if [[ -f "$SUBMIT_SCRIPT" ]]; then
                    bash "$SUBMIT_SCRIPT"
                    log_success "强制URL提交完成"
                else
                    log_error "未找到URL提交脚本: $SUBMIT_SCRIPT"
                fi
                shift
                ;;
            --git-build)
                update_git
                build_project
                compress_files
                set_permissions
                submit_changed_urls
                shift
                ;;
            --git-build-reload)
                update_git
                build_project
                compress_files
                set_permissions
                submit_changed_urls
                reload_nginx
                shift
                ;;
            --nginx-reload)
                update_nginx
                reload_nginx
                shift
                ;;
            --git-nginx-reload)
                update_git
                update_nginx
                reload_nginx
                shift
                ;;
            --build-reload)
                build_project
                compress_files
                set_permissions
                submit_changed_urls
                reload_nginx
                shift
                ;;
            --build-submit)
                build_project
                compress_files
                set_permissions
                submit_changed_urls
                shift
                ;;
            -h | --help)
                show_help
                exit 0
                ;;
            *)
                log_error "未知选项: $1"
                show_help
                exit 1
                ;;
        esac
    done

    log_success "所有请求的操作已完成"
}

# 运行主函数
main "$@"
