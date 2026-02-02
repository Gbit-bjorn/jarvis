# AGENTS.md — Accumulated Learnings & Conventions

> This file is read by every agent at the start of each iteration.
> Add learnings, patterns, and gotchas discovered during development.
> Keep entries concise and actionable.

---

## Project Conventions

### Naming
- Components: `PascalCase.tsx` (e.g., `GlowPanel.tsx`)
- Hooks: `use-kebab-case.ts` (e.g., `use-projects.ts`)
- Stores: `kebab-case-store.ts` (e.g., `project-store.ts`)
- Python modules: `snake_case.py`
- Python classes: `PascalCase`
- Database tables: `snake_case` (plural: `projects`, `features`)
- CSS classes: Tailwind utilities + custom `.glow-*` classes
- IPC channels: `kebab-case` (e.g., `create-project`, `list-features`)
- WebSocket messages: `snake_case` type field (e.g., `agent_status`, `scan_env`)

### Import Order (TypeScript)
```
1. React / external libraries
2. Internal components (@/components/...)
3. Hooks (@/hooks/...)
4. Stores (@/stores/...)
5. Types (@/types/...)
6. Utils (@/lib/...)
7. Styles (if any)
```

### Import Order (Python)
```
1. Standard library (os, sys, asyncio, typing)
2. Third-party (pydantic, websockets, structlog)
3. Local modules (from .base import BaseAgent)
```

### Component Structure (React)
```
1. Props interface
2. Component function
3. Hooks (useState, useEffect, custom)
4. Derived state / computed values
5. Event handlers
6. Render return
7. Export default
```

---

## Architecture Patterns

### IPC Communication Flow
```
Renderer → (invoke) → Preload → (ipcRenderer) → Main Process → (handler) → SQLite/Service
Renderer ← (result) ← Preload ← (ipcRenderer) ← Main Process ← (return) ← SQLite/Service
```

### WebSocket Communication Flow
```
Renderer → (send via hook) → Main Process (proxy) → Python Backend
Renderer ← (event via hook) ← Main Process (proxy) ← Python Backend
```

### Agent Lifecycle
```
spawned → initializing → running → [paused] → completing → completed
                                  → [failed] → terminated
                                  → [circuit_breaker] → terminated
```

### Feature Lifecycle
```
pending → in_progress → review → approved → completed
                      → failed → pending (retry)
```

---

## Known Patterns

### Electron + Vite
- Use `electron-vite` or configure Vite manually with electron plugin
- Main process runs in Node.js context — can use `require`, `fs`, `child_process`
- Renderer process is sandboxed — communicate via preload/IPC only
- Hot reload works for renderer; main process requires restart

### SQLite in Electron
- Use `better-sqlite3` (synchronous, faster for desktop use)
- Connection created once in main process, shared via IPC handlers
- WAL mode for concurrent reads during agent operations
- ALWAYS use parameterized queries: `db.prepare('SELECT * FROM x WHERE id = ?').get(id)`

### Python Backend
- Spawned as child process from Electron main process
- Uses virtual environment (created in postinstall script)
- Communicates via WebSocket on localhost:9721
- Electron monitors health; restarts on crash (max 3 retries, then alert user)
- Python process inherits environment variables from Electron (including CLAUDE_CODE_OAUTH_TOKEN)

### Claude Agent SDK Usage
- Auth via CLAUDE_CODE_OAUTH_TOKEN environment variable
- Each agent session = one SDK client instance
- Working directory = worktree path for that feature
- Use `--print` mode for programmatic output
- Parse structured output (JSON when possible)
- Handle rate limits with exponential backoff

### Git Worktrees
- Created at `../{project-name}-worktrees/{branch}/` (sibling of project)
- Each coding agent gets exclusive access to its worktree
- Merge conflicts resolved manually (flagged to user)
- Clean up worktrees after successful merge
- NEVER create worktrees inside the main project directory

---

## Gotchas & Warnings

### Electron
- `app.getPath('userData')` gives the correct path for persistent storage
- Window `close` event should minimize to tray, not quit (override default)
- `contextBridge.exposeInMainWorld` — exposed API must be serializable (no functions with closures)
- BrowserWindow.loadURL vs loadFile depends on dev vs production mode

### React
- Zustand stores should NOT be recreated on component mount — define at module level
- WebSocket connections should be managed in a single hook/provider, not per-component
- Use `useCallback` for handlers passed to child components to prevent unnecessary re-renders
- Virtual scrolling (react-virtuoso) needed for any list that could exceed 100 items

### Python
- `psutil.cpu_percent(interval=1)` blocks for 1 second — run in thread/async
- `gitpython` can be slow on large repos — cache repo objects
- WebSocket server must handle disconnections gracefully (Electron restart)
- Claude Agent SDK requires Node.js installed (it wraps the CLI) — verify in env scan

### Styling
- Tailwind JIT may not detect dynamic class names — use full class strings, not template literals
- Glow effects: use `box-shadow` for borders, `text-shadow` for text, `filter: drop-shadow` for SVG
- Semi-transparent backgrounds need `backdrop-filter: blur()` for glass effect — GPU intensive, use sparingly
- Test all UI in both windowed and maximized modes

### Database
- SQLite doesn't enforce string lengths — validate in application code
- DATETIME stored as TEXT in ISO 8601 format
- JSON columns stored as TEXT — parse in application layer
- Foreign key cascades must be explicitly defined in migration

---

## Performance Notes

- Electron window target: 60fps constant
- WebSocket batch messages to UI: max 10 updates/second (debounce in hook)
- Log viewer: MUST use virtual scrolling — logs can reach 100k+ entries
- Agent monitoring: poll system resources every 2 seconds, not faster
- SQLite: add indexes on columns used in WHERE clauses for tables > 1000 rows

---

*Updated by agents during development. Do not remove entries — they prevent repeated mistakes.*
