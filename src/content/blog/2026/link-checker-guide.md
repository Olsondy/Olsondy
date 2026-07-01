---
title: 内链检查工具指南
categories: Tools
comments: true
keywords: SEO, Playwright, Link Checker, Python, Hexo
tags:
  - seo
  - tools
  - automation
  - testing
description: 使用 Python 和 Playwright 检测博客内链有效性的完整指南
pubDate: '2026-02-07T02:43:00.000Z'
lastModDate: 2026-02-07T02:43:00.000Z
---

# 内链检查工具指南

为了确保 SEO 效果和用户体验，我们开发了专门的工具来检测 `Creation Lab` 内容（Prompts, Skills, Workflows）中的内部链接有效性。

这些工具能够检测以下场景：
- 标准 HTML 中的 `<a>` 标签。
- **React Server Components (RSC) Payload** 中的 JSON 数据链接。
- Markdown 内容中的链接格式 `[text](url)`。
- **Client-side Rendering (CSR)** 后生成的链接（Playwright 版）。

---

## 🔧 工具概览

我们在 `scripts/creation-lab/` 目录下提供了两个版本的检测工具：

| 工具               | 文件名                         | 适用场景    | 依赖                    | 优点                            |
| :--------------- | :-------------------------- | :------ | :-------------------- | :---------------------------- |
| **Python 版**     | `check-links.py`            | 快速、轻量扫描 | Python 3, `requests`  | 速度快，无需安装浏览器                   |
| **Playwright 版** | `check-links-playwright.js` | 精准、深度检测 | Node.js, `playwright` | 100% 模拟用户行为，能检测 JS 渲染内容和控制台错误 |

---

## 🐍 1. Python 脚本 (`check-links.py`)

这是一个轻量级的爬虫脚本，使用多线程并发检测链接状态。它经过专门优化，可以通过正则表达式识别 Next.js 的 RSC Payload 和 Markdown 链接。

### 前置要求
确保已安装 Python 3，并安装 `requests` 库：
```bash
pip install requests
```

### 使用方法

**基本用法 (检查默认地址 http://localhost:4000)**
```bash
python scripts/check-links.py
```

**指定起始页面 (例如检查某个 页面路径)**
```bash
python scripts/check-links.py --start /example/page1
```

**查看详细输出 (显示每个扫描到的链接)**
```bash
python scripts/check-links.py -v
```

**完整参数**
- `--url`: 指定基础 URL（默认为 `http://localhost:3000`，开发环境通常需改为 `http://localhost:4000`）。
- `--start`: 指定起始扫描路径。
- `--workers`: 并发线程数（默认 10）。
- `--timeout`: 请求超时时间（秒）。
- `-v / --verbose`: 详细模式。

---

## 🎭 2. Playwright 脚本 (`check-links-playwright.js`)

这是一个基于无头浏览器的检测工具。它会真实地渲染页面，等待 React Hydration 完成，然后提取 DOM 中的链接。这是最接近 Googlebot 和真实用户体验的检测方式。

### 前置要求
需要 Node.js 环境。
如果你没有在项目中安装 `playwright`，可以使用全局安装的版本：

```bash
npm install -g playwright
```

### 使用方法

**运行脚本 (使用全局 Playwright)**
> 注意：Windows PowerShell 中可能需要设置 `NODE_PATH` 环境变量指向全局模块目录。

```powershell
# 设置全局模块路径 (请根据实际安装位置调整)
$env:NODE_PATH="D:\Development\Nodejs\nodejs\node_modules"

# 运行脚本
node scripts/check-links-playwright.js --start /example/page1 --max 20 -v
```


**参数说明**
- `--url`: 基础 URL (默认 `http://localhost:4000`)。
- `--start`: 起始路径 (默认 `/`)。
- `--max`: 最大扫描页面数 (防止无限爬取，默认 30)。
- `--timeout`: 页面加载超时时间 (毫秒)。
- `-v / --verbose`: 详细模式，显示已访问的页面列表。

---

## 📥 文件下载

**[check-links.zip](/downloads/check-links.zip)** - 包含两个版本：
- `check-links.py` - Python 版本
- `check-links-playwright.js` - Playwright 版本

---

### 如何验证修复？
使用上述任意一个工具扫描详情页。如果扫描报告中包含了该页面内部的链接（即"有效链接"数量 > 0），说明 SSR 配置正确，SEO 友好。
