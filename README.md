# Mocco — 萌宠皮套匿名社交

基于 Expo (React Native) 的萌宠匿名社交 App，支持 **Web 实时预览** 和 **Android**。

## 快速开始

```bash
# 安装依赖
cd apps/mobile
npm install

# Web 预览（浏览器热更新）
npm run web

# Android 预览（需 Android 模拟器或真机）
npm run android

# 通用开发服务器（可选 w/a 快捷键）
npm start
```

也可以在项目根目录：

```bash
npm run web
npm run android
```

## 功能概览

| 模块 | 状态 |
|------|------|
| 我的萌宠（2D 头像） | ✅ MVP |
| 广场 | ✅ 静态演示 |
| 聊天 | ✅ 静态演示 |
| 破冰猜拳 | ✅ 单机演示 |
| Supabase 同步 | 需配置 |

## Supabase 配置

1. 在 [supabase.com](https://supabase.com) 创建项目
2. 复制 `apps/mobile/.env.example` 为 `apps/mobile/.env` 并填入密钥
3. 执行数据库迁移：

```bash
npx supabase db push
```

4. 在 Storage 中创建两个 bucket（均设为 Public）：
   - `pet-uploads` — 用户上传的原始照片
   - `avatars` — 生成的 2D 头像

5. 部署 Edge Function：

```bash
npx supabase functions deploy generate-pet
```

6. 在 Supabase Dashboard → Authentication → Providers 中启用 **Anonymous Sign-Ins**

未配置 Supabase 时，App 会以**本地预览模式**运行，头像和数据保存在本地。

## 项目结构

```
mocco/
├── apps/mobile/          # Expo 主应用
│   ├── app/              # 页面（Expo Router）
│   ├── components/       # UI 组件
│   ├── lib/              # Supabase、工具函数
│   └── stores/           # Zustand 状态
└── supabase/             # 数据库迁移 & Edge Functions
```

## 技术栈

- Expo SDK 56 + Expo Router
- TypeScript
- Supabase（Auth / DB / Storage / Realtime）
- Zustand

## 开发建议

- **UI 调试**：优先用 `npm run web` 在浏览器里看效果
- **原生能力**（相机、相册）：在 Android 真机/模拟器上测
- **Cursor**：项目已包含 `.cursor/rules`，AI 会遵循项目约定
