#!/bin/bash

# scripts/CICD/submitUrls.sh
# 用于批量提交 sitemap URL 到 Bing 和 Baidu Webmaster API

echo "开始提交 URL..."

# 定义路径
SERVER_PATH="/var/www/voidix.net"
SITEMAP_PATH="${SERVER_PATH}/dist/sitemap.xml"
BING_SITE_URL="https://www.voidix.net"
BAIDU_SITE_URL="https://www.voidix.net"

# 获取环境变量
# 注意：在 CI/CD 环境中，这些变量通常直接作为环境变量提供
# 如果在本地运行，需要确保 .env.local 文件存在并已加载
if [ -f "../../.env.local" ]; then
  source "../../.env.local"
else
  echo "[Multi Submit] 未找到 .env.local，请确保环境变量已设置。"
  exit 1
fi

if [ -z "${BING_API_KEY}" ]; then
  echo "[Multi Submit] 环境变量 BING_API_KEY 未设置。"
  exit 1
fi

if [ -z "${BAIDU_PUSH_TOKEN}" ]; then
  echo "[Multi Submit] 环境变量 BAIDU_PUSH_TOKEN 未设置。"
  exit 1
fi

# 检查 sitemap.xml 是否存在
if [ ! -f "${SITEMAP_PATH}" ]; then
  echo "[Bing Webmaster] 未找到 sitemap.xml，跳过URL提交。"
  exit 0
fi

# 解析 sitemap.xml，提取所有 <loc> 标签内容
URL_LIST=$(grep -oP '(?<=<loc>)[^<]+(?=</loc>)' "${SITEMAP_PATH}")

if [ -z "${URL_LIST}" ]; then
  echo "[Multi Submit] sitemap.xml 中未找到URL，跳过提交。"
  exit 0
fi

# 将 URL 列表转换为 JSON 数组格式，用于 Bing
BING_URL_ARRAY=$(echo "${URL_LIST}" | jq -R . | jq -s .)

# 提交到 Bing
echo "正在提交 URL 到 Bing Webmaster..."
BING_RESPONSE=$(curl -s -X POST \
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
BAIDU_RESPONSE=$(curl -s -X POST \
  "http://data.zz.baidu.com/urls?site=${BAIDU_SITE_URL}&token=${BAIDU_PUSH_TOKEN}" \
  -H "Content-Type: text/plain" \
  -H "User-Agent: curl/7.12.1" \
  --data-binary "${URL_LIST}")

if echo "${BAIDU_RESPONSE}" | grep -q 'success'; then
  echo "[Baidu Push] URL批量推送成功！"
else
  echo "[Baidu Push] URL推送失败，返回：${BAIDU_RESPONSE}"
fi

echo "URL 提交完成。"
