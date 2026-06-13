# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

小说阅读器 + AI吐槽机器人，前后端分离架构。支持网页端阅读、AI续写（IF线）、吐槽机器人、后台管理等功能。

## 开发命令

### 前端（client/）

```bash
cd client && npm run dev          # 启动开发服务器（端口 5173）
cd client && npm run build        # 生产构建
cd client && npm run preview      # 预览生产构建
```

### 后端（server/）

```bash
cd server && npm run start:dev    # 启动开发服务器（端口 3000，watch 模式）
cd server && npm run build        # 编译 TypeScript
cd server && npm run start:prod   # 生产模式运行
cd server && npm run test         # 运行单元测试
cd server && npm run test:e2e     # 运行 e2e 测试
cd server && npm run test:cov     # 测试覆盖率
cd server && npm run lint         # ESLint 检查并自动修复
cd server && npm run format       # Prettier 格式化
```

## 技术栈

| 层     | 技术                                     |
| ------ | ---------------------------------------- |
| 前端   | Vue 3 + Vite + Element Plus + Pinia + Vue Router |
| 后端   | NestJS + TypeORM + MySQL2 + JWT + bcryptjs |
| 数据库 | MySQL（开发库 `novel_reader`，root / root123456） |

## 项目架构

```
client/                     # 前端 - Vue 3 SPA
  src/
    api/index.js            # axios 实例，baseURL 指向 localhost:3000，自动附加 JWT token
    router/index.js         # 路由定义 + 全局前置守卫（根据 meta.requiresAuth 检查 token）
    store/user.js           # Pinia 用户状态管理（登录/注册/登出）
    views/                  # 页面组件（Home, Login, Register, BookDetail, ChapterRead, Admin）
    components/             # 可复用组件

server/                     # 后端 - NestJS
  src/
    main.ts                 # 入口，启用 CORS（允许 localhost:5173）
    app.module.ts           # 根模块，导入 TypeORM + 各功能模块
    config/database.config.ts  # 数据库配置（开发环境 synchronize: true）
    database/init.sql       # 手动建表脚本（含示例数据）
    modules/
      auth/                 # 认证模块（注册/登录，JWT 策略）
      users/                # 用户模块（user.entity, user-point.entity）
      books/                # 图书模块（book.entity）
      chapters/             # 章节模块（chapter.entity）
      ai/                   # AI模块（ai-config.entity，吐槽/续写接口，API调用尚未真实对接）
      if-stories/           # IF线续写模块（if-story.entity）
      admin/                # 后台管理模块（空壳，待实现）
```

## 关键约定

### API 路由
- 所有 API 以 `/api/` 为前缀
- 前端 axios baseURL 为 `http://localhost:3000`，请求自动携带 `Bearer <token>`
- 401 响应自动清除 token 并跳转登录页

### 认证
- 手机号 + 密码注册/登录，密码 bcrypt 加密（cost = 10）
- JWT token，密钥硬编码在 `auth.module.ts` 和 `jwt.strategy.ts` 中（`novel-reader-secret-key`），有效期 7 天
- 敏感数据（手机号、文件路径、API Key）需 AES 加密存储（尚未实现）

### NestJS 模块模式
- 每个模块独立目录，包含 `*.module.ts`、`*.controller.ts`、`*.service.ts`、`*.entity.ts`
- TypeORM 实体使用装饰器，`synchronize: true` 会自动同步表结构（仅开发环境）
- 数据库地址：`mysql://root:root123456@localhost:3306/novel_reader`
