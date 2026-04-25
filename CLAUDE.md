# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UNIGRAN Sistema Comercial — an internal CMS-style web app (playbook) for the commercial/sales team of UNIGRAN university. Non-technical admins manage content (sections + blocks) via a React dashboard backed by Supabase (PostgreSQL). Regular users access the content after a shared-password login. The system is a fully client-side SPA deployed on Vercel.

## Commands

```bash
npm run dev       # Start Vite dev server with hot reload
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
```

No linting or test setup exists in this project.

## Architecture

**Stack:** React 18 + React Router v6 + Supabase JS v2 + Vite 5. Deployed as a static SPA on Vercel.

**Entry point:** `index.html` → `src/main.jsx` → `src/App.jsx`

**Supabase client** (`src/lib/supabase.js`): single exported `supabase` instance created from `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`.

## Routing (`src/App.jsx`)

| Path | Component | Notes |
|------|-----------|-------|
| `/login` | `UserLogin` | Shared-password login for the sales team |
| `/admin/login` | `AdminLogin` | Admin password login |
| `/admin/*` | `AdminDashboard` | All admin views (sections, blocks, settings) |
| `/` | `Layout` → `SectionPage slug="inicio"` | Home page |
| `/:slug` | `Layout` → `SectionPage` | Any other section by slug |

`Layout` guards all public routes: redirects to `/login` unless `sessionStorage.user_auth === 'true'` or `sessionStorage.admin_auth === 'true'`.

## Database (`src/lib/supabase.js`)

Three tables drive everything. RLS is enabled; all policies are wide-open (`USING (true)`) since auth is handled at the app level.

### `sections` — navigation tabs
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| title | text | Tab label |
| emoji | text | Displayed in nav and page header |
| slug | text | UNIQUE; used as URL path |
| order_index | integer | Controls nav order |
| visible | boolean | Soft-hide without deletion |
| show_sidebar | boolean | Enable block-navigation sidebar |
| sidebar_position | text | `'left'`, `'top'`, or `'bottom'` |
| sidebar_sticky | boolean | Only for `top` position; sticks bar on scroll |
| created_at | timestamptz | |

### `blocks` — content within each section
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| section_id | uuid | FK → sections (CASCADE DELETE) |
| type | text | CHECK constraint; see block types below |
| title | text | Displayed as card header; also used by sidebar |
| content | jsonb | Shape varies by type |
| order_index | integer | |
| visible | boolean | |
| created_at | timestamptz | |

Valid `type` values: `text`, `checklist`, `table`, `links`, `crm_template`, `notepad`, `search`

### `settings` — key-value store
| Key | Description |
|-----|-------------|
| `admin_password` | Admin panel password (plaintext). Default: `unigran2026` |
| `user_password` | Sales team login password (plaintext). Default: `unigran76` |

## Authentication

- **User login** (`/login`): password compared against `settings.user_password`; fallback `'unigran76'` if key missing. Sets `sessionStorage.user_auth = 'true'`, redirects to `/`.
- **Admin login** (`/admin/login`): password compared against `settings.admin_password`. Sets `sessionStorage.admin_auth = 'true'`, redirects to `/admin`.
- Both sessions are cleared on page/tab close (sessionStorage).
- No JWT, no Supabase Auth — purely client-side flag.

## Public Flow

1. `Layout` checks sessionStorage → renders `<Nav>` + `<Outlet>`.
2. `Nav` queries `sections` (visible=true, ordered) → renders tab links + "⚙ Admin" button.
3. `SectionPage` fetches the section by slug + its visible blocks (ordered).
4. Sidebar logic: if `show_sidebar` + blocks with titles exist, renders `SidebarNav` at the configured position. Clicking a sidebar item shows that single block (no scroll) while `activeId` state controls which block is visible.
5. Sticky bars: search blocks with `content.sticky=true` and/or top-position sidebar with `sidebar_sticky=true` are rendered in a fixed `.page-sticky-bar`.
6. `BlockRenderer` dispatches each block to its type-specific component.

## Block Types & Content Schemas

### 1. `text`
```json
{ "body": "<p>HTML string</p>", "isHtml": true }
```
Supports full rich-text HTML (bold, italic, underline, color, alignment). Falls back to line-split plain text rendering if `isHtml` is false.

### 2. `checklist`
```json
{
  "subtitle": "Optional tip text shown at top",
  "groups": [
    {
      "title": "Group name",
      "tip": "Optional group tip",
      "items": [{ "id": "unique_id", "label": "Item text (may be HTML)", "url": "optional link" }]
    }
  ],
  "closing_tip": "Optional motivational text at bottom"
}
```
User progress stored in `localStorage` under key `checklist_{blockId}` (object: `{ itemId: boolean }`). "Resetar" button clears it.

### 3. `table`
```json
{
  "subtitle": "Optional description",
  "searchable": true,
  "headers": ["Col 1", "Col 2"],
  "rows": [["cell HTML", "cell HTML"]]
}
```
Headers and cells support HTML. If `searchable`, shows a search input that filters rows by stripping HTML first.

### 4. `links`
```json
{
  "items": [{ "emoji": "🔗", "title": "Card title", "description": "Short desc", "url": "https://..." }]
}
```
Renders as a responsive CSS grid of clickable cards (open in new tab).

### 5. `crm_template`
```json
{
  "templates": [{ "label": "📄 Template name", "text": "Plain text content" }]
}
```
Accordion-style cards. "📋 Copiar" button copies `text` to clipboard. When a `highlightTerm` matches, the matching template auto-expands.

### 6. `notepad`
```json
{
  "instructions": "Optional header text",
  "layout": "grid",
  "cards": [
    {
      "id": "c_1234",
      "title": "Optional title",
      "color": "#fef9c3",
      "body": "<p>Rich text HTML</p>",
      "isHtml": true,
      "todos": [{ "id": "t_1234", "text": "Todo item text" }]
    }
  ]
}
```
18 color schemes. `layout`: `'grid'` (max 3/row) or `'stack'` (single column). Todo completion stored in `localStorage` under `notepad_todos_{blockId}`.

### 7. `search`
```json
{
  "placeholder": "Search box hint text",
  "search_in": ["text", "checklist"],
  "sticky": false
}
```
`search_in`: array of block types to search (empty = all types). `sticky`: if true, floats in `.page-sticky-bar`. Searches other blocks on the same page by extracting plain text from their JSON content. Min 2 characters to trigger. Shows max 12 results with snippet + highlight. Clicking a result calls `onNavigate(blockId, term)` on `SectionPage`, which highlights the target card for 5 seconds.

## Admin Flow

### `AdminDashboard` (`src/pages/AdminDashboard.jsx`)
- Checks `sessionStorage.admin_auth`; redirects to login if missing.
- Left sidebar with views: `sections`, `blocks` (per section), `settings`.
- State: `view` string + `selectedSection` object.

### `AdminSections` (`src/components/admin/AdminSections.jsx`)
- Lists all sections (ordered). Up/Down buttons swap `order_index` values.
- Modal form: emoji, title, slug (auto-slugified from title, editable), show_sidebar toggle, sidebar_position radio (`left`/`top`/`bottom`), sidebar_sticky checkbox (only for `top`).
- Toggle visibility (soft-hide), delete with confirm dialog.

### `AdminBlocks` (`src/components/admin/AdminBlocks.jsx`)
- Lists blocks for selected section. Same Up/Down ordering, visibility toggle, delete.
- Opens `BlockEditor` for new or existing blocks.

### `BlockEditor` (`src/components/admin/BlockEditor.jsx`)
- ~960 lines. Handles all 7 block types with inline editors.
- Type can only be changed for new blocks (not existing).
- Sub-editors: `TextEditor` (contentEditable rich text), `ChecklistEditor`, `TableEditor` (contentEditable cells), `LinksEditor`, `CrmEditor`, `NotebookEditor` (with `NoteCardEditor`), `SearchEditor`.
- Rich text uses `document.execCommand` (bold, italic, underline, font, size, color, alignment).
- Table cells use `TableCell` component with `contentEditable` + `onBlur` to persist HTML.
- `getDefaultContent(type)` provides initial content shape for each type.

### `AdminSettings` (`src/components/admin/AdminSettings.jsx`)
- Two `PasswordCard` components: one for `admin_password`, one for `user_password`.
- Uses `supabase.upsert` to update the `settings` table.
- Minimum 6 characters enforced client-side.

## Key Patterns

- **Content as JSON**: `blocks.content` is a JSONB object whose shape varies by type. `BlockEditor.jsx` handles all serialization with type-specific inline editors.
- **Ordering**: Up/Down buttons swap `order_index` between adjacent rows — no batch reorder.
- **Slugs**: Auto-generated via `slugify()` (NFD normalize → strip accents → lowercase → replace spaces with `-`). Editable after creation.
- **Visibility**: Soft-hide sections/blocks without deletion via `visible` boolean.
- **localStorage**: Checklist progress and notepad todo completion are per-user (browser), not in the database. Keys: `checklist_{blockId}`, `notepad_todos_{blockId}`.
- **Highlight system**: `SearchBlock` calls `onNavigate(blockId, term)` → `SectionPage` sets `highlight` state for 5s → passed as `highlightTerm` to `BlockRenderer` → individual block components apply `applyHighlight()`.
- **Rich text**: Uses browser's `execCommand` API (legacy but functional). HTML stored directly in `body` field.
- **SPA routing**: `vercel.json` rewrites all paths to `index.html`.

## Styles (`src/index.css`)

~800 lines, dark theme, CSS custom properties, mobile-responsive.

**Key CSS variables:**
```css
--bg: #1a1a1a        /* page background */
--bg-2: #2c2c2c      /* cards, nav */
--bg-3: #222222      /* inputs, secondary */
--border: #495057
--text: #ffffff
--text-2: #adb5bd    /* secondary text */
--text-3: #6c757d    /* muted text */
--accent: #f0ad4e    /* orange/gold — primary color */
--accent-blue: #164e9b
--danger: #ef4444
--r: 8px             /* border-radius */
--r-lg: 12px
--nav-h: 70px
--font: 'Inter', sans-serif
```

Body has an animated radial gradient background (blue + gold, 20s loop). All visual changes go in `src/index.css`.

## File Map

```
src/
  App.jsx                          # Router with all routes
  main.jsx                         # ReactDOM.createRoot entry
  index.css                        # All styles (~800 lines)
  lib/
    supabase.js                    # Supabase client singleton
  pages/
    UserLogin.jsx                  # /login (sales team)
    AdminLogin.jsx                 # /admin/login
    AdminDashboard.jsx             # /admin/* shell with sidebar
    SectionPage.jsx                # Public section view with sidebar logic
  components/
    Layout.jsx                     # Auth guard + Nav + Outlet
    Nav.jsx                        # Top nav bar with section tabs
    admin/
      AdminSections.jsx            # Section list + modal form
      AdminBlocks.jsx              # Block list for a section
      AdminSettings.jsx            # Password management
      BlockEditor.jsx              # Block content editor (~960 lines)
    blocks/
      BlockRenderer.jsx            # Dispatcher + all 7 block components

migrations/
  add_show_sidebar.sql             # Adds show_sidebar, sidebar_position columns
  add_sidebar_sticky.sql           # Adds sidebar_sticky column
  fix_blocks_type_constraint.sql   # Updates CHECK to include notepad + search
  insert_ramais.sql                # Inserts phone extension table block

setup.sql    # Creates all tables + RLS policies
seed.sql     # Sample sections and blocks (initial data)
vercel.json  # SPA rewrite rule
vite.config.js
```

## Environment Variables

Required in `.env` (or Vercel dashboard):
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Database Setup

Run `setup.sql` then `seed.sql` in the Supabase SQL Editor to initialize schema and sample data. For incremental changes, apply files under `migrations/` manually in the Supabase SQL Editor. No migration tooling — manual SQL only.

**Migration files (apply in order if setting up fresh):**
1. `setup.sql` — creates tables + RLS
2. `seed.sql` — sample data
3. `migrations/add_show_sidebar.sql` — adds `show_sidebar` and `sidebar_position` to sections
4. `migrations/add_sidebar_sticky.sql` — adds `sidebar_sticky` to sections
5. `migrations/fix_blocks_type_constraint.sql` — updates CHECK to include `notepad` and `search`
6. `migrations/insert_ramais.sql` — inserts the phone extensions table into "Informações Extras"

## Seções Iniciais (seed.sql)

| Slug | Emoji | Content |
|------|-------|---------|
| inicio | 🏠 | Links block (Google Drive, docs, convênios) |
| checklist-diario | ✅ | Daily checklist for sales reps (4 groups) |
| crm | 📊 | CRM note templates (RD Station) |
| investimentos | 💰 | Tables: Matrícula 2025 + Mensalidade 2026 |
| formas-de-ingresso | 🎯 | Placeholder text |
| diferenciais | 🚀 | Placeholder text |
| informacoes-extras | 💡 | Phone extensions table (insert_ramais.sql) |
| unigran-academy | 🎓 | Placeholder text |
| pergunte-para-a-uni | 🤖 | Placeholder text |

## Context

- **Target users:** Non-technical sales/commercial team at UNIGRAN university (Dourados, MS, Brazil).
- **Admin user:** João Adriel (gestor de captação, ramal 3102).
- **Content language:** Brazilian Portuguese throughout.
- **No tests, no lint config** — keep changes minimal and verify visually.
