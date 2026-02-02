# JARVIS — Autonomous Coding Agent Desktop App

## Project Identity

You are building **JARVIS**, a Windows desktop application with an Iron Man / Jarvis-inspired UI that orchestrates autonomous AI coding agents. This is a personal tool for a single developer (Bjorn) who wants to manage parallel coding agents from a visual interface instead of a terminal.

**This is NOT a toy or prototype.** Build production-quality code from the start. Every component should be clean, typed, tested, and documented.

## Tech Stack (MANDATORY)

| Layer | Technology | Version |
|-------|-----------|---------|
| Desktop | Electron | Latest stable |
| Frontend | React 18+ with TypeScript (strict mode) | Latest |
| Styling | Tailwind CSS + custom Jarvis theme | Latest |
| State | Zustand | Latest |
| Backend | Python 3.11+ | Via child process from Electron |
| IPC | Electron IPC (main↔renderer) + WebSocket (Python↔Electron) | - |
| Database | SQLite via better-sqlite3 (Node) + sqlite3 (Python) | - |
| Agent SDK | @anthropic-ai/claude-agent-sdk | Latest |
| Git | simple-git (Node) + gitpython (Python) | Latest |
| Packaging | electron-builder | Latest |
| Testing | Vitest (frontend) + pytest (backend) | Latest |

## Architecture Rules

### Electron Architecture
- **Main process**: Node.js — handles IPC, spawns Python backend, manages windows, system tray
- **Renderer process**: React — all UI rendering, receives updates via IPC
- **Preload scripts**: Bridge between main and renderer (contextBridge, no nodeIntegration)
- **Python backend**: Spawned as child process, communicates via WebSocket on localhost

### Frontend Rules
- All components in TypeScript (`.tsx`) with strict typing — NO `any` types
- Use functional components with hooks exclusively
- Zustand for global state (projects, agents, settings)
- Tailwind CSS utilities for layout + custom CSS for Jarvis glow effects
- All user-facing text hardcoded in English (no i18n for now)
- Component file naming: `PascalCase.tsx` (e.g., `AgentMonitor.tsx`)
- Hook file naming: `use-camelCase.ts` (e.g., `use-agent-status.ts`)
- Every interactive component must have loading, error, and empty states
- Animations via CSS transitions/keyframes or Framer Motion — NO heavy animation libs

### Backend Rules (Python)
- Type hints on ALL functions (use `typing` module)
- Async where possible (asyncio)
- Pydantic for data models and validation
- Structured logging (structlog or loguru)
- Every module has docstrings
- File naming: `snake_case.py`
- Class naming: `PascalCase`
- No global mutable state — pass dependencies explicitly

### Database Rules
- SQLite database at `{userData}/jarvis/jarvis.db`
- Migrations tracked and versioned (sequential numbered SQL files)
- All queries parameterized — NEVER string interpolation for SQL
- Foreign keys enabled (`PRAGMA foreign_keys = ON`)
- Created/updated timestamps on every table
- Sensitive data (tokens) encrypted with machine-specific key via `cryptography` (Fernet)

### Git Rules
- Every feature built in a git worktree (isolated branch + directory)
- Branch naming: `jarvis/feature/{group-slug}/{feature-slug}`
- Commit messages: `[JARVIS] {type}: {description}` where type = feat|fix|refactor|docs|test
- Worktrees created at `../{project-name}-worktrees/{branch-name}/`
- Never force push. Never rewrite history on shared branches.
- Merge via fast-forward when possible, merge commit otherwise

### Agent Rules
- Each coding agent gets its own worktree
- Resource limits enforced: max 80% CPU, max 85% RAM before stopping new spawns
- Max 10 parallel agents (configurable in settings)
- Circuit breaker: max 35 iterations per feature (configurable)
- Context rotation: warn at 70k tokens, rotate at 80k tokens
- Every agent session logged to SQLite with full metadata
- Agents MUST run tests and typechecks before marking items complete
- Progress tracked in `progress.json` per project (not per agent)
- Guardrails accumulated in `guardrails.json` per project

## Directory Structure

```
jarvis/
├── CLAUDE.md                      # THIS FILE
├── PRD.md                         # Product Requirements Document
├── AGENTS.md                      # Learnings & conventions
├── progress.json                  # Build progress tracker
├── guardrails.json                # Accumulated guardrails
├── package.json                   # Root workspace
├── electron-builder.yml           # Build config
│
├── src/
│   ├── main/                      # Electron main process
│   │   ├── index.ts               # App entry, window creation
│   │   ├── tray.ts                # System tray icon & menu
│   │   ├── ipc/                   # IPC handlers (one file per domain)
│   │   │   ├── projects.ipc.ts
│   │   │   ├── agents.ipc.ts
│   │   │   ├── settings.ipc.ts
│   │   │   └── index.ts
│   │   ├── services/              # Main process services
│   │   │   ├── python-bridge.ts   # Spawn & manage Python backend
│   │   │   ├── db.ts              # SQLite connection (better-sqlite3)
│   │   │   ├── auth-store.ts      # Encrypted token storage
│   │   │   └── updater.ts         # Auto-update (later)
│   │   └── utils/
│   │
│   ├── preload/                   # Preload scripts
│   │   └── index.ts               # contextBridge API
│   │
│   ├── renderer/                  # React frontend
│   │   ├── App.tsx
│   │   ├── main.tsx               # React entry
│   │   ├── routes.tsx             # React Router
│   │   ├── components/
│   │   │   ├── hud/               # Jarvis HUD elements
│   │   │   │   ├── CircularProgress.tsx
│   │   │   │   ├── ArcMeter.tsx
│   │   │   │   ├── GlowPanel.tsx
│   │   │   │   ├── HexGrid.tsx
│   │   │   │   ├── ScanLine.tsx
│   │   │   │   └── PulseIndicator.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── TopBar.tsx
│   │   │   │   └── MainLayout.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── ProjectCard.tsx
│   │   │   │   ├── ProjectList.tsx
│   │   │   │   ├── SystemStatus.tsx
│   │   │   │   └── ActiveAgents.tsx
│   │   │   ├── planner/
│   │   │   │   ├── FeatureGroupList.tsx   # Drag & drop
│   │   │   │   ├── FeatureCard.tsx
│   │   │   │   ├── ApprovalToggle.tsx
│   │   │   │   └── PrdImporter.tsx
│   │   │   ├── agents/
│   │   │   │   ├── AgentMonitor.tsx
│   │   │   │   ├── AgentCard.tsx
│   │   │   │   ├── ProgressRing.tsx
│   │   │   │   └── ResourceGauge.tsx
│   │   │   ├── chat/
│   │   │   │   ├── ChatPanel.tsx
│   │   │   │   ├── ChatMessage.tsx
│   │   │   │   └── ChatInput.tsx
│   │   │   ├── logs/
│   │   │   │   ├── LogViewer.tsx
│   │   │   │   └── LogEntry.tsx
│   │   │   ├── settings/
│   │   │   │   ├── AuthSettings.tsx
│   │   │   │   ├── AgentSettings.tsx
│   │   │   │   ├── NotificationSettings.tsx
│   │   │   │   └── SettingsLayout.tsx
│   │   │   └── shared/
│   │   │       ├── Button.tsx
│   │   │       ├── Input.tsx
│   │   │       ├── Modal.tsx
│   │   │       ├── Toast.tsx
│   │   │       └── Tooltip.tsx
│   │   ├── hooks/
│   │   │   ├── use-projects.ts
│   │   │   ├── use-agents.ts
│   │   │   ├── use-websocket.ts
│   │   │   └── use-theme.ts
│   │   ├── stores/
│   │   │   ├── project-store.ts
│   │   │   ├── agent-store.ts
│   │   │   └── settings-store.ts
│   │   ├── styles/
│   │   │   ├── globals.css         # Tailwind + Jarvis base
│   │   │   ├── jarvis-theme.css    # Glow effects, HUD styles
│   │   │   └── animations.css      # Keyframes
│   │   ├── types/
│   │   │   ├── project.ts
│   │   │   ├── agent.ts
│   │   │   ├── feature.ts
│   │   │   └── electron.d.ts       # Preload API types
│   │   └── lib/
│   │       ├── api.ts              # IPC wrapper
│   │       └── utils.ts
│   │
│   └── shared/                    # Shared between main & renderer
│       └── constants.ts
│
├── backend/                       # Python backend
│   ├── main.py                    # Entry: WebSocket server
│   ├── requirements.txt
│   ├── pyproject.toml
│   ├── core/
│   │   ├── orchestrator.py        # Main agent orchestrator
│   │   ├── resource_manager.py    # CPU/RAM monitoring
│   │   ├── env_scanner.py         # Detect installed tools
│   │   ├── auth.py                # Token management
│   │   └── config.py              # Configuration loading
│   ├── agents/
│   │   ├── base.py                # Base agent class
│   │   ├── initializer.py         # Project initializer
│   │   ├── coder.py               # Coding agent (Ralph loop)
│   │   ├── qa.py                  # QA/review agent
│   │   ├── enhancer.py            # Prompt enhancement agent
│   │   └── triage.py              # Task routing agent
│   ├── ralph/
│   │   ├── loop.py                # Ralph loop implementation
│   │   ├── progress.py            # Progress file management
│   │   ├── guardrails.py          # Guardrails system
│   │   └── context_manager.py     # Context rotation logic
│   ├── docs/
│   │   ├── generator.py           # Documentation orchestrator
│   │   ├── erd.py                 # ERD diagram generator
│   │   ├── usecase.py             # Use case diagram
│   │   ├── classdiagram.py        # Class diagram
│   │   └── api_docs.py            # API endpoint docs
│   ├── notifications/
│   │   ├── email_sender.py        # SMTP email
│   │   └── reply_processor.py     # IMAP reply reading
│   ├── skills/
│   │   ├── registry.py            # Skill management
│   │   └── hooks.py               # Pre/post hooks
│   ├── db/
│   │   ├── database.py            # Connection + helpers
│   │   ├── models.py              # Pydantic models
│   │   └── migrations/
│   │       ├── 001_initial.sql
│   │       └── ...
│   └── tests/
│       ├── test_orchestrator.py
│       ├── test_ralph_loop.py
│       ├── test_resource_manager.py
│       └── ...
│
├── db/
│   └── migrations/                # Node-side migrations
│
├── assets/
│   ├── icons/                     # App icons (256x256, 512x512)
│   ├── fonts/                     # Rajdhani, JetBrains Mono
│   └── sounds/                    # Optional notification sounds
│
├── scripts/
│   ├── dev.ts                     # Dev server launcher
│   ├── build.ts                   # Production build
│   └── postinstall.ts             # Setup Python venv
│
└── tests/
    ├── e2e/                       # Playwright E2E tests
    └── unit/                      # Vitest unit tests
```

## Jarvis UI Theme (MANDATORY)

Every UI component MUST follow this aesthetic:

```css
/* === JARVIS COLOR SYSTEM === */
--bg-primary: #0A0A0F;
--bg-surface: #111118;
--bg-elevated: #1A1A24;
--border-subtle: #1A2A3A;
--border-glow: #00D4FF;

--color-primary: #00D4FF;      /* Cyan — main accent */
--color-secondary: #0099CC;    /* Dark cyan */
--color-accent: #00FFE0;       /* Turquoise */
--color-warning: #FFB800;      /* Amber */
--color-error: #FF3366;        /* Red-pink */
--color-success: #00FF88;      /* Green */

--text-primary: #E0E8F0;
--text-secondary: #6B7B8D;
--text-muted: #3D4A5C;

/* === GLOW EFFECTS === */
--glow-sm: 0 0 5px rgba(0, 212, 255, 0.3);
--glow-md: 0 0 15px rgba(0, 212, 255, 0.3);
--glow-lg: 0 0 30px rgba(0, 212, 255, 0.4);
--glow-text: 0 0 10px rgba(0, 212, 255, 0.5);

/* === PANELS === */
Panel backgrounds: rgba(17, 17, 24, 0.85) with backdrop-filter: blur(12px)
Panel borders: 1px solid rgba(0, 212, 255, 0.15)
Panel hover: border-color transitions to rgba(0, 212, 255, 0.4)
Border radius: 8px (panels), 6px (cards), 4px (inputs)

/* === TYPOGRAPHY === */
Font display/headings: 'Rajdhani', sans-serif (weight 600-700)
Font code/data: 'JetBrains Mono', monospace
Font body: 'Inter', sans-serif
```

### UI Component Patterns

**GlowPanel** — Base container for all panels:
```
Dark background + subtle border + glow on hover/focus
Corner accents (small L-shaped lines at corners for tech feel)
Optional scan-line animation on loading state
```

**CircularProgress** — Main progress indicator:
```
SVG-based concentric rings
Animated fill with glow trail
Center shows percentage or icon
Color shifts: cyan (progress) → green (complete) → amber (warning) → red (error)
```

**ArcMeter** — For CPU/RAM gauges:
```
180° arc with gradient fill
Tick marks every 10%
Threshold indicators (80% warning, 90% critical)
Animated needle or fill
```

**Feature Group Cards** — Drag & drop list:
```
Sortable via @dnd-kit/sortable
Grip handle (☰) on left
Expand/collapse for child features
[AUTO] / [APPROVE] badge on right
Cyan border-left for active group
```

### Animation Guidelines
- **Duration**: 200ms (micro), 300ms (transitions), 500ms (emphasis)
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` for most, `ease-out` for entries
- **Pulse**: `animation: pulse 2s ease-in-out infinite` on active agents
- **Scan-line**: Horizontal line moving top-to-bottom at 3s interval
- **NO**: Flashy/distracting animations. Subtle and functional only.

## Coding Conventions

### TypeScript
```typescript
// Imports: external → internal → types → styles
import { useState } from 'react';
import { useProjects } from '@/hooks/use-projects';
import type { Project } from '@/types/project';

// Components: props interface → component → export
interface ProjectCardProps {
  project: Project;
  onSelect: (id: string) => void;
}

function ProjectCard({ project, onSelect }: ProjectCardProps) {
  // hooks first, then derived state, then handlers, then render
  const [expanded, setExpanded] = useState(false);
  const progress = project.completedFeatures / project.totalFeatures;
  const handleClick = () => onSelect(project.id);
  
  return (/* JSX */);
}

export default ProjectCard;
```

### Python
```python
"""Module docstring explaining purpose."""

from __future__ import annotations

import asyncio
from typing import Optional
from pydantic import BaseModel

class AgentConfig(BaseModel):
    """Configuration for a coding agent."""
    
    agent_id: str
    feature_id: str
    max_iterations: int = 35
    max_tokens: int = 200_000
    worktree_path: str

async def spawn_agent(config: AgentConfig) -> AgentResult:
    """Spawn a coding agent with the given configuration.
    
    Args:
        config: Agent configuration parameters.
        
    Returns:
        Result of the agent's execution.
        
    Raises:
        ResourceError: If system resources are insufficient.
    """
    ...
```

## Environment Detection (MANDATORY PRE-FLIGHT)

Before ANY agent starts working on a project, the Environment Scanner MUST run and detect:

```
RUNTIME DETECTION:
- Node.js (version, nvm status)
- Python (version, venv status, pip)
- PHP (version, composer)
- .NET SDK (version)
- Java/JDK (version)
- Ruby (version)
- Go (version)
- Rust (version, cargo)

TOOL DETECTION:
- Git (version, configured user)
- npm / yarn / pnpm / bun
- pip / pipenv / poetry
- Docker (running?)
- Database servers (MySQL, PostgreSQL, MongoDB)

The scanner reports:
✅ Found: Node.js 20.11.0
✅ Found: Python 3.12.1
⚠️ Missing: PHP (required by project)
❌ Wrong version: Java 11 (project needs 17+)

NEVER install anything without explicit user confirmation.
Show what will be installed and let the user approve.
```

## Testing Requirements

- **Frontend**: Vitest for unit tests, Playwright for E2E
- **Backend**: pytest with asyncio plugin
- **Coverage target**: 70% minimum for core modules
- **Every new feature must include at least one test**
- **Tests must pass before marking any PRD item complete**

## Error Handling

- All async operations wrapped in try/catch
- User-facing errors shown as Toast notifications (not alerts)
- Errors logged to SQLite with full stack trace
- Agent errors trigger circuit breaker evaluation
- Network errors retry 3 times with exponential backoff

## Security

- OAuth tokens encrypted at rest (Fernet with machine key)
- No tokens in logs or error messages
- Preload script exposes minimal API (no nodeIntegration)
- Python backend only accessible on localhost
- No telemetry, no external calls except Claude API and GitHub API

## Performance

- Electron window: 60fps rendering target
- WebSocket messages batched (max 10/second to UI)
- SQLite queries indexed on frequently queried columns
- Agent logs rotated (max 10MB per project)
- Lazy load heavy components (Log viewer, Chat history)

## Build & Distribution

- `electron-builder` produces `.exe` installer for Windows
- NSIS installer with custom branding
- Auto-creates Start Menu shortcut
- App data stored in `%APPDATA%/jarvis/`
- Logs stored in `%APPDATA%/jarvis/logs/`
- Database at `%APPDATA%/jarvis/jarvis.db`

---

**Remember: Read PRD.md for the current task list. Read AGENTS.md for accumulated learnings. Read guardrails.json for known pitfalls. Update progress.json after completing each item.**
