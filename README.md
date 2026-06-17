# Mocco — 萌壳匿名社交

基于 Expo (React Native) 的萌宠匿名社交 App，支持 **Web 实时预览** 和 **Android**。

## 快速开始

```bash
cd apps/mobile
npm install
npm run web      # 浏览器预览
npm run android  # Android
```

## 功能概览

| 模块 | 数据 |
|------|------|
| 小窝（萌壳） | Supabase profiles + Storage |
| 萌壳圈 | Supabase posts + 点赞 |
| 发布动态 | 写入 posts 表 |
| 消息 | Supabase conversations + messages + Realtime |
| 派对猜拳 | 本地 MVP |

未配置 Supabase 时自动进入**本地预览模式**（萌壳圈显示演示数据）。

---

## Supabase 配置（必做）

### 1. 创建项目

登录 [supabase.com](https://supabase.com) → New Project

### 2. 启用匿名登录

**Authentication → Providers → Anonymous Sign-Ins → Enable**

### 3. 执行数据库 SQL

打开 **SQL Editor**，依次执行：

1. `supabase/migrations/001_initial.sql`
2. `supabase/migrations/002_enhancements.sql`

（002 会创建 Storage bucket、点赞触发器、消息预览字段等）

### 4. 配置 App 环境变量

```bash
cd apps/mobile
copy .env.example .env   # Windows
# 填入 Project URL 和 anon public key
```

重启 Expo：`npx expo start -c`

### 5. （可选）部署 Edge Function

萌壳头像生成可选部署 `generate-pet`；未部署时 App 会自动用客户端 fallback 保存头像。

```bash
npx supabase login
npx supabase link --project-ref <your-ref>
npx supabase functions deploy generate-pet
```

### 6. 验证

- 打开 App 顶部不应再显示「本地预览」横幅
- 萌壳圈为空时可发布动态
- 下拉刷新可看到新帖子
- 消息页在有人发起会话后可收发（Realtime）

---

## 数据库表

| 表 | 用途 |
|----|------|
| `profiles` | 匿名用户、萌壳头像 |
| `posts` | 萌壳圈动态 |
| `post_likes` | 点赞 |
| `conversations` | 会话 |
| `messages` | 消息（Realtime） |
| `pet_uploads` | 上传记录 |

Storage bucket：`pet-uploads`、`avatars`（迁移 002 自动创建）

---

## 项目结构

```
mocco/
├── apps/mobile/
│   ├── app/           # 页面
│   ├── lib/api/       # Supabase API
│   ├── hooks/         # React Query hooks
│   └── stores/        # Zustand
└── supabase/
    ├── migrations/    # SQL 迁移
    └── functions/     # Edge Functions
```

## 技术栈

Expo SDK 56 · Expo Router · TypeScript · Supabase · React Query · Zustand
