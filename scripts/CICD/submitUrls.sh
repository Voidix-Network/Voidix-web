#!/bin/bash

# scripts/CICD/submitUrls.sh
# 用于批量提交 sitemap URL 到 Bing 和 Baidu Webmaster API
# 支持精准提交指定URL以节省API限额

# 显示帮助信息
show_help() {
    echo "用法："
    echo "  $0                    # 提交sitemap中的所有URL"
    echo "  $0 url1 url2 url3     # 提交指定的URL列表"
    echo "  $0 -f urls.txt        # 从文件读取URL列表"
    echo ""
    echo "选项："
    echo "  -f, --file FILE       从文件读取URL列表（每行一个URL）"
    echo "  -h, --help           显示此帮助信息"
}

# 解析命令行参数
CUSTOM_URLS=""
URL_FILE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--file)
            URL_FILE="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        -*)
            echo "未知选项: $1"
            show_help
            exit 1
            ;;
        *)
            # 收集URL参数
            CUSTOM_URLS="${CUSTOM_URLS}$1"$'\n'
            shift
            ;;
    esac
done

echo "开始提交 URL..."

# 定义路径 (相对于项目根目录)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
SITEMAP_PATH="${PROJECT_ROOT}/dist/sitemap.xml"
ENV_FILE="${PROJECT_ROOT}/.env.local"
BING_SITE_URL="https://www.voidix.net"
BAIDU_SITE_URL="https://www.voidix.net"

# 获取环境变量
# 注意：在 CI/CD 环境中，这些变量通常直接作为环境变量提供
# 如果在本地运行，需要确保 .env.local 文件存在并已加载
if [ -f "${ENV_FILE}" ]; then
  sed -i 's/\r$//' "${ENV_FILE}"
fi

if [ -f "${ENV_FILE}" ]; then
  source "${ENV_FILE}"
else
  echo "[Multi Submit] 未找到 .env.local，请确保环境变量已设置。"
  exit 1
fi

if [ -z "${BING_API_KEY}" ]; then
  echo "[Multi Submit] 环境变量 BING_API_KEY 未设置。"
  exit 1
fi

if [ -z "${BAIDU_API_KEY}" ]; then
  echo "[Multi Submit] 环境变量 BAIDU_API_KEY 未设置。"
  exit 1
fi

# 获取要提交的URL列表
if [ -n "${URL_FILE}" ]; then
  # 从文件读取URL列表
  if [ ! -f "${URL_FILE}" ]; then
    echo "[Multi Submit] URL文件不存在: ${URL_FILE}"
    exit 1
  fi
  URL_LIST=$(cat "${URL_FILE}" | grep -v '^$' | grep -v '^#')
  echo "[Multi Submit] 从文件读取了 $(echo "${URL_LIST}" | wc -l) 个URL"
elif [ -n "${CUSTOM_URLS}" ]; then
  # 使用命令行传入的URL
  URL_LIST=$(echo "${CUSTOM_URLS}" | grep -v '^$')
  echo "[Multi Submit] 接收到 $(echo "${URL_LIST}" | wc -l) 个自定义URL"
else
  # 默认从sitemap.xml读取所有URL
  if [ ! -f "${SITEMAP_PATH}" ]; then
    echo "[Multi Submit] 未找到 sitemap.xml，跳过URL提交。"
    exit 0
  fi

  # 解析 sitemap.xml，提取所有 <loc> 标签内容
  URL_LIST=$(grep -oP '(?<=<loc>)[^<]+(?=</loc>)' "${SITEMAP_PATH}")
  echo "[Multi Submit] 从sitemap.xml读取了 $(echo "${URL_LIST}" | wc -l) 个URL"
fi

if [ -z "${URL_LIST}" ]; then
  echo "[Multi Submit] 没有找到要提交的URL，跳过提交。"
  exit 0
fi

# 将 URL 列表转换为 JSON 数组格式，用于 Bing
BING_URL_ARRAY=$(echo "${URL_LIST}" | jq -R . | jq -s .)

# 提交到 Bing
echo "正在提交 URL 到 Bing Webmaster..."
BING_RESPONSE=$(curl -s -v -X POST \
  "https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=${BING_API_KEY}" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "{\"siteUrl\":\"${BING_SITE_URL}\",\"urlList\":${BING_URL_ARRAY}}")

if echo "${BING_RESPONSE}" | grep -q '"d":null'; then
  echo "[Bing Webmaster] URL批量提交成功！"
else
  echo "[Bing Webmaster] URL提交失败，返回：${BING_RESPONSE}"
fi

# 提交到 Baidu
echo "正在提交 URL 到 Baidu Push..."
BAIDU_RESPONSE=$(curl -s -v -X POST \
  "http://data.zz.baidu.com/urls?site=${BAIDU_SITE_URL}&token=${BAIDU_API_KEY}" \
  -H "Content-Type: text/plain" \
  -H "User-Agent: curl/7.12.1" \
  --data-binary "${URL_LIST}")

if echo "${BAIDU_RESPONSE}" | grep -q 'success'; then
  echo "[Baidu Push] URL批量推送成功！"
else
  echo "[Baidu Push] URL推送失败，返回：${BAIDU_RESPONSE}"
fi

echo "URL 提交完成。"
