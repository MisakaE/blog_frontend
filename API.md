# 接口文档

后端基于 Rocket + SQLite。默认数据库文件为 `data/blog.db`，可通过环境变量 `BLOG_DB_PATH` 覆盖。

当前实现提供查询接口，以及文章、日记、友链、AboutMe 的新增 / 修改 / 删除接口。
所有新增 / 修改 / 删除接口都需要通过 token 的 SHA-256 鉴权，目标 SHA-256 存放在配置文件 `[auth].token_sha256` 中。

## 基础信息

- Base URL: `http://127.0.0.1:8000`
- 请求格式: `application/json`
- 响应格式: `application/json`
- 分页参数: `page`、`page_size`
- 分页默认值: `page=1`、`page_size=10`
- 时间字段: Unix 时间戳，单位为秒

## 接口约定

- 文章、日记、友链的新增 / 修改接口使用 JSON 请求体。
- 删除接口同样使用 JSON 请求体，通常只需要主键字段。
- 查询接口返回 JSON。
- 删除接口成功时返回文本 `ok`。
- 计数接口返回 JSON 对象 `{ "count": 数字 }`。
- 写入接口需要额外携带 `Authorization: Bearer <token>` 或 `X-Token: <token>` 请求头，服务端会对 token 做 SHA-256 后与配置值比对。

## 生产环境配置

项目支持通过 TOML 配置文件在生产环境下设置参数，优先级如下：

1. 环境变量 `BLOG_DB_PATH`（直接指定 SQLite 文件路径）
2. 指定的配置文件（默认读取 `config/production.toml` 或 `config.toml`；可通过环境变量 `BLOG_CONFIG_PATH` 指定自定义文件路径）
  - 配置文件示例（TOML）:

```toml
[database]
path = "data/blog.db"
```

3. 默认值 `data/blog.db`

示例：在生产服务器上可以设置环境变量：

```bash
$env:BLOG_CONFIG_PATH="/etc/myblog/production.toml"
export BLOG_DB_PATH="/var/lib/myblog/blog.db"
cargo run --release
```

示例：鉴权配置（TOML）

```toml
[auth]
token_sha256 = "replace-with-your-token-sha256"
```

## 数据结构

### PostItem

```json
{
  "id": 1,
  "title": "标题",
  "time": 1745971200,
  "desc": "简介",
  "tags": ["rust", "rocket"],
  "md": "markdown 内容"
}
```

### PostList

```json
{
  "page": 1,
  "page_size": 10,
  "posts": []
}
```

### DailyItem

```json
{
  "id": 1,
  "title": "日记标题",
  "time": 1745971200,
  "desc": "简介",
  "md": "markdown 内容"
}
```

### DailyList

```json
{
  "page": 1,
  "page_size": 10,
  "dailies": []
}
```

### FriendItem

```json
{
  "name": "Rust",
  "icon": "🦀",
  "href": "https://www.rust-lang.org/",
  "desc": "Rust programming language",
  "personalize": "fast, safe, productive"
}
```

### FriendList

```json
{
  "page": 1,
  "page_size": 10,
  "friends": []
}
```

### CountResponse

```json
{
  "count": 42
}
```

### AboutMe

```json
{
  "name": "Blog Author",
  "bio": "Rust backend powered by Rocket and SQLite",
  "md": "# About Me",
  "piclink": ""
}
```

## 请求体结构

### PostWriteRequest

用于 `POST /addpost`。

```json
{
  "title": "Hello World",
  "time": 1745971200,
  "desc": "第一篇文章",
  "tags": ["rust", "rocket"],
  "md": "# Hello World\n\n正文内容"
}
```

### PostUpdateRequest

用于 `POST /editpost`。

```json
{
  "id": 1,
  "title": "Hello World Updated",
  "time": 1745971200,
  "desc": "更新后的简介",
  "tags": ["rust", "rocket"],
  "md": "# Hello World Updated\n\n更新后的正文内容"
}
```

### DailyWriteRequest

用于 `POST /adddaily`。

```json
{
  "title": "First daily note",
  "time": 1745971200,
  "desc": "Default daily entry",
  "md": "# Hello\n\nThis is the first daily entry."
}
```

### DailyUpdateRequest

用于 `POST /editdaily`。

```json
{
  "id": 1,
  "title": "First daily note updated",
  "time": 1745971200,
  "desc": "Updated daily entry",
  "md": "# Hello\n\nUpdated content."
}
```

### FriendWriteRequest

用于 `POST /addfriend`。

```json
{
  "name": "Rust",
  "icon": "🦀",
  "href": "https://www.rust-lang.org/",
  "desc": "Rust programming language",
  "personalize": "fast, safe, productive"
}
```

### FriendUpdateRequest

用于 `POST /editfriend`。

```json
{
  "name": "Rust",
  "icon": "🦀",
  "href": "https://www.rust-lang.org/",
  "desc": "Rust programming language",
  "personalize": "fast, safe, productive"
}
```

### FriendDeleteRequest

用于 `POST /delfriend`。

```json
{
  "name": "Rust"
}
```

### AboutMeUpdateRequest

用于 `POST /editaboutme`。

```json
{
  "name": "Blog Author",
  "bio": "Updated bio",
  "md": "# Updated About Me",
  "piclink": "https://example.com/avatar.png"
}
```

### IdRequest

用于 `POST /delpost` 和 `POST /deldaily`。

```json
{
  "id": 1
}
```

## 接口列表

### 1. 首页

- Method: `GET`
- Path: `/`
- 描述: 健康检查和服务标识
- 响应类型: `text/plain`

响应示例:

```text
Rocket + SQLite backend
```

### 2. 获取文章列表

- Method: `GET`
- Path: `/posts`
- Query:
  - `page`: 页码，默认 `1`
  - `page_size`: 每页数量，默认 `10`
- 响应类型: `PostList`

请求示例:

```bash
GET /posts?page=1&page_size=10
```

响应示例:

```json
{
  "page": 1,
  "page_size": 10,
  "posts": [
    {
      "id": 1,
      "title": "Hello World",
      "time": 1745971200,
      "desc": "第一篇文章",
      "tags": ["rust", "rocket"],
      "md": null
    }
  ]
}
```

### 3. 获取单篇文章

- Method: `GET`
- Path: `/post`
- Query:
  - `id`: 文章 ID
- 响应类型: `PostItem`

请求示例:

```bash
GET /post?id=1
```

响应示例:

```json
{
  "id": 1,
  "title": "Hello World",
  "time": 1745971200,
  "desc": "第一篇文章",
  "tags": ["rust", "rocket"],
  "md": "# Hello World\n\n正文内容"
}
```

### 4. 获取日记列表

- Method: `GET`
- Path: `/dailies`
- Query:
  - `page`: 页码，默认 `1`
  - `page_size`: 每页数量，默认 `10`
- 响应类型: `DailyList`

请求示例:

```bash
GET /dailies?page=1&page_size=10
```

响应示例:

```json
{
  "page": 1,
  "page_size": 10,
  "dailies": [
    {
      "id": 1,
      "title": "First daily note",
      "time": 1745971200,
      "desc": "Default daily entry",
      "md": null
    }
  ]
}
```

### 5. 获取单篇日记

- Method: `GET`
- Path: `/daily`
- Query:
  - `id`: 日记 ID
- 响应类型: `DailyItem`

请求示例:

```bash
GET /daily?id=1
```

响应示例:

```json
{
  "id": 1,
  "title": "First daily note",
  "time": 1745971200,
  "desc": "Default daily entry",
  "md": "# Hello\n\nThis is the first daily entry."
}
```

### 6. 获取关于我

- Method: `GET`
- Path: `/aboutme`
- 响应类型: `AboutMe`

请求示例:

```bash
GET /aboutme
```

响应示例:

```json
{
  "name": "Blog Author",
  "bio": "Rust backend powered by Rocket and SQLite",
  "md": "# About Me\n\nRust backend powered by Rocket and SQLite.",
  "piclink": ""
}
```

### 6.1 修改关于我

- Method: `POST`
- Path: `/editaboutme`
- 鉴权: ✅ 需要携带 token
- 请求类型: `AboutMeUpdateRequest`
- 响应类型: `AboutMe`

请求示例:

```bash
curl -X POST http://127.0.0.1:8000/editaboutme \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Blog Author","bio":"New bio","md":"# Updated","piclink":"https://example.com/avatar.png"}'
```

响应示例:

```json
{
  "name": "Blog Author",
  "bio": "New bio",
  "md": "# Updated",
  "piclink": "https://example.com/avatar.png"
}
```

### 7. 获取友链列表

- Method: `GET`
- Path: `/myfriends`
- Query:
  - `page`: 页码，默认 `1`
  - `page_size`: 每页数量，默认 `10`
- 响应类型: `FriendList`

请求示例:

```bash
GET /myfriends?page=1&page_size=10
```

响应示例:

```json
{
  "page": 1,
  "page_size": 10,
  "friends": [
    {
      "name": "Rust",
      "icon": "🦀",
      "href": "https://www.rust-lang.org/",
      "desc": "Rust programming language",
      "personalize": "fast, safe, productive"
    }
  ]
}
```

### 8. 获取文章总数

- Method: `GET`
- Path: `/posts/count`
- 响应类型: `CountResponse`

请求示例:

```bash
GET /posts/count
```

响应示例:

```json
{
  "count": 12
}
```

### 9. 获取日记总数

- Method: `GET`
- Path: `/dailies/count`
- 响应类型: `CountResponse`

请求示例:

```bash
GET /dailies/count
```

响应示例:

```json
{
  "count": 5
}
```

### 10. 获取友链总数

- Method: `GET`
- Path: `/myfriends/count`
- 响应类型: `CountResponse`

请求示例:

```bash
GET /myfriends/count
```

响应示例:

```json
{
  "count": 8
}
```

### 11. 新增文章

- Method: `POST`
- Path: `/addpost`
- 请求体: `PostWriteRequest`
- 响应类型: `PostItem`

请求示例:

```bash
POST /addpost
```

```json
{
  "title": "Hello World",
  "time": 1745971200,
  "desc": "第一篇文章",
  "tags": ["rust", "rocket"],
  "md": "# Hello World\n\n正文内容"
}
```

响应示例:

```json
{
  "id": 1,
  "title": "Hello World",
  "time": 1745971200,
  "desc": "第一篇文章",
  "tags": ["rust", "rocket"],
  "md": "# Hello World\n\n正文内容"
}
```

### 12. 修改文章

- Method: `POST`
- Path: `/editpost`
- 请求体: `PostUpdateRequest`
- 响应类型: `PostItem`

请求示例:

```bash
POST /editpost
```

```json
{
  "id": 1,
  "title": "Hello World Updated",
  "time": 1745971200,
  "desc": "更新后的简介",
  "tags": ["rust", "rocket"],
  "md": "# Hello World Updated\n\n更新后的正文内容"
}
```

### 13. 删除文章

- Method: `POST`
- Path: `/delpost`
- 请求体: `IdRequest`
- 响应类型: `text/plain`

请求示例:

```bash
POST /delpost
```

```json
{
  "id": 1
}
```

响应示例:

```text
ok
```

### 14. 新增日记

- Method: `POST`
- Path: `/adddaily`
- 请求体: `DailyWriteRequest`
- 响应类型: `DailyItem`

请求示例:

```bash
POST /adddaily
```

```json
{
  "title": "First daily note",
  "time": 1745971200,
  "desc": "Default daily entry",
  "md": "# Hello\n\nThis is the first daily entry."
}
```

### 15. 修改日记

- Method: `POST`
- Path: `/editdaily`
- 请求体: `DailyUpdateRequest`
- 响应类型: `DailyItem`

请求示例:

```bash
POST /editdaily
```

```json
{
  "id": 1,
  "title": "First daily note updated",
  "time": 1745971200,
  "desc": "Updated daily entry",
  "md": "# Hello\n\nUpdated content."
}
```

### 16. 删除日记

- Method: `POST`
- Path: `/deldaily`
- 请求体: `IdRequest`
- 响应类型: `text/plain`

请求示例:

```bash
POST /deldaily
```

```json
{
  "id": 1
}
```

响应示例:

```text
ok
```

### 17. 新增友链

- Method: `POST`
- Path: `/addfriend`
- 请求体: `FriendWriteRequest`
- 响应类型: `FriendItem`

请求示例:

```bash
POST /addfriend
```

```json
{
  "name": "Rust",
  "icon": "🦀",
  "href": "https://www.rust-lang.org/",
  "desc": "Rust programming language",
  "personalize": "fast, safe, productive"
}
```

### 18. 修改友链

- Method: `POST`
- Path: `/editfriend`
- 请求体: `FriendUpdateRequest`
- 响应类型: `FriendItem`

请求示例:

```bash
POST /editfriend
```

```json
{
  "name": "Rust",
  "icon": "🦀",
  "href": "https://www.rust-lang.org/",
  "desc": "Rust programming language",
  "personalize": "fast, safe, productive"
}
```

### 19. 删除友链

- Method: `POST`
- Path: `/delfriend`
- 请求体: `FriendDeleteRequest`
- 响应类型: `text/plain`

请求示例:

```bash
POST /delfriend
```

```json
{
  "name": "Rust"
}
```

响应示例:

```text
ok
```

## 错误说明

- `400 Bad Request`: 请求体字段缺失或格式不正确
- `500 Internal Server Error`: 数据库读取失败、写入失败或初始化失败

## 启动说明

- 默认初始化数据库到 `data/blog.db`
- 可设置环境变量 `BLOG_DB_PATH` 指向其他 SQLite 文件

```bash
$env:BLOG_DB_PATH="data/blog.db"
cargo run
```