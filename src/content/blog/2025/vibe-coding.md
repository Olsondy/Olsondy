---
title: From 0 to 1 using AI Vibe coding
categories: Develop
comments: true
keywords: AI, Nuxt.js, Vuejs
tags:
  - genai
  - prompt
  - frontend
  - vuejs
description: 使用AI智能体IDE开发全栈项目
pubDate: '2025-12-25T17:20:12.050Z'
lastModDate: 2026-01-26T13:10:03.081Z
---

# Vibe Coding

## Intro
- Using the Antigravity IDE 
- Full-stack with Nuxt.js.

## require
- Supabase PostgrSQL +  Nuxt/Auth + Redis
- Resend mail + Email OTP
- Cloudflare  R2 Object File
- Social  OAuth ([Google](https://console.cloud.google.com/)、[Twitter(X)](https://developer.x.com/en/portal/dashboard))、Goole One Tap
- [Upstash](https://https://upstash.com/) 、Imgix
- Redis (option)
## resources
- Dicebear 、Zod
-  CCloudflare Turnstile
## issues

### Cloud flare R2
- 创建存储桶
- 存储主页右下角点击管理 -> 创建account api access, 获取AccountId, AK, SK
- 配置域名
- 设置CORS
### Supabase
- Supabase 数据库,默认的直连(Direct)模式,你电脑的ip要支持ipv6