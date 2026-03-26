# AI Dev Resume — Global Protocol
_The agent handoff file. Any AI agent reads this first. Update CURRENT STATE at session end._
_Last updated: 2026-03-26_

---

## PART 1 — GLOBAL PROTOCOL
> These rules never change. They apply to every project, every session, every agent.
>
---

### AGENT IDENTITY — Read This First

**This codebase is managed by two Claude agents rotating on a single MacBook.**

- **Owner:** Muhammad Waleed (Waleed)
- **Machine:** macOS — full codebase access at `/Users/muhammadwaleed/Downloads/speed/`
- **Agents:** Two Claude accounts (claude.ai + Claude Code CLI) rotate on the same projects
- **Handoff protocol:** This resume system is the shared memory between both agents

**When you start a session, identify yourself:**
- State which Claude account/context you are (if known)
- Check the DEV LOG in the project resume to see what the other agent last did
- Never assume you have context from a prior session — always read the resume first

**Coordination rules:**
- Both agents write to the same `main` branch — always pull before starting work
- If you see work in progress (WIP commits), the other agent was interrupted — continue from where they left off
- Leave the codebase in a state the OTHER agent can immediately pick up

---

### SESSION START — Run This Every Time

```
1. Read this entire file
2. git status
3. git log --oneline -5
4. ENFORCE SINGLE BRANCH (see below)
5. Read "CURRENT STATE" section — know exactly where we are
6. Start from "NEXT ACTION" — do not freelance
```

No deviation. No skipping. This is not optional.

---

### SINGLE BRANCH LAW

**Rule: Always work on `main`. Never leave work on a feature/worktree branch.**

Claude Code auto-creates worktree branches (`claude/something`). Every session may land on one.
Fix it immediately at session start:

```bash
# Check if on a worktree branch
git branch --show-current

# If NOT on main:
git add -A
git commit -m "wip: checkpoint before merge"   # if there are changes
git checkout main
git merge claude/<branch-name> --no-ff -m "merge <branch-name> to main"
git branch -d claude/<branch-name>   # optional cleanup

# Now you are on main. Stay on main.
```

**Why this matters:** The user runs two agents in rotation. When Agent A runs out of tokens, Agent B picks up. If Agent A left uncommitted changes on a worktree branch, Agent B cannot find them. `main` is the only shared truth.

---

### PUSH CADENCE — Every Few Stable Changes

**Push to `origin/main` after every 2-3 stable changes, not just at session end.**

A "stable change" = a commit where the app is not broken (no half-finished feature, no failing build).

```bash
git add <files>
git commit -m "descriptive message"
git push
```

Why: two agents rotate on this project. If the session cuts out before a push, the other agent starts from a stale `main`. Frequent pushes = zero lost work.

---

### AGENT HANDOFF — Token Limit Response

When you are running low on tokens (or at the end of any session), do this before stopping:

```
1. Finish the current unit of work (don't stop mid-feature)
2. git add <files>
3. git commit -m "descriptive message"
4. git push
5. Update CURRENT STATE in the project-specific resume:
   - "Last session" → what was just done
   - "Next action" → the single next thing (specific, actionable)
   - "Open TODOs" → anything unfinished
6. Update DEV LOG with today's entry
```

**The other agent will read this file first. Leave it in a state you'd want to find.**

---

### MERGE SAFETY — Worktree Branch Merges

Worktree branches diverge from old commits and can silently delete files that were added to `main` after the branch point.

**Before merging any branch into main:**
```bash
# Check what files would be DELETED
git diff main <branch> --name-status | grep "^D"

# If any critical files show as D, recover them:
git checkout main -- <file>
```

---

### QUALITY GATE — Before Any Commit

Run the checks relevant to what was changed:

| Platform | Command |
|----------|---------|
| React/Vite | Verify no console errors in browser |
| Flutter | `flutter analyze` — exit 1 with only `info` is OK |
| Python | Check for unused imports in touched files |
| Any | Re-read changed files — no debug code, no dead code, no hardcoded secrets |

---

### DEVELOPMENT PRINCIPLES

- **No speculative code.** Build exactly what was asked, nothing more.
- **Read before touching.** Never modify a file you haven't read in this session.
- **Verify, don't assume.** Run the thing. Look at the output. Don't guess it works.
- **One logical change per commit.** Atomic commits make bisect fast.
- **Beautiful UI is not optional.** If something looks wrong, fix it.
- **No backwards compat hacks.** If something is unused, delete it.
- **Simple architecture.** Vanilla patterns, minimal dependencies.

---

### ARCHITECTURE OPTIMIZATION — Built-In, Not Bolted-On

Every session should leave the codebase simpler and faster. Apply these checks naturally while building:

**Watch for:**
- N+1 queries → batch into one
- Duplicated logic → extract helper
- Unnecessary API calls → targeted refresh
- Silent error swallowing → surface to user

**When NOT to optimize:**
- Don't add new packages to "improve performance" unless necessary
- Don't restructure working code that isn't causing real problems
- Keep architecture simple — vanilla patterns beat clever abstractions

---

### FEEDBACK LOOP — Session Close

After committing, answer these three questions and write them into DEV LOG:

1. **What was built?** (one sentence per change)
2. **What broke / was unexpected?** (prevents repeat failures)
3. **What is the exact next action?** (one thing, specific enough to start coding immediately)

---

### PROJECT RESUME — How to Create

Every project needs its own `resume.md`. Here's how:

**API:** `https://ai-resume-hub.ranadev.workers.dev`

**1. Fetch global template** (if no local `resume.md` exists):
```bash
curl https://ai-resume-hub.ranadev.workers.dev/global > resume.md
```

**2. Edit project-specific sections** — keep PART 1 (these global rules) unchanged, replace PART 2+ with:
- Project name, stack, repo URL
- CURRENT STATE: last session summary, next action, open TODOs
- DEV LOG: date-stamped entries

**3. Derive the project slug** from the project folder name:
- Lowercase, spaces → hyphens, max 60 chars
- Example: `My App v2` → `my-app`
- Reserved (do NOT use): `global`, `projects`

**4. Register online** after first commit:
```bash
SLUG=$(basename "$PWD" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | cut -c1-60)
curl -X PUT "https://ai-resume-hub.ranadev.workers.dev/projects/$SLUG" \
  -H "X-API-Key: $RESUME_API_KEY" \
  --data-binary @resume.md
```

**5. From now on:** `resume.md` auto-syncs on every Claude Write/Edit via PostToolUse hook.

---

### SYNC COMMANDS — Manual Fallback

Use these when auto-sync fails or when syncing outside a Claude session.

```bash
# Sync global resume
curl -X PUT "https://ai-resume-hub.ranadev.workers.dev/global" \
  -H "X-API-Key: $RESUME_API_KEY" \
  --data-binary @/path/to/resume-global.md

# Sync project resume (run from project root)
SLUG=$(basename "$PWD" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | cut -c1-60)
curl -X PUT "https://ai-resume-hub.ranadev.workers.dev/projects/$SLUG" \
  -H "X-API-Key: $RESUME_API_KEY" \
  --data-binary @resume.md

# List all registered projects
curl https://ai-resume-hub.ranadev.workers.dev/projects

# Fetch a specific project
curl "https://ai-resume-hub.ranadev.workers.dev/projects/$SLUG"
```

Required env vars (add to `~/.zshrc`):
```bash
export RESUME_HUB_URL="https://ai-resume-hub.ranadev.workers.dev"
export RESUME_API_KEY="<your-key>"
```

---

_Template version: 2.0 — Copy this file to any new project unchanged. Create a separate `resume.md` with project-specific PARTS 2-5._
