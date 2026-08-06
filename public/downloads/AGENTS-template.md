# Project Overview
<!-- section:project intro -->

在这里说明项目目标、主要用户、核心功能和当前阶段。

## Key Technologies & Stack

- 前端框架与版本：
- 后端框架与版本：
- 数据库与存储：
- 包管理器与运行时：

## Development Commands

```text
# 安装依赖

# 启动开发环境

# 运行检查、测试和构建
```

## Code Standards

### Current Repo Baseline (Overrides)

如果本文件中的示例与当前仓库实现冲突，以本节记录的实际实现为准，并同步修正模板内容。

### Agent Interaction Protocol

1. 保持回复简洁并聚焦当前任务。
2. 展示代码时优先展示补丁或修改区块，不输出无关的完整文件。
3. 必要时使用中文解释复杂推理，代码标识符保持英文。
4. 简单的 UI 或内容修改，直接说明修改内容和验证结果。

### Documentation Updates

代码变化后必须同步相关文档：

- 认证变化 → 更新 `docs/AUTHENTICATION.md`
- 国际化变化 → 更新 `docs/INTERNATIONALIZATION.md`
- 页面或路由变化 → 更新本文件的 `Project Structure`
- UI 组件变化 → 更新 `docs/UI_DESIGN.md`
- API 变化 → 更新 `docs/BACKEND_API.md`
- JSON-LD 或 SEO 变化 → 更新 `docs/STRUCTURED_DATA.md`

### Formatting & Linting

记录格式化、Lint、类型检查和测试要求。

### API & Frontend Guardrails

记录 API、数据访问、错误处理、权限和前端状态管理的边界。

### UI Component Pattern

记录组件命名、目录、样式、响应式和可访问性约定。

### Adding New Components

记录新增组件的标准流程，以及禁止手动修改的目录。

## Project Structure

```text
在这里维护核心目录和文件的结构说明。
```

## Domain-Specific Documentation

项目有按领域拆分的详细文档。处理相关任务前，必须阅读对应文件。

### ALWAYS Read These Files Before:

- `docs/AUTHENTICATION.md`：认证、会话和受保护路由
- `docs/INTERNATIONALIZATION.md`：语言、翻译和 URL 路由

### Read When Relevant:

- `docs/UI_DESIGN.md`：创建或修改 UI 组件
- `docs/BACKEND_API.md`：创建 API 或修改后端逻辑
- `docs/STRUCTURED_DATA.md`：修改 JSON-LD、SEO 或结构化数据

## Quick Reference

### Authentication Usage

记录项目中正确的登录、会话和权限使用方式。

### Navigation with i18n

记录项目中正确的国际化导航方式。

### Translations

记录翻译文件位置、Key 命名和新增翻译流程。
