# 🚀 JARVIS — Launch Instructions

## How to Use This Prompt Package

This package contains everything needed to autonomously build JARVIS. It follows the **Ralph Loop** pattern: an AI coding agent reads the PRD, implements features one by one, and tracks progress until everything is complete.

---

## Files in This Package

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Master instructions — read by Claude Code automatically on every session |
| `PRD.md` | Product Requirements Document — 39 features across 8 phases |
| `AGENTS.md` | Accumulated learnings — grows as agents discover patterns |
| `progress.json` | Progress tracker — updated as features complete |
| `guardrails.json` | Failure learnings — prevents repeated mistakes |
| `LAUNCH.md` | This file — how to get started |

---

## Prerequisites

Before launching, ensure you have:

1. **Claude Code installed** — `curl -fsSL https://claude.ai/install.sh | bash` (or via npm: `npm install -g @anthropic-ai/claude-code`)
2. **Claude Max subscription** — for OAuth token access
3. **Logged in to Claude Code** — run `claude` once and complete OAuth flow
4. **Node.js 18+** installed
5. **Python 3.11+** installed
6. **Git** installed and configured

---

## Quick Start

### Step 1: Create the project directory

```bash
mkdir jarvis
cd jarvis
git init
```

### Step 2: Copy all prompt files into the project root

```bash
# Copy CLAUDE.md, PRD.md, AGENTS.md, progress.json, guardrails.json
# into the jarvis/ directory
```

### Step 3: Launch Claude Code

```bash
claude
```

Claude Code will automatically read `CLAUDE.md` and understand the project.

### Step 4: Give the initial prompt

Paste this prompt to start the autonomous build:

---

```
Read PRD.md and progress.json. You are building JARVIS — an autonomous coding agent desktop app.

EXECUTION RULES:
1. Work through PRD items IN ORDER (P1-001 → P1-002 → ... → P8-005)
2. For each item:
   - Read the full description in PRD.md
   - Read any relevant guardrails in guardrails.json
   - Read AGENTS.md for conventions and learnings
   - Implement the feature completely
   - Write at least one test
   - Verify TypeScript compiles (if applicable)
   - Update progress.json: set status to "completed", add completed_at timestamp, increment iterations
3. After completing each item, update AGENTS.md with anything you learned
4. If something fails, add a guardrail to guardrails.json and retry
5. If you hit a problem you can't solve, set the item status to "failed" with a note and move to the next item
6. Commit after each completed feature: git add -A && git commit -m "[JARVIS] feat: {description}"

Start with P1-001. Go.
```

---

## Running as Ralph Loop (Fully Autonomous)

For fully autonomous execution, use a Ralph loop script. Create `ralph.sh`:

```bash
#!/bin/bash
# Ralph Loop for JARVIS
# Runs Claude Code repeatedly until all PRD items are complete

MAX_ITERATIONS=100
ITERATION=0

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
    ITERATION=$((ITERATION + 1))
    echo "🔄 Ralph Loop — Iteration $ITERATION / $MAX_ITERATIONS"
    
    # Check if all items are complete
    PENDING=$(python3 -c "
import json
with open('progress.json') as f:
    data = json.load(f)
pending = sum(1 for phase in data['phases'].values() 
              for item in phase['items'].values() 
              if item['status'] != 'completed')
print(pending)
")
    
    if [ "$PENDING" = "0" ]; then
        echo "✅ All PRD items complete! JARVIS is built."
        exit 0
    fi
    
    echo "📋 $PENDING items remaining"
    
    # Run Claude Code with the build prompt
    claude --print "
Read progress.json and find the FIRST item with status 'pending' or 'failed'.
Read that item's full description from PRD.md.
Read AGENTS.md for conventions. Read guardrails.json for known pitfalls.

Implement this ONE item completely:
- Write the code
- Write at least one test  
- Verify it works
- Update progress.json (status: completed, completed_at: now, iterations: +1)
- Update AGENTS.md if you learned anything new
- If it fails, add a guardrail and set status to 'failed' with a note
- Commit: git add -A && git commit -m '[JARVIS] feat: {item title}'

Then output: ITEM_COMPLETED:{item_id} or ITEM_FAILED:{item_id}
"
    
    # Brief pause between iterations
    sleep 5
done

echo "⚠️ Max iterations reached. Check progress.json for remaining items."
```

Make it executable and run:

```bash
chmod +x ralph.sh
./ralph.sh
```

---

## Running with Parallel Agents

For faster builds, run multiple Claude Code instances on different phases:

### Terminal 1: Foundation (Phase 1)
```bash
claude --print "Focus ONLY on Phase 1 items (P1-xxx) from PRD.md. 
Read progress.json, implement the next pending P1 item. Follow all rules from CLAUDE.md."
```

### Terminal 2: UI Components (Phase 2-3, after Phase 1 completes)
```bash
claude --print "Focus ONLY on Phase 2-3 items (P2-xxx, P3-xxx) from PRD.md.
Read progress.json, implement the next pending item. Follow all rules from CLAUDE.md."
```

### Terminal 3: Backend (Phase 4, after Phase 1 completes)
```bash
claude --print "Focus ONLY on Phase 4 items (P4-xxx) from PRD.md.
Read progress.json, implement the next pending item. Follow all rules from CLAUDE.md."
```

> ⚠️ **Important**: Phases have dependencies. Don't start Phase 2+ until Phase 1 is complete. Don't start Phase 5+ until Phase 4 is complete. Phase 6-8 can run in parallel after Phase 5.

---

## Monitoring Progress

Check progress anytime:

```bash
# Quick status
python3 -c "
import json
with open('progress.json') as f:
    d = json.load(f)
for name, phase in d['phases'].items():
    items = phase['items']
    done = sum(1 for i in items.values() if i['status'] == 'completed')
    print(f\"{phase['name']:.<30} {done}/{len(items)}\")
total = d['totals']
print(f\"{'TOTAL':.<30} {total['completed']}/{total['total_items']}\")
"
```

Expected output:
```
Foundation..................... 12/12
Project Management............. 4/4
Feature Planning............... 4/4
Agent Orchestration............ 8/8
QA & Documentation............. 5/5
Notifications.................. 2/2
Skills & Plugins............... 2/2
Polish & Optimization.......... 5/5
TOTAL.......................... 39/39
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Claude runs out of context | It will auto-rotate (fresh context). Progress persists in files. |
| Feature keeps failing | Check guardrails.json — the agent should have added a note. Try manually. |
| Python backend won't start | Check Python 3.11+ is installed. Check venv creation in postinstall. |
| Electron build fails | Verify Node.js 18+, clear node_modules, reinstall. |
| Agent hits rate limit | Pause for 5 minutes, then resume. Consider reducing parallel agents. |

---

## After Build Completes

1. Run the full test suite: `npm test && cd backend && pytest`
2. Build the Windows installer: `npm run build`
3. Test the installer on a clean Windows machine
4. Celebrate 🎉

---

*Package generated 2 February 2026 — Project JARVIS Discovery Session*
