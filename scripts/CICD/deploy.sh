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

    # 临时文件路径
    HASH_BEFORE="/tmp/voidix_html_hashes_before.txt"
    HASH_AFTER="/tmp/voidix_html_hashes_after.txt"
    CHANGED_FILES="/tmp/voidix_changed_files.txt"
    CHANGED_URLS="/tmp/voidix_changed_urls.txt"

    log_info "🔍 HTML变化检测配置："
    log_info "  ✅ 包含: 所有HTML页面"
    log_info "  ❌ 排除: 404/not-found页面（不需要搜索引擎索引）"
    log_info "  🔧 清理: 动态值（CSS transform、时间戳、随机数、版本参数）"
    log_info "  📋 规范化: scale(), translate*(), rotate*(), matrix*(), data-timestamp, _v等"
    log_info "  🎯 目标: 只检测真正的内容变化，忽略动画状态和缓存差异"
    log_info "  ⚠️  重要: 清理仅用于哈希计算，不会修改实际构建文件"

    # 记录构建前的HTML文件哈希
    log_info "记录构建前HTML文件状态..."
    > "$HASH_BEFORE"
    if [[ -d "dist" ]]; then
        # 计算总文件数和排除的文件数
        total_html_before=$(find dist -name "*.html" -type f | wc -l)
        find dist -name "*.html" -type f -exec sh -c '
            # 清理动态CSS值后计算哈希（注意：只影响哈希计算，不修改原文件）
            cleaned_content=$(cat "$1" | \
                sed "s/scale([0-9.]*)/scale(NORMALIZED)/g" | \
                sed "s/translateY([0-9.-]*px)/translateY(NORMALIZEDpx)/g" | \
                sed "s/translateX([0-9.-]*px)/translateX(NORMALIZEDpx)/g" | \
                sed "s/translate([0-9.-]*px, [0-9.-]*px)/translate(NORMALIZEDpx, NORMALIZEDpx)/g" | \
                sed "s/translate3d([0-9.-]*px, [0-9.-]*px, [0-9.-]*px)/translate3d(NORMALIZEDpx, NORMALIZEDpx, NORMALIZEDpx)/g" | \
                sed "s/rotate([0-9.-]*deg)/rotate(NORMALIZEDdeg)/g" | \
                sed "s/rotateX([0-9.-]*deg)/rotateX(NORMALIZEDdeg)/g" | \
                sed "s/rotateY([0-9.-]*deg)/rotateY(NORMALIZEDdeg)/g" | \
                sed "s/rotateZ([0-9.-]*deg)/rotateZ(NORMALIZEDdeg)/g" | \
                sed "s/skew([0-9.-]*deg, [0-9.-]*deg)/skew(NORMALIZEDdeg, NORMALIZEDdeg)/g" | \
                sed "s/matrix([0-9.,-]*)/matrix(NORMALIZED)/g" | \
                sed "s/matrix3d([0-9.,-]*)/matrix3d(NORMALIZED)/g" | \
                sed "s/data-timestamp=\"[0-9]*\"/data-timestamp=\"NORMALIZED\"/g" | \
                sed "s/data-random=\"[0-9]*\"/data-random=\"NORMALIZED\"/g" | \
                sed "s/_v=[0-9]*/_v=NORMALIZED/g")
            echo "$(echo "$cleaned_content" | md5sum | cut -d" " -f1) $1"
        ' _ {} \; | grep -v -E "(404|not-found|notfound)" > "$HASH_BEFORE" 2>/dev/null || true
        html_before_count=$(wc -l < "$HASH_BEFORE" 2>/dev/null || echo 0)
        excluded_before=$((total_html_before - html_before_count))
        log_info "构建前发现 $html_before_count 个HTML文件（已排除 $excluded_before 个404/not-found页面）"

        # 如果是第一次构建（没有dist目录或文件很少），设置标记
        if [[ "$html_before_count" -eq 0 ]]; then
            log_info "首次构建检测：将跳过URL提交以避免全量提交"
            echo "FIRST_BUILD=true" > "/tmp/voidix_build_mode.txt"
        fi
    else
        log_info "构建前未发现dist目录，标记为首次构建"
        echo "FIRST_BUILD=true" > "/tmp/voidix_build_mode.txt"
        html_before_count=0
        total_html_before=0
        excluded_before=0
    fi

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

    # 记录构建后的HTML文件哈希
    log_info "记录构建后HTML文件状态..."
    > "$HASH_AFTER"
    # 计算总文件数和排除的文件数
    total_html_after=$(find dist -name "*.html" -type f | wc -l)
    find dist -name "*.html" -type f -exec sh -c '
        # 清理动态CSS值后计算哈希（注意：只影响哈希计算，不修改原文件）
        cleaned_content=$(cat "$1" | \
            sed "s/scale([0-9.]*)/scale(NORMALIZED)/g" | \
            sed "s/translateY([0-9.-]*px)/translateY(NORMALIZEDpx)/g" | \
            sed "s/translateX([0-9.-]*px)/translateX(NORMALIZEDpx)/g" | \
            sed "s/translate([0-9.-]*px, [0-9.-]*px)/translate(NORMALIZEDpx, NORMALIZEDpx)/g" | \
            sed "s/translate3d([0-9.-]*px, [0-9.-]*px, [0-9.-]*px)/translate3d(NORMALIZEDpx, NORMALIZEDpx, NORMALIZEDpx)/g" | \
            sed "s/rotate([0-9.-]*deg)/rotate(NORMALIZEDdeg)/g" | \
            sed "s/rotateX([0-9.-]*deg)/rotateX(NORMALIZEDdeg)/g" | \
            sed "s/rotateY([0-9.-]*deg)/rotateY(NORMALIZEDdeg)/g" | \
            sed "s/rotateZ([0-9.-]*deg)/rotateZ(NORMALIZEDdeg)/g" | \
            sed "s/skew([0-9.-]*deg, [0-9.-]*deg)/skew(NORMALIZEDdeg, NORMALIZEDdeg)/g" | \
            sed "s/matrix([0-9.,-]*)/matrix(NORMALIZED)/g" | \
            sed "s/matrix3d([0-9.,-]*)/matrix3d(NORMALIZED)/g" | \
            sed "s/data-timestamp=\"[0-9]*\"/data-timestamp=\"NORMALIZED\"/g" | \
            sed "s/data-random=\"[0-9]*\"/data-random=\"NORMALIZED\"/g" | \
            sed "s/_v=[0-9]*/_v=NORMALIZED/g")
        echo "$(echo "$cleaned_content" | md5sum | cut -d" " -f1) $1"
    ' _ {} \; | grep -v -E "(404|not-found|notfound)" > "$HASH_AFTER" 2>/dev/null || true
    html_after_count=$(wc -l < "$HASH_AFTER" 2>/dev/null || echo 0)
    excluded_after=$((total_html_after - html_after_count))
    log_info "构建后发现 $html_after_count 个HTML文件（已排除 $excluded_after 个404/not-found页面）"

    # 显示构建前后对比
    echo ""
    log_info "📊 构建前后对比："
    log_info "  构建前HTML文件: $html_before_count (总计: $total_html_before)"
    log_info "  构建后HTML文件: $html_after_count (总计: $total_html_after)"
    log_info "  排除404页面: 构建前 $excluded_before 个，构建后 $excluded_after 个"
    if [[ "$html_after_count" -gt "$html_before_count" ]]; then
        new_files=$((html_after_count - html_before_count))
        log_info "  ✅ 新增有效文件: $new_files"
    elif [[ "$html_after_count" -lt "$html_before_count" ]]; then
        removed_files=$((html_before_count - html_after_count))
        log_info "  ❌ 删除有效文件: $removed_files"
    else
        log_info "  🔄 有效文件数量无变化"
    fi
    echo ""

    # 检测变化的文件
    log_info "检测HTML文件变化..."
    > "$CHANGED_FILES"

        # 找出新增和修改的文件
    while IFS= read -r line; do
        if [[ -n "$line" ]]; then
            hash_after=$(echo "$line" | cut -d' ' -f1)
            file_path=$(echo "$line" | cut -d' ' -f2-)

            # 检查文件在构建前是否存在且哈希是否相同
            hash_before=$(grep " $file_path$" "$HASH_BEFORE" 2>/dev/null | cut -d' ' -f1 || echo "")

            if [[ -z "$hash_before" ]]; then
                # 新增文件
                echo "$file_path" >> "$CHANGED_FILES"
                log_info "新增文件: $file_path"
                if [[ -f "$file_path" ]]; then
                    file_size=$(stat -c%s "$file_path" 2>/dev/null || stat -f%z "$file_path" 2>/dev/null || echo "未知")
                    log_info "  📏 文件大小: $file_size 字节"
                    # 显示HTML标题（如果存在）
                    title=$(grep -o '<title[^>]*>[^<]*</title>' "$file_path" 2>/dev/null | sed 's/<[^>]*>//g' | head -1 || echo "")
                    if [[ -n "$title" ]]; then
                        log_info "  📝 页面标题: $title"
                    fi
                fi
            elif [[ "$hash_before" != "$hash_after" ]]; then
                # 修改文件
                echo "$file_path" >> "$CHANGED_FILES"
                log_info "修改文件: $file_path"
                log_info "  🔄 哈希变化: $hash_before → $hash_after"
                if [[ -f "$file_path" ]]; then
                    file_size=$(stat -c%s "$file_path" 2>/dev/null || stat -f%z "$file_path" 2>/dev/null || echo "未知")
                    log_info "  📏 当前大小: $file_size 字节"
                    # 显示HTML标题（如果存在）
                    title=$(grep -o '<title[^>]*>[^<]*</title>' "$file_path" 2>/dev/null | sed 's/<[^>]*>//g' | head -1 || echo "")
                    if [[ -n "$title" ]]; then
                        log_info "  📝 页面标题: $title"
                    fi
                    # 显示最后修改时间
                    mod_time=$(stat -c%y "$file_path" 2>/dev/null | cut -d. -f1 || stat -f%Sm "$file_path" 2>/dev/null || echo "未知")
                    log_info "  ⏰ 修改时间: $mod_time"
                fi
            fi
        fi
    done < "$HASH_AFTER"

        # 检查是否为首次构建
    BUILD_MODE="normal"
    if [[ -f "/tmp/voidix_build_mode.txt" ]]; then
        BUILD_MODE=$(cat "/tmp/voidix_build_mode.txt" | grep "FIRST_BUILD=true" && echo "first" || echo "normal")
    fi

    # 生成对应的URL列表
    > "$CHANGED_URLS"
    if [[ -s "$CHANGED_FILES" ]]; then
        changed_count=$(wc -l < "$CHANGED_FILES" 2>/dev/null || echo 0)

        if [[ "$BUILD_MODE" == "first" ]]; then
            log_info "首次构建模式：检测到 $changed_count 个HTML文件，但将跳过URL提交"
            log_info "这是为了避免向搜索引擎API提交所有页面，节省API限额"
            # 清空URL文件
            > "$CHANGED_URLS"
        else
            # 正常模式：生成URL列表
            while IFS= read -r file_path; do
                if [[ -n "$file_path" ]]; then
                    # 将文件路径转换为URL
                    # 移除 dist/ 前缀，处理 index.html
                    url_path=$(echo "$file_path" | sed 's|^dist/||' | sed 's|/index\.html$|/|' | sed 's|\.html$||')

                    # 确保以 / 开头
                    if [[ ! "$url_path" =~ ^/ ]]; then
                        url_path="/$url_path"
                    fi

                    # 生成完整URL
                    full_url="https://www.voidix.net$url_path"
                    echo "$full_url" >> "$CHANGED_URLS"
                fi
            done < "$CHANGED_FILES"

                        url_count=$(wc -l < "$CHANGED_URLS" 2>/dev/null || echo 0)
            log_success "检测到 $changed_count 个HTML文件发生变化，生成 $url_count 个URL"

            if [[ "$url_count" -gt 0 ]]; then
                log_info "文件→URL映射关系:"
                # 同时读取文件和URL，显示对应关系
                paste "$CHANGED_FILES" "$CHANGED_URLS" | while IFS=$'\t' read -r file_path url; do
                    if [[ -n "$file_path" && -n "$url" ]]; then
                        log_info "  📄 $file_path"
                        log_info "  🔗 $url"
                        echo ""
                    fi
                done

                echo ""
                log_info "📊 变化统计:"
                log_info "  📁 变化文件数: $changed_count"
                log_info "  🔗 生成URL数: $url_count"
                log_info "  ❌ 排除404页面: 自动过滤，不会提交"
                log_info "  🔧 动态值清理: 已规范化transform/时间戳/随机数等"
                log_info "  💰 节省API调用: 与全量提交相比节省 $(echo "scale=1; (1 - $url_count/20) * 100" | bc 2>/dev/null || echo "大量") %"
            fi
        fi
    else
        log_info "没有检测到HTML文件变化"
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

# 7. 提交变化的URL到搜索引擎
submit_changed_urls() {
    log_module "提交变化的URL到搜索引擎"

    # 检查是否有变化的URL文件
    CHANGED_URLS="/tmp/voidix_changed_urls.txt"

    if [[ ! -f "$CHANGED_URLS" ]]; then
        log_info "未找到变化的URL文件，跳过URL提交"
        return 0
    fi

    if [[ ! -s "$CHANGED_URLS" ]]; then
        # 检查是否为首次构建
        if [[ -f "/tmp/voidix_build_mode.txt" && $(cat "/tmp/voidix_build_mode.txt" | grep "FIRST_BUILD=true") ]]; then
            log_info "首次构建模式：已自动跳过URL提交，节省API限额"
        else
            log_info "没有检测到HTML文件变化，跳过URL提交"
        fi
        return 0
    fi

    # 计算要提交的URL数量
    url_count=$(wc -l < "$CHANGED_URLS" 2>/dev/null || echo 0)

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
    if bash "$SUBMIT_SCRIPT" -f "$CHANGED_URLS"; then
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
