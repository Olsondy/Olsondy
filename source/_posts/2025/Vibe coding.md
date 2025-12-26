---
title: From 0 to 1 using AI Vibe coding
categories: Develop
comments: true
keywords: AI, Nuxt.js, Vuejs
tags:
  - genai
  - prompt
  - frontend
description: 使用AI智能体IDE开发全栈项目
date: 2025-12-25T17:20:12.050Z
updated: 2025-12-26T13:10:03.081Z
---

# Vibe Codeing

## Intro
- Using the Antigravity IDE 
- Full-stack with Nuxt.js.

## require
- Resend mail
- Supabase PostgrSQL
- Cloudflare  R2 Object File
- Social  OAuth ([Google](https://console.cloud.google.com/)、[Twitter(X)](https://developer.x.com/en/portal/dashboard))
- [Upstash](https://https://upstash.com/) Redis (option)

## issues
- R2配置, 需要将公网配置打开, 并且设置CORS
- Supabase 数据库连接不上: 默认的直连(Direct)模式,是要ipv6支持才可以的