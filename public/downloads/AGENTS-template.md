# Project Overview
<!-- section:project intro -->


## Key Technologies & Stack



## Development Commands



## Code Standards

### Current Repo Baseline (Overrides)

If any example in this file conflicts with the current repository implementation, this section takes precedence.


### Agent Interaction Protocol

Use these rules across IDE agents when executing tasks in this repository:

1. Keep responses concise and task-focused.
2. Prefer patch-level or changed-block outputs over full-file rewrites when presenting code.
3. Explain complex reasoning in Chinese when needed, while keeping code identifiers in English.
4. For simple UI/content fixes, skip over-formal reasoning blocks and focus on the edit.

### Documentation Updates

**CRITICAL**: Always update related documentation files after making code changes:

- After auth changes → Update [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md)
- After i18n changes → Update [docs/INTERNATIONALIZATION.md](docs/INTERNATIONALIZATION.md)
- After adding or removing pages/routes → Update the `## Project Structure` outline in [AGENTS.md](AGENTS.md)
- After UI component changes → Update [docs/UI_DESIGN.md](docs/UI_DESIGN.md)
- After API route changes → Update [docs/BACKEND_API.md](docs/BACKEND_API.md)
- After structured data/JSON-LD changes → Update [docs/STRUCTURED_DATA.md](docs/STRUCTURED_DATA.md)

Documentation should reflect the actual implementation, not intended behavior.

### Formatting & Linting

### API & Frontend Guardrails

### UI Component Pattern

### Adding New Components
**IMPORTANT**: NEVER manually add components to `src/components/ui`.



## Project Structure

## Domain-Specific Documentation

The project has detailed documentation for each domain. **ALWAYS read the relevant documentation files before working on related features.**

### ALWAYS Read These Files Before:

- **[docs/AUTHENTICATION.md](docs/AUTHENTICATION.md)**
  - When working with auth flows, protected routes, user sessions
  - Covers: Supabase auth, OAuth flow, getUser() caching pattern, middleware protection
  - Current repo baseline: Better Auth implementation details and related file map

- **[docs/INTERNATIONALIZATION.md](docs/INTERNATIONALIZATION.md)**
  - When modifying pages, adding translations, changing routes
  - Covers: next-intl setup, URL routing, component patterns, language switcher
  - Current repo baseline: `@nuxtjs/i18n` and `useI18n()` usage patterns

### Read When Relevant:

- **[docs/UI_DESIGN.md](docs/UI_DESIGN.md)**
  - When creating/modifying UI components
  - Covers: Design system, color palette, typography, styling conventions

- **[docs/BACKEND_API.md](docs/BACKEND_API.md)**
  - When creating API routes or working with backend logic
  - Covers: API route structure, logging patterns, error handling, external API integration

- **[docs/STRUCTURED_DATA.md](docs/STRUCTURED_DATA.md)**
  - When adding or modifying JSON-LD structured data for SEO
  - Covers: Schema builders, JsonLd component, schema types (WebSite, Organization, SoftwareApplication, FAQPage, MusicRecording, BreadcrumbList), translations, validation tools


## Quick Reference

### Authentication Usage


### Navigation with i18n


### Translations
```