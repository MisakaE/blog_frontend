@echo off
setlocal enableextensions

REM 进入脚本所在目录（项目根）
cd /d "%~dp0"

REM ===== 基础运行参数 =====
set NODE_ENV=production

REM ===== 后端地址（按需改成你的生产后端域名/端口）=====
REM 这些变量会覆盖你各页面里 `process.env.XXX ?? "http://127.0.0.1:8000/..."` 的默认值
set POSTS_API_URL=http://47.109.192.34:8000/posts
set POSTS_ENTRY_URL=http://47.109.192.34:8000/post

set DIARY_ENTRIES_URL=http://47.109.192.34:8000/dailies
set DIARY_ENTRY_URL=http://47.109.192.34:8000/daily

set FRIENDS_API_URL=http://47.109.192.34:8000/myfriends

REM ===== 管理接口（Client Component 需要 NEXT_PUBLIC_，否则构建产物里拿不到）=====
set NEXT_PUBLIC_ADMIN_ADD_DIARY_URL=http://47.109.192.34:8000/adddaily
set NEXT_PUBLIC_ADMIN_ADD_POST_URL=http://47.109.192.34:8000/addpost
set NEXT_PUBLIC_ADMIN_DEL_DIARY_URL=http://47.109.192.34:8000/deldaily
set NEXT_PUBLIC_ADMIN_DEL_POST_URL=http://47.109.192.34:8000/delpost
set NEXT_PUBLIC_ADMIN_ADD_FRIEND_URL=http://47.109.192.34:8000/addfriend
set NEXT_PUBLIC_ADMIN_DEL_FRIEND_URL=http://47.109.192.34:8000/delfriend

REM ===== 构建 =====
REM 可选：首次部署建议用 npm ci
REM npm ci

npm run build
if errorlevel 1 exit /b 1

echo.
echo Build OK. You can run: npm run start
exit /b 0
