# AGENTS.md

Olsond 的个人博客，线上地址 https://olsond.me 。本文件是本项目的维护规范，补充或覆盖全局规则。

## 项目事实

- 技术栈：Astro 5 + UnoCSS + MDX + Expressive Code，搜索用 Pagefind（`postbuild` 生成）。基于 AntfuStyle 模板改造，模板示例页面（photos/changelog/streams）已删除。
- 评论 giscus 当前**关闭**：`src/config.ts` 中的 repo 配置仍是模板作者的，启用前必须换成本人仓库的 `data-repo`/`data-repo-id`/`data-category-id`。
- `pnpm check` 存在模板遗留的类型错误（约 62 个），不阻塞构建；改动不得新增错误。
- 包管理：`pnpm`（以 `pnpm-lock.yaml` 为准，不要生成 `package-lock.json`）。
- 部署：当前主力是 **Netlify**（国内可访问），在 Netlify 控制台配置构建，仓库内无 `netlify.toml`。`vercel.json` 保留作备用部署，两边都要能构建通过。
  - 重定向写在 `public/_redirects`（Netlify 格式），里面有旧 Hexo 链接 `/articles/...` → `/post/...` 的 301，不得删除。
- 仓库 `Olsondy/Olsondy` 同时是 GitHub 个人主页仓库：`README.md` 是主页自我介绍，**不写**项目技术说明；首页内容 `src/content/home/index.md` 与它保持一致。
- 旧 Hexo 站点已下线，源码归档在分支 `archive/hexo`，`main` 上不再保留 Hexo 相关文件。
- 仓库位于 Obsidian vault 内，文章常在 Obsidian 中编辑。

## 目录

| 路径 | 用途 |
| --- | --- |
| `src/content/blog/<YYYY>/<slug>.md` | 博客文章；带图片时用 `<slug>/index.md` + 同目录图片 |
| `src/content/shorts/`、`changelog/`、`projects/`、`streams/` | 其他内容集合，定义见 `src/content.config.ts`；只放用户自己的内容，不保留主题模板的示例数据 |
| `src/content/schema.ts` | 所有 front-matter 的唯一权威定义 |
| `src/config.ts` | 站点配置（域名、导航、分类、社交链接） |
| `src/pages/` | 路由；文章 URL 为 `/post/<YYYY>/<slug>` |
| `plugins/` | 自定义 remark 插件（阅读时长、OG 图生成） |
| `public/og-images/` | 构建生成的文章 OG 图 |
| `scripts/fetch-projects.js` | 从 GitHub 拉取项目列表写入 `projects/data.json` |
| `docs/` | 维护文档（决策记录、部署说明等）；README 不写这些 |

## 命令

```bash
pnpm install
pnpm dev            # 本地开发
pnpm build          # 构建 + Pagefind 索引，输出 dist/
pnpm check          # astro check（类型 + content schema）
pnpm lint && pnpm format
```

pre-commit 钩子会跑 `lint-staged`（eslint），不要用 `--no-verify` 绕过。

## 文章规范

### Front-matter

以 `src/content/schema.ts` 的 `postSchema` 为准，常用字段：

```yaml
---
title: 标题（≤60 字符）
description: 一句话摘要
pubDate: '2025-12-25T17:20:12.050Z'   # 必填，首次发布时间
lastModDate: '2026-01-26T13:10:03.081Z'
category: tech                        # 取值见 src/config.ts：tech / life / essay
tags:
  - genai
---
```

- 不再使用 Hexo 字段 `date`/`updated`/`categories`/`keywords`/`comments`。旧文章中残留的这些字段 schema 不识别、不生效，修改该文章时顺手清理。
- 标签小写、连字符分隔，优先复用已有标签。
- **URL 由文件路径决定**（`/post/2025/vibe-coding`）：已发布文章不得移动目录或改文件名；确需改动必须在 `public/_redirects` 加 301，并先征得用户同意。改 `pubDate` 不影响 URL，但不要随意改。

### 正文

- 不用 Obsidian 专有语法：`[[link]]`、`![[image.png]]` 不会渲染，改为标准 Markdown 相对路径。
- 代码块语言标识用小写且 Shiki 支持的名字（`bash`、`yaml`、`javascript`、`ini`），否则构建会退化为纯文本并告警。
- 图片放在文章同目录，文件名小写英文+连字符。
- 文章中不得出现真实密钥、密码、内网地址，发现时提醒用户。

### 内容边界

- 文章观点和措辞属于用户，**未经要求不改写**。可直接修：错别字、front-matter、渲染问题，交付时列出改了什么。
- 用户在 Obsidian 中未提交的改动，不擅自提交、覆盖或回滚。

## 代码规范

- TypeScript，遵循仓库现有 eslint / prettier 配置。
- 优先改 `src/config.ts` 和内容文件；改组件、布局、插件前先说明影响范围。
- 构建时依赖外网的逻辑（远程图片、GitHub API）失败时必须降级跳过，不能让整站构建失败。
- 新增依赖需说明理由；大版本升级（Astro 等）先给方案。

## Git

- 英文 conventional commits：`post:` 文章新增/更新，`feat:`、`fix:`、`style:`、`chore:`、`docs:`。
- 文章内容与站点代码分开提交。
- 不添加 AI 署名。

## 交付检查

1. `pnpm build` 通过（本机网络受限导致远程资源失败时，说明情况，不当作通过）。
2. 涉及页面表现的改动，在 `pnpm dev` 下打开相关页面确认。
3. 未引入 Obsidian 语法、错误 front-matter、失效链接。
