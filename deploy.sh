#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$SCRIPT_DIR/deploy_token" ]; then
    TOKEN=$(cat "$SCRIPT_DIR/deploy_token")
else
    TOKEN="${GITHUB_TOKEN:-}"
fi

cd "$SCRIPT_DIR"

# 🔍 部署前自动验证
echo "🔍 部署前验证..."
/Users/anada/.workbuddy/binaries/python/envs/default/bin/python3 "$SCRIPT_DIR/../content_check.py" || { echo "🔴 内容检查失败，拒绝部署"; exit 1; }
echo ""

# 同步 push.html
cp ../push.html index.html

# 提交推送
git add index.html
git commit -m "deploy: $(date '+%Y-%m-%d %H:%M')" || true
git push origin main 2>&1

echo ""
echo "✅ 已部署到 https://beerbobo.github.io/claw-deploy/"
