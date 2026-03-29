# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UNIGRAN Sistema Comercial — an internal CMS-style web app for a commercial team. Non-technical admins manage content (sections + blocks) via a React dashboard backed by Supabase (PostgreSQL).

## Commands

```bash
npm run dev       # Start Vite dev server with hot reload
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
```

No linting or test setup exists in this project.

## Architecture

**Stack:** React 18 + React Router v6 + Supabase + Vite. Deployed as a static SPA on Vercel.

**Database** (`src/lib/supabase.js`): Three tables drive everything:
- `sections` — navigation tabs (title, emoji, slug, visibility, order_index, show_sidebar, sidebar_position)
- `blocks` — content within each section (type, title, JSON content, visibility, order_index)
- `settings` — key-value store (e.g., admin password)

**Routing** (`src/App.jsx`):
- `/` and `/:slug` → public `SectionPage` inside `Layout` (nav + outlet)
- `/admin/login` → `AdminLogin`
- `/admin/*` → `AdminDashboard` with nested admin views

**Public flow:** `Nav` queries sections → user clicks tab → `SectionPage` fetches section + its blocks → renders optional sidebar + `BlockRenderer` dispatches to one of 7 block type components.

**Admin flow:** Password checked against `settings` table, token stored in `sessionStorage` → `AdminDashboard` routes to `AdminSections`, `AdminBlocks`, `AdminSettings`, or `BlockEditor`.

**Block types** (rendered by `src/components/blocks/BlockRenderer.jsx`):
1. `text` — formatted paragraphs (supports HTML via `isHtml` flag)
2. `checklist` — grouped tasks with progress bar; completion saved in `localStorage` per user (`checklist_{blockId}`)
3. `table` — searchable data table with HTML-enabled cells
4. `links` — emoji+title+description+URL cards in a grid
5. `crm_template` — copy-paste text templates with one-click copy button
6. `notepad` — colored cards with title, body, and to-do lists; 18 color schemes; todos saved in `localStorage` (`notepad_todos_{blockId}`)
7. `search` — cross-block content search within the page; configurable placeholder and target block types

**Sidebar navigation:** Each section can optionally show a sidebar generated from its block titles. Configured via `show_sidebar` (boolean) and `sidebar_position` (`'left'`, `'top'`, or `'bottom'`) on the `sections` table.

## Environment Variables

Required in `.env` (or Vercel dashboard):
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Database Setup

Run `setup.sql` then `seed.sql` in the Supabase SQL Editor to initialize schema and sample data. For incremental changes, apply files under `migrations/` manually in the Supabase SQL Editor. No migration tooling — manual SQL only.

**Migration files:**
- `migrations/add_show_sidebar.sql` — adds `show_sidebar` and `sidebar_position` columns to `sections`
- `migrations/fix_blocks_type_constraint.sql` — updates the `type` CHECK constraint to include `notepad` and `search`

## Key Patterns

- **Content as JSON**: Each block's `content` field is a JSON object whose shape varies by type. `BlockEditor.jsx` (~960 lines) handles serialization for all 7 types with type-specific inline editors.
- **Ordering**: Up/Down buttons swap `order_index` values between adjacent rows.
- **Slugs**: Auto-generated from titles with accent normalization.
- **Visibility**: Soft-hide sections/blocks without deletion.
- **Styles**: All CSS lives in `src/index.css` (~800 lines, dark theme, CSS variables, mobile-responsive). Edit this for visual changes.
- **SPA routing**: `vercel.json` rewrites all paths to `index.html`.
- **Auth**: Admin password stored plaintext in `settings` table under key `admin_password`. Session tracked via `sessionStorage.admin_auth = 'true'`.
