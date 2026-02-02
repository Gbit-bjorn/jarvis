# JARVIS — Product Requirements Document (PRD)

> **Execution model**: This PRD is consumed by the Ralph Loop. Each item should be completable in one context window. Items are checked off in `progress.json` as they complete. Execute items IN ORDER within each phase — later items depend on earlier ones.

---

## Phase 1: Foundation

### 1.1 Project Scaffolding

- [ ] **P1-001**: Initialize npm workspace with `package.json`. Set up Electron + Vite + React + TypeScript project structure. Install core dependencies: `electron`, `vite`, `@vitejs/plugin-react`, `react`, `react-dom`, `typescript`, `tailwindcss`, `zustand`, `react-router-dom`, `better-sqlite3`, `electron-builder`. Configure `tsconfig.json` with strict mode, path aliases (`@/` → `src/renderer/`). Configure Vite for Electron (electron-vite or custom config). Verify: `npm run dev` opens an empty Electron window.

- [ ] **P1-002**: Create the Electron main process entry (`src/main/index.ts`). Set up BrowserWindow with: width 1400, height 900, minWidth 1024, minHeight 768, frame: false (custom titlebar), webPreferences with preload script, dark background color (#0A0A0F). Enable contextIsolation, disable nodeIntegration. Create preload script (`src/preload/index.ts`) with contextBridge exposing a `jarvis` API namespace. Verify: Window opens with custom frameless chrome.

- [ ] **P1-003**: Set up Tailwind CSS with the Jarvis theme. Create `tailwind.config.ts` extending colors with the full Jarvis palette (bg-primary: #0A0A0F, color-primary: #00D4FF, etc. — see CLAUDE.md for complete list). Create `globals.css` with Tailwind directives + custom CSS variables for glow effects. Create `jarvis-theme.css` with reusable glow classes (`.glow-sm`, `.glow-md`, `.glow-lg`, `.glow-text`, `.glow-border`). Create `animations.css` with keyframes: `pulse-glow`, `scan-line`, `fade-in`, `slide-up`. Import fonts: Rajdhani (Google Fonts), JetBrains Mono (Google Fonts), Inter (Google Fonts). Verify: A test component renders with cyan glow text on dark background.

- [ ] **P1-004**: Build the core HUD component library. Create `GlowPanel.tsx`: dark semi-transparent panel with glowing border, optional corner accents (L-shaped SVG lines), hover state with brighter glow, loading state with scan-line animation. Props: `title`, `children`, `loading`, `variant` (default|accent|warning|error), `className`. Create `CircularProgress.tsx`: SVG concentric ring progress indicator, animated fill with glow trail, center content slot, color based on value (cyan→green→amber→red). Props: `value` (0-100), `size`, `strokeWidth`, `label`. Create `ArcMeter.tsx`: 180° arc gauge for CPU/RAM, tick marks, threshold coloring. Props: `value`, `max`, `thresholds`, `label`. Create `PulseIndicator.tsx`: small circle with pulse animation, color variants for status (green=active, amber=busy, red=error, gray=idle). Create `ScanLine.tsx`: horizontal scanning line animation overlay. Verify: Storybook-style test page showing all HUD components with various props.

- [ ] **P1-005**: Build the application shell layout. Create `MainLayout.tsx` with: custom titlebar (app name "JARVIS" + window controls: minimize, maximize, close), left sidebar navigation (icon + tooltip: Dashboard, Projects, Agents, Planner, Logs, Settings), main content area with React Router outlet. Sidebar uses Rajdhani font, cyan active indicator, hover glow. Titlebar has drag region for window movement. Create `Sidebar.tsx`, `TopBar.tsx` as separate components. Wire up React Router with routes: `/` (dashboard), `/projects/:id`, `/agents`, `/planner/:id`, `/logs`, `/settings`. Verify: App shows Jarvis-themed shell with working navigation between empty route pages.

### 1.2 Database & Storage

- [ ] **P1-006**: Set up SQLite database in the Electron main process. Create `src/main/services/db.ts` using `better-sqlite3`. Database path: `{app.getPath('userData')}/jarvis.db`. Enable WAL mode and foreign keys. Create migration runner that reads `.sql` files from `db/migrations/` in order. Verify: Database created on app start, migrations table exists.

- [ ] **P1-007**: Create initial database migration (`db/migrations/001_initial.sql`). Tables: `projects` (id, name, description, path, tech_stack JSON, github_repo, github_account_id, status, progress_pct, created_at, updated_at), `feature_groups` (id, project_id FK, name, sort_order, status, created_at), `features` (id, project_id FK, group_id FK, title, description, detailed_spec, status, requires_approval, approved, iteration_count, max_iterations, created_at, completed_at), `agent_sessions` (id, project_id FK, feature_id FK, agent_type, status, iteration_number, tokens_used, summary, started_at, ended_at), `agent_logs` (id, session_id FK, level, message, details, timestamp), `auth_tokens` (id, provider, label, token_encrypted, account_name, created_at, expires_at), `global_settings` (key, value, updated_at), `env_scan_results` (id, project_id FK, tool_name, version_found, version_required, status, scanned_at), `notifications` (id, project_id FK, type, recipient_email, subject, body, sent, reply_content, sent_at, replied_at), `project_memory` (id, project_id FK, scope, key, value, created_at, updated_at), `skills` (id, name, source, config JSON, enabled, installed_at). All tables have appropriate indexes. Verify: All tables created, foreign keys enforced.

- [ ] **P1-008**: Create encrypted token storage. Create `src/main/services/auth-store.ts`. Generate machine-specific encryption key using `crypto` (derived from machine-id or hostname + username hash). Encrypt/decrypt tokens using AES-256-GCM. Functions: `storeToken(provider, label, token, accountName)`, `getToken(id)`, `listTokens()`, `deleteToken(id)`. Tokens stored in `auth_tokens` table with `token_encrypted` column. NEVER log decrypted tokens. Verify: Store a test token, retrieve it, verify it matches. Encrypted value in DB is not readable.

### 1.3 Settings & Configuration UI

- [ ] **P1-009**: Build the Settings page with Auth configuration. Create `SettingsLayout.tsx` with tab navigation: Auth, Agents, Notifications, About. Create `AuthSettings.tsx`: form to add/edit/delete Claude OAuth token (masked input, test connection button), form to add/edit/delete GitHub tokens with label (e.g., "Personal", "School", "g-bit"), list showing configured tokens with status indicators. All forms use GlowPanel styling. Save button triggers IPC to main process → stores encrypted in SQLite. Verify: Can add Claude token + GitHub token, see them listed (masked), delete them.

- [ ] **P1-010**: Build Agent settings page. Create `AgentSettings.tsx`: max parallel agents slider (1-20, default 5), max iterations per feature slider (10-100, default 35), context rotation threshold sliders (warn: 50k-150k, rotate: 60k-180k), CPU threshold slider (60-95%, default 80), RAM threshold slider (60-95%, default 85), default autonomous mode toggle (on by default). All values stored in `global_settings` table. Verify: Settings save and persist across app restarts.

### 1.4 Python Backend Foundation

- [ ] **P1-011**: Set up Python backend project. Create `backend/` directory with `pyproject.toml` (dependencies: websockets, pydantic, structlog, psutil, gitpython, aiofiles, cryptography). Create `backend/main.py`: async WebSocket server on `localhost:9721`. Protocol: JSON messages with `{type, payload}` structure. Message types: `ping/pong` (health), `scan_env`, `start_agent`, `stop_agent`, `agent_status`, `chat_message`. Create startup script in Electron main process (`src/main/services/python-bridge.ts`) that: checks for Python 3.11+, creates/activates venv if needed, installs requirements, spawns `main.py` as child process, monitors health via ping/pong, restarts on crash (max 3 retries). Verify: Electron app starts → Python backend starts → WebSocket connected → ping/pong works.

- [ ] **P1-012**: Create the Environment Scanner. Create `backend/core/env_scanner.py`. Async scanning functions that detect: Node.js (`node --version`), npm/yarn/pnpm/bun, Python (`python --version`), pip/pipenv/poetry, PHP (`php --version`), composer, .NET SDK (`dotnet --version`), Java (`java --version`), Git (`git --version` + `git config user.name/email`), Docker (`docker --version` + running status), database servers (MySQL, PostgreSQL, MongoDB — check if port is listening). Return structured results: `[{tool, version_found, status: found|missing|wrong_version}]`. Create WebSocket handler for `scan_env` message type. Create IPC handler in Electron main. Create `EnvironmentScanner.tsx` component showing scan results with status icons (✅/⚠️/❌). Verify: Trigger scan from UI, see results for installed tools on the current system.

---

## Phase 2: Project Management

### 2.1 Project CRUD

- [ ] **P2-001**: Create Project Management IPC layer. Create `src/main/ipc/projects.ipc.ts` with handlers: `create-project` (name, description, path, techStack, githubRepo, githubAccountId), `list-projects`, `get-project(id)`, `update-project(id, data)`, `delete-project(id)`, `import-project(path)` (reads existing repo, detects tech stack from files). Import detection: check for `package.json` → Node.js, `requirements.txt`/`pyproject.toml` → Python, `composer.json` → PHP, `*.csproj` → .NET, `Cargo.toml` → Rust. All handlers interact with SQLite. Verify: Can create, read, update, delete projects via IPC.

- [ ] **P2-002**: Build the Dashboard page. Create route `/` with `Dashboard.tsx`. Components: `ProjectList.tsx` showing project cards in a grid (2-3 columns). Each `ProjectCard.tsx` shows: project name, tech stack badges, CircularProgress with completion %, last activity timestamp, status badge (idle/active/error), agent count if active. "New Project" card with + icon and glow border. Click card → navigate to `/projects/:id`. SystemStatus panel (top-right): CPU ArcMeter, RAM ArcMeter, active agent count, Python backend status indicator. Verify: Dashboard shows test project cards with Jarvis styling, system status gauges update.

- [ ] **P2-003**: Build New Project wizard. Create modal or dedicated page with 3 steps: Step 1 — "Create New" or "Import Existing" choice. Step 2a (New) — name, description, tech stack multi-select (React, Vue, Node, Python, PHP, C#, etc.), GitHub repo URL (optional), GitHub account selector (from stored tokens). Step 2b (Import) — folder picker dialog, auto-detect tech stack, show detected info for confirmation. Step 3 — Environment scan for the selected/detected tech stack, show results, confirm & create. On submit: create DB record, run env scan, store results. Verify: Can create new project AND import existing folder, both appear on dashboard.

- [ ] **P2-004**: Build Project Detail page. Create route `/projects/:id` with `ProjectDetail.tsx`. Sections: project header (name, status, progress ring), tab navigation (Overview, Features, Agents, Logs, Settings), Overview tab: progress summary, recent activity timeline, tech stack info, GitHub link. This page is the hub — other tabs filled in subsequent phases. Verify: Navigate from dashboard to project detail, see overview with correct data.

---

## Phase 3: Feature Planning

### 3.1 PRD & Feature System

- [ ] **P3-001**: Build the Feature Group and Feature data layer. Create IPC handlers in `src/main/ipc/features.ipc.ts`: `create-feature-group(projectId, name)`, `list-feature-groups(projectId)`, `reorder-feature-groups(projectId, orderedIds[])`, `create-feature(groupId, title, description)`, `update-feature(id, data)`, `delete-feature(id)`, `toggle-approval(featureId, requires)`, `bulk-create-features(groupId, features[])`. Feature statuses: `pending`, `in_progress`, `review`, `approved`, `completed`, `failed`. Group statuses: `pending`, `in_progress`, `completed`. Verify: CRUD operations work via IPC, groups reorder correctly.

- [ ] **P3-002**: Build the Feature Planner page. Create route `/planner/:projectId` with `FeaturePlanner.tsx`. Left panel (70%): Feature groups as draggable sortable list using `@dnd-kit/sortable`. Each group is a collapsible card showing: drag handle (☰), group name (editable), feature count, status badge, [AUTO]/[APPROVE] toggle. Expanded group shows child features as smaller cards with: title, status pill, approval toggle. Right panel (30%): "Add Group" button, "Import PRD" button, bulk feature creator (textarea → parse into features). Drag & drop must feel smooth with Jarvis-themed drag overlay (glowing border). Verify: Can create groups, add features, drag to reorder groups, toggle approval. State persists.

- [ ] **P3-003**: Build PRD import functionality. Create `PrdImporter.tsx` modal. Accepts: paste text (Markdown with headings/bullets/checkboxes), upload `.md` file, upload `.json` file (structured PRD format). Parser logic: detect headings → create feature groups, detect bullets/checkboxes under headings → create features, detect descriptions → populate feature descriptions. Preview parsed structure before importing. "Import" button creates all groups and features in DB. Also create export: generate PRD markdown from current groups/features. Verify: Import a markdown PRD with 3 sections and 10 features, verify correct grouping. Export and re-import produces identical structure.

- [ ] **P3-004**: Build Prompt Enhancement integration. Create WebSocket message type `enhance_prd`. In Python backend, create `backend/agents/enhancer.py`: takes a list of vague feature descriptions, calls Claude (via Agent SDK) to expand each into detailed, actionable specs with acceptance criteria, tech considerations, and dependencies. Returns enhanced specs. Frontend: "Enhance" button on each feature → sends to backend → shows loading → updates feature with detailed_spec. Also "Enhance All" button for bulk enhancement. Show before/after comparison. Verify: Write a vague feature like "add login", enhance it, get back detailed spec with acceptance criteria.

---

## Phase 4: Agent Orchestration Engine

### 4.1 Core Agent System

- [ ] **P4-001**: Create the base Agent class in Python. Create `backend/agents/base.py` with `BaseAgent` abstract class: `agent_id`, `agent_type`, `feature_id`, `project_path`, `worktree_path`, `status` (idle, starting, running, paused, completed, failed, terminated), `iteration_count`, `max_iterations`, `tokens_used`, `started_at`. Abstract methods: `async run()`, `async stop()`, `async get_status()`. Concrete methods: `log(level, message)` → sends to WebSocket + stores in SQLite, `update_progress(item_id, status)`, `check_circuit_breaker()` → raises if max iterations exceeded, `check_resource_limits()` → queries ResourceManager. Verify: Import BaseAgent, instantiate a dummy subclass, verify lifecycle methods work.

- [ ] **P4-002**: Create the Resource Manager. Create `backend/core/resource_manager.py`. Singleton class using `psutil`: `get_cpu_usage()` → float (0-100), `get_ram_usage()` → float (0-100), `get_active_agent_count()` → int, `can_spawn_agent()` → bool (checks CPU < threshold AND RAM < threshold AND agents < max), `get_system_status()` → dict with all metrics. Thresholds loaded from config (defaults: CPU 80%, RAM 85%, max agents 10). Expose via WebSocket: `system_status` message sent every 2 seconds. Frontend: connect SystemStatus component to WebSocket, update ArcMeters in real-time. Verify: System status shown in dashboard, gauges move with actual CPU/RAM.

- [ ] **P4-003**: Create Git Worktree Manager. Create `backend/core/worktree_manager.py` using `gitpython`. Functions: `create_worktree(project_path, branch_name)` → creates worktree at `../{project-name}-worktrees/{branch}/`, creates branch from current HEAD, returns worktree path. `list_worktrees(project_path)` → list of active worktrees. `delete_worktree(worktree_path)` → removes worktree and optionally deletes branch. `merge_worktree(project_path, worktree_path, target_branch)` → merge worktree branch into target, handle conflicts (report to user). Branch naming: `jarvis/feature/{group-slug}/{feature-slug}`. Verify: Create worktree, verify directory exists, verify branch exists, merge back, verify merged.

- [ ] **P4-004**: Create the Coding Agent (Ralph Loop). Create `backend/agents/coder.py` extending `BaseAgent`. This is the core Ralph Loop agent. On `run()`: 1) Read project PRD/features from DB, 2) Read progress.json for completed items, 3) Find next unchecked item assigned to this agent, 4) Call Claude Agent SDK with feature context + instructions, 5) Agent implements the feature in the worktree, 6) Run tests (`npm test` or `pytest` or equivalent), 7) Run typecheck (`tsc --noEmit` or `mypy`), 8) If tests pass → update progress.json → update feature status in DB, 9) If tests fail → log failure → add guardrail → retry, 10) Update AGENTS.md with learnings, 11) Check context usage → rotate if > threshold, 12) Check circuit breaker → stop if max iterations. Loop continues until all assigned items complete or circuit breaker trips. Verify: Agent can complete a simple feature (e.g., create a hello world file + test) in a worktree.

- [ ] **P4-005**: Create the Orchestrator. Create `backend/core/orchestrator.py`. The brain of JARVIS. Responsibilities: receives "start build" command for a project, reads feature groups in order, for each group: checks ResourceManager → spawns agents for features (parallel within group), monitors agent progress via WebSocket, handles completion events, handles failure events, manages approval gates (pauses if feature requires approval, sends notification, waits for user response), after group complete → proceeds to next group, after all groups → sends completion notification. State machine: `idle` → `scanning` → `planning` → `building` → `reviewing` → `completed`. Exposes all state via WebSocket. Verify: Orchestrator can manage a project with 2 groups of 2 features each, executing groups sequentially and features in parallel within each group.

### 4.2 Agent Monitoring UI

- [ ] **P4-006**: Build the Agent Monitor page. Create route `/agents` (global) and `/projects/:id/agents` (per-project) with `AgentMonitor.tsx`. Top section: large CircularProgress showing overall project progress. Agent cards in a grid, each showing: agent type icon + name, current feature title, iteration X/Y progress bar, tokens used bar (X/200k), status PulseIndicator, last action summary (1-2 lines), elapsed time. Color coding: active=cyan, completing=green, error=red, idle=gray. Cards update in real-time via WebSocket. Verify: When agents are running, cards show live progress. When idle, shows "No active agents" state.

- [ ] **P4-007**: Build the Chat Interface. Create `ChatPanel.tsx` that appears as a slide-out panel or bottom panel. Messages: user messages (right-aligned, cyan border), agent responses (left-aligned, dark surface bg), system messages (centered, muted). Input: text area with send button, dropdown to select which agent/project to talk to. Backend: `chat_message` WebSocket type → routes message to active agent's Claude session → returns response. Chat history stored in SQLite (link to agent_session). Verify: Can send message to an active agent, receive response, see it in chat history.

- [ ] **P4-008**: Build the Log Viewer. Create route `/logs` with `LogViewer.tsx`. Features: real-time log stream from all agents (WebSocket), filter by project, filter by agent, filter by log level (debug, info, warn, error), search within logs, timestamp + agent name + level + message format. Logs use monospace font (JetBrains Mono), color-coded by level: debug=muted, info=text-primary, warn=amber, error=red-pink. Virtual scrolling for performance (react-virtuoso). Export logs button. Verify: Logs appear in real-time when agents are active, filtering works, scrolling is smooth with 10k+ entries.

---

## Phase 5: QA & Documentation

### 5.1 QA Pipeline

- [ ] **P5-001**: Create the QA Agent. Create `backend/agents/qa.py` extending `BaseAgent`. Triggered after a coding agent completes a feature. Steps: 1) Checkout the feature worktree, 2) Run full test suite, 3) Run linter (eslint/flake8/phpcs depending on stack), 4) Run typecheck, 5) Review code changes (diff) via Claude — check for: code quality, security issues, naming conventions, missing tests, edge cases, 6) Generate QA report with pass/fail per check + suggestions, 7) If all pass → mark feature as `review` (or `completed` if auto-approve), 8) If failures → mark feature as `failed` with detailed report, notify user. QA report stored in agent_logs. Verify: QA agent runs on a completed feature, generates meaningful report, correct status updates.

- [ ] **P5-002**: Build QA results UI. Add "QA Report" tab to Feature detail view. Shows: test results (pass/fail count), linter warnings, typecheck errors, code review findings (from Claude), overall verdict badge (✅ PASSED / ❌ FAILED / ⚠️ WARNINGS). Each finding expandable with details + code snippet + suggestion. "Re-run QA" button. For features requiring approval: "Approve" and "Reject" buttons that update feature status and unblock orchestrator. Verify: After QA runs, report visible in UI, approval buttons work.

### 5.2 Documentation Generation

- [ ] **P5-003**: Create the Documentation Generator framework. Create `backend/docs/generator.py`. Analyzes project source code to generate: ERD from database schema/models (parse SQL migrations, Prisma schema, Django models, etc.), Class diagrams from Python/TypeScript classes, API endpoint docs from route definitions (Express, FastAPI, Laravel, etc.), Use case diagram from features/PRD. Output format: Mermaid markdown (renderable in-app and exportable as SVG). Create `backend/docs/erd.py`, `backend/docs/classdiagram.py`, `backend/docs/api_docs.py`, `backend/docs/usecase.py` as specialized generators. Verify: Point at a sample project with a database and API, generate all 4 doc types.

- [ ] **P5-004**: Build Documentation Viewer UI. Create Documentation tab in Project Detail page. Shows generated diagrams rendered via Mermaid.js. Tab sub-navigation: ERD, Class Diagram, API Docs, Use Cases, Installation Guide, Requirements. Each diagram in a GlowPanel with: rendered Mermaid diagram, "Regenerate" button, "Export SVG" button, "Export PNG" button, "Copy Mermaid" button. Installation guide: auto-generated from env scan results + project setup steps. Requirements: auto-generated from package.json/requirements.txt/etc. Verify: View generated diagrams in UI, export as SVG works.

- [ ] **P5-005**: Create README generator. After documentation is generated, create a comprehensive `README.md` in the project root. Sections: Project Title & Description, Screenshots (placeholder), Tech Stack (with badges), Prerequisites (from env scan), Installation steps, API Documentation (summary with link to full docs), Database Schema (inline ERD), Project Structure (tree), Contributing guidelines (basic), License. Format suitable for GitHub. Include both technical details (for developers) and a plain-language summary (for non-technical stakeholders). Verify: Generated README is complete, renders well on GitHub, accessible to non-developers.

---

## Phase 6: Notifications & Communication

- [ ] **P6-001**: Create Email Notification system. Create `backend/notifications/email_sender.py`. SMTP configuration stored in global_settings (host, port, username, password, from_address). Functions: `send_report(to, subject, html_body)`, `send_approval_request(to, feature, project)`, `send_error_alert(to, error, agent, project)`, `send_completion_summary(to, project, results)`. Email templates: Jarvis-themed HTML (dark background, cyan accents — inline CSS for email clients). Rate limiting: max 1 email per minute per type. Create Settings UI for email config (`NotificationSettings.tsx`): SMTP fields, test email button, notification preferences (which events trigger emails). Verify: Configure SMTP, send test email, receive it with Jarvis styling.

- [ ] **P6-002**: Create Email Reply processing. Create `backend/notifications/reply_processor.py`. IMAP listener that checks for replies to JARVIS emails. Parse reply content for: approval responses ("approved", "yes", "reject", "no"), feedback text (forwarded to relevant agent via chat), commands ("pause", "stop", "continue"). Polling interval: every 60 seconds (configurable). Matched replies update corresponding notification record and trigger appropriate action (approve feature, forward feedback, etc.). Verify: Send approval request email → reply with "approved" → feature status updates in app.

---

## Phase 7: Skills & Plugins

- [ ] **P7-001**: Create the Skills/Plugin system. Create `backend/skills/registry.py`: skill registration, listing, enabling/disabling. Skill structure: `{name, description, version, hooks: {pre_agent, post_agent, pre_test, post_test}, commands: [], config: {}}`. Hooks are Python functions called at lifecycle points. Built-in skills: `code-formatter` (runs prettier/black after agent writes code), `git-commit-lint` (validates commit messages), `dependency-checker` (checks for outdated packages). Create `backend/skills/hooks.py`: hook execution engine that runs registered hooks at the right lifecycle points. Verify: Register a skill, enable it on a project, verify hooks execute at correct points.

- [ ] **P7-002**: Build Skills management UI. Create Skills tab in Settings. Shows: installed skills (toggle enabled/disabled), skill configuration form (per-skill settings), "Add Skill" flow (from file path or URL). Per-project skill assignment in Project Settings tab. Verify: Install a skill, enable it on a project, see it execute during agent run.

---

## Phase 8: Polish & Optimization

- [ ] **P8-001**: Build system tray integration. Create `src/main/tray.ts`: system tray icon (JARVIS icon), context menu: Show/Hide window, active projects with status, quick actions (pause all, resume all), settings shortcut, quit. Minimize to tray instead of closing. Tray icon changes based on status: default (cyan), active agents (pulsing), error (red). Balloon notifications for important events (feature complete, error, approval needed). Verify: App minimizes to tray, tray menu works, notifications appear.

- [ ] **P8-002**: Add keyboard shortcuts. Global shortcuts: `Ctrl+N` — new project, `Ctrl+,` — settings, `Ctrl+L` — toggle logs, `Ctrl+K` — command palette (search projects, features, actions), `Escape` — close modal/panel. In-context: `Ctrl+Enter` — send chat message, `Ctrl+S` — save current form. Create command palette component (`CommandPalette.tsx`): search through projects, features, settings, actions. Verify: All shortcuts work, command palette searches correctly.

- [ ] **P8-003**: Performance optimization pass. Virtual scrolling on all long lists (log viewer, features list, project list) using `react-virtuoso`. Debounce WebSocket message processing (batch UI updates). Lazy load route components with `React.lazy` + Suspense. Memoize expensive components with `React.memo`. Index SQLite queries: projects(status), features(project_id, status), agent_sessions(project_id, status), agent_logs(session_id, timestamp). Add log rotation: max 10MB per project, archive old logs. Profile and fix any renders > 16ms. Verify: App stays at 60fps with 10+ projects, 100+ features, 10k+ log entries.

- [ ] **P8-004**: Build the onboarding / first-run experience. On first launch (no settings in DB): Welcome screen with JARVIS branding + animation, Step 1: configure Claude OAuth token (with link to get one), Step 2: configure at least one GitHub account, Step 3: choose default settings (or accept defaults), Step 4: optional — create first project or import existing. Save a `first_run_complete` flag. Show helpful tooltips on first use of each feature. Verify: Fresh install triggers onboarding, completing it leads to functional app.

- [ ] **P8-005**: Create Windows installer branding. Configure `electron-builder.yml`: app name "JARVIS", description, author, Windows NSIS installer, custom installer sidebar image (Jarvis-themed), custom installer header image, app icon (all sizes: 16, 32, 48, 64, 128, 256, 512), file associations (`.jarvis` project files — optional), Start Menu shortcut, Desktop shortcut (optional, user choice). Verify: `npm run build` produces a working `.exe` installer that installs and launches correctly on Windows.

---

## Completion Criteria

A feature is COMPLETE when ALL of these are true:
1. Code is written and follows conventions in CLAUDE.md
2. TypeScript compiles with zero errors (`tsc --noEmit`)
3. Python passes type checks (`mypy` or type hints verified)
4. At least one meaningful test exists and passes
5. The feature works as described in the PRD item
6. The feature is visually styled in Jarvis theme (if UI)
7. Error states and loading states are handled (if UI)
8. progress.json is updated

The project is COMPLETE when ALL items in ALL phases are checked.

---

*PRD version 1.0 — Generated 2 February 2026*
