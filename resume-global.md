# AI Dev Resume — Global Protocol
_The agent handoff file. Any AI agent reads this first. Update CURRENT STATE at session end._
_Last updated: 2026-03-30_

> **Constraints are more important than features.**

---

## PART 1 — GLOBAL PROTOCOL
> These rules never change. They apply to every project, every session, every agent.
>
---

### AGENT IDENTITY — Read This First

**Owner:** Muhammad Waleed (Waleed) — macOS, `/Users/muhammadwaleed/Downloads/speed/`
**Two Claude agents rotate on the same projects.** This resume is their shared memory.

- Read the project DEV LOG before doing anything — know what the other agent last did
- Always pull before starting. Push before stopping. Leave a state the other agent can pick up immediately.
- Never assume prior session context — always read the resume first.

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

_App map auto-opens in browser via SessionStart hook — no manual step needed._

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

`main` is the only shared truth between agents.

---

### PUSH CADENCE — Every Few Stable Changes

**Push to `origin/main` after every 2-3 stable commits, not just at session end.** Session cuts happen — the other agent must never start from stale code.

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
- **Features first, UI polish second.** Get the feature working correctly before investing in animations, visual refinement, or layout complexity. A working plain screen beats a broken beautiful one.
- **No hacks.** If it feels clever, fragile, or needs manual steps — find the real solution. Industry-standard patterns only.
- **Delete the unused.** No backwards compat shims, no dead code.
- **Vanilla architecture.** Minimal dependencies, no abstractions until forced.

---

### MODEL ROUTING — Save Opus Tokens

**Rule:** Opus thinks, Sonnet types. Use `Agent(model: "sonnet")` for any task with a single correct answer.

**Opus keeps:** architecture, debugging, tradeoffs, code review, planning.
**Sonnet gets:** scaffolding, boilerplate, simple bugs, git ops, styling, search, tests, refactors with clear specs.

**Opus must delegate** file creation, repetitive code, and commits to Sonnet. Batch into one agent call. Review Sonnet output before moving on.
**Sonnet must escalate** architecture decisions and ambiguous tradeoffs to `Agent(model: "opus")` with full context.

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

### WEEKLY AUDIT — Global Resume Efficiency

**Last audit: 2026-03-30** | **Next: 2026-04-06**

Once per week, audit this file. Two constraints govern every edit:

**1. Verbose instructions die mid-conversation.** As context grows, the model reverts to default behavior. Only short, direct rules survive the full session. If an instruction needs a paragraph to explain itself, it will be ignored by token 80k. Rewrite it in one line or delete it.

**2. Rewrite as v2.0, not v1.1.** Don't patch — reimagine. Imagine shipping this file as a fresh v2.0 release: radically better expression, but the original intended behavior must be identical. A rewrite that changes what a rule *does* is a bug, not an optimization. A rule that took 10 lines in v1 should take 2 in v2 — not by cutting corners, but by finding the precise words that produce the same result.

Audit checklist:
- Cut anything the model does by default
- Merge overlapping rules into one
- If a section is >10 lines, rewrite it in 3
- Delete examples when the rule is clear without them
- Never add — only simplify or remove

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

---

### RELEASES HUB — Standard for All Projects

**Binary delivery: Cloudflare R2.** All app binaries (DMG, APK) are uploaded to R2 with a `latest.json` manifest. Apps read the manifest directly from R2 CDN — no backend involved.

**R2 bucket:** `assist-releases` at `https://pub-e0444ef9ed9046748280b61f35081720.r2.dev`

**Release protocol:** See `/Users/muhammadwaleed/Downloads/speed/r2-release-guide.md`

**Web apps (Vite, Next.js):**
- GitHub Pages via `.github/workflows/deploy.yml` on push to `main`
- Vite: `base: '/<repo-name>/'` in `vite.config.ts`
- Next.js: `output: 'export'`, `basePath: '/<repo-name>'` in `next.config.ts`

**Releases hub location:** `/Users/muhammadwaleed/Downloads/speed/releases-hub/`
Hub repo: `waleedrana777/releases-hub` — edit `WEB_APPS` / `APPS` arrays in `index.html` to add new projects.

---

### FLUTTER PROJECT PIPELINE — Standard for All Flutter Apps

Every Flutter project must include these two steps before first build:

1. **Random app icon** — Never ship the default Flutter icon. Generate a unique icon (`flutter_launcher_icons` package), place at `assets/icon/app_icon.png`, run `flutter pub run flutter_launcher_icons`.

2. **`release.sh`** — Copy into every Flutter project root. Builds + uploads to R2 + updates manifest in one command.
   - Source template: `/Users/muhammadwaleed/Downloads/speed/ai_executive_assistant/assist_app/release.sh`
   - `cp <template-path>/release.sh ./ && chmod +x release.sh`

**Build & release:**
```bash
./release.sh apk     # Build APK + publish to R2
./release.sh macos   # Build DMG + publish to R2
./release.sh all     # Both platforms
flutter run -d macos # Run directly without DMG
```

---

### APP FACTORY SESSION START

When entering any App Factory or Flutter production session, run this immediately after step 6:

```bash
python3 /Users/muhammadwaleed/Downloads/speed/PKA/scripts/refresh_app_map.py
```

This script scans all app repos in `/speed/`, classifies each by production stage (Shipped / Release Ready / Deployed / Library), regenerates `PKA/owners-inbox/app-journey-map.html` from live git data, and opens it in the browser.

**Signals that this is an App Factory session:**
- Working on any app in `/speed/` (Flutter, Tauri, Swift, React)
- User mentions "factory", "ship", "pipeline", "app", "release", "production"
- Project resume shows active App Factory work

**Keep the map current:** Re-run the script any time an app is tagged, a workflow is added, or a new app is created.
