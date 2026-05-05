#!/usr/bin/env bash
set -euo pipefail

# ===== 基础运行参数 =====
export NODE_ENV=production
export PORT="${PORT:-3000}"
export HOSTNAME="${HOSTNAME:-0.0.0.0}"

# ===== 后端地址（按需改成你的生产后端域名/端口）=====
# 这些变量会覆盖你各页面里 `process.env.XXX ?? "http://127.0.0.1:8000/..."` 的默认值
export POSTS_API_URL="${POSTS_API_URL:-http://47.109.192.34:8000/posts}"
export POSTS_ENTRY_URL="${POSTS_ENTRY_URL:-http://47.109.192.34:8000/post}"

export DIARY_ENTRIES_URL="${DIARY_ENTRIES_URL:-http://47.109.192.34:8000/dailies}"
export DIARY_ENTRY_URL="${DIARY_ENTRY_URL:-http://47.109.192.34:8000/daily}"

export FRIENDS_API_URL="${FRIENDS_API_URL:-http://47.109.192.34:8000/myfriends}"

# ===== 管理接口（若你的 /admin/* 页面在浏览器端直连后端，通常要用 NEXT_PUBLIC_ 前缀）=====
# 注意：不要把真实 token 写进脚本/仓库；token 是表单输入，不要放这里
export NEXT_PUBLIC_ADMIN_ADD_DIARY_URL="${NEXT_PUBLIC_ADMIN_ADD_DIARY_URL:-http://47.109.192.34:8000/adddaily}"
export NEXT_PUBLIC_ADMIN_ADD_POST_URL="${NEXT_PUBLIC_ADMIN_ADD_POST_URL:-http://47.109.192.34:8000/addpost}"
export NEXT_PUBLIC_ADMIN_DEL_DIARY_URL="${NEXT_PUBLIC_ADMIN_DEL_DIARY_URL:-http://47.109.192.34:8000/deldaily}"
export NEXT_PUBLIC_ADMIN_DEL_POST_URL="${NEXT_PUBLIC_ADMIN_DEL_POST_URL:-http://47.109.192.34:8000/delpost}"
export NEXT_PUBLIC_ADMIN_ADD_FRIEND_URL="${NEXT_PUBLIC_ADMIN_ADD_FRIEND_URL:-http://47.109.192.34:8000/addfriend}"
export NEXT_PUBLIC_ADMIN_DEL_FRIEND_URL="${NEXT_PUBLIC_ADMIN_DEL_FRIEND_URL:-http://47.109.192.34:8000/delfriend}"

# 注：admin/add_diary 与 admin/add_post 的“实时预览”为纯前端轻量 Markdown 渲染（与环境变量无关）。
# 现在已支持图片语法：![alt](https://.../img.jpg) 或 ![alt](/img.jpg)

# 提示：/admin/* 页面若使用 NEXT_PUBLIC_*，这些变量会在 build 时内联；修改后需要重新 build。
# Windows 环境请使用同目录 build-prod.cmd 先构建再运行。

# ===== 启动 =====
# 如需脚本内构建：取消下一行注释
# npm run build

# 生产启动（确保你已 build 过）
npm run start
