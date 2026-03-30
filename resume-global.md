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

### MODEL ROUTING PROTOCOL — Token Efficiency

**Problem:** Opus 4.6 weekly limits run out fast when Opus tokens are wasted on scaffolding, boilerplate, and git operations that don't require deep reasoning.

**Solution:** Every agent self-identifies its model and routes tasks to the cheapest model that can handle them correctly, using the `Agent` tool's `model` parameter (`"opus"`, `"sonnet"`, `"haiku"`).

---

#### Step 1 — Self-Identify at Session Start

Before starting any work, determine and declare your model:

```
"Running as [Opus 4.6 / Sonnet 4.6 / Haiku 4.5]. Applying model routing protocol."
```

---

#### Step 2 — Classify Every Task Before Executing

Before writing code or running commands, classify the task:

**OPUS-ONLY tasks** (require deep reasoning — never delegate to Sonnet):
| Task | Signal |
|------|--------|
| Architecture / system design | "How should this be structured?" |
| Complex debugging | Race conditions, state corruption, subtle logic errors |
| Code review / finding non-obvious issues | "Is this implementation correct?" |
| API and data model design | Schema decisions, endpoint design, state shape |
| Evaluating tradeoffs between approaches | "Should we use X or Y?" |
| Designing the implementation plan itself | Breaking a feature into steps |

**SONNET tasks** (execution from a clear spec — never waste Opus on these):
| Task | Signal |
|------|--------|
| Creating files from a defined spec | "Create a widget that does X with fields Y, Z" |
| Writing boilerplate | Models, providers, services, screen scaffolds |
| Writing tests from existing code | "Write tests for this function" |
| Simple bug fixes | Missing imports, typos, null checks, off-by-one |
| Git operations | Commit, push, merge, branch cleanup |
| Refactoring with clear instructions | "Rename X to Y", "Extract this into a method" |
| Adding/removing dependencies | pubspec changes, package installs |
| File exploration and search | Reading files, grepping, globbing |
| CSS/styling/layout tweaks | Spacing, colors, font sizes |
| Documentation and comments | README updates, docstrings |

**Decision rule:** If the task has a single correct answer that a competent developer could produce without architectural judgment → Sonnet. If it requires choosing between valid approaches or understanding non-obvious consequences → Opus.

---

#### Step 3 — Route Based on Your Identity

**If you ARE Opus and the task is a Sonnet task:**

Do NOT execute it yourself. Delegate:

```
Agent(
  model: "sonnet",
  description: "scaffold [what]",
  prompt: "[Complete, self-contained spec. Include ALL context the subagent needs —
           file paths, data structures, naming conventions, exact requirements.
           The subagent has NO conversation history.]"
)
```

Critical rules for Opus delegation:
- **Never** create file scaffolds yourself — spawn Sonnet
- **Never** write repetitive widget/model/test code yourself — spawn Sonnet
- **Never** run git commit/push yourself — spawn Sonnet
- **Review** every Sonnet result before moving on (this is an Opus task)
- **Batch** Sonnet tasks: don't spawn 5 agents for 5 files — spawn 1 agent for all 5

**If you ARE Sonnet and the task is an Opus task:**

Do NOT attempt it yourself. Escalate:

```
Agent(
  model: "opus",
  description: "design [what]",
  prompt: "[Specific question with full context. Ask for a concrete deliverable:
           a plan, a decision, a code review, an architecture. Not open-ended.]"
)
```

Critical rules for Sonnet escalation:
- **Do** escalate architecture decisions — don't guess
- **Do** escalate when you're choosing between 2+ valid approaches
- **Do** escalate code review of complex logic
- **Don't** escalate simple bugs you can see the fix for
- **Don't** escalate if you have a clear spec to follow
- **Apply** the Opus result yourself (execution is your job)

**If you ARE the correct model for the task:**

Execute it directly. No delegation needed.

---

#### Step 4 — Token Budget Awareness

**Opus sessions target:** ≥70% of tokens on planning, design, review, complex logic. ≤30% on execution. If Opus is writing boilerplate → stop, delegate.

**Sonnet sessions target:** Spend freely on execution. Only escalate to Opus when genuinely uncertain about the right approach — not just the right syntax.

**Subagent output rule:** Keep subagent return values concise. A Sonnet agent creating 5 files should NOT return all file contents — just confirm what was created. The parent reads files directly if needed.

---

#### Examples — Correct Routing

```
User: "Add a settings screen with dark mode toggle, font size slider, and notification preferences"

Opus session:
  1. [OPUS] Design the settings data model and state management approach
  2. [OPUS → Sonnet] "Create lib/screens/settings_screen.dart with these specs: [full spec from step 1]"
  3. [OPUS → Sonnet] "Create lib/providers/settings_provider.dart with these fields: [exact fields]"
  4. [OPUS] Review Sonnet output, check for state management issues
  5. [OPUS → Sonnet] "Fix [specific issues found in review]"
  6. [OPUS → Sonnet] "Commit: 'Add settings screen with dark mode, font size, notifications'"

Sonnet session:
  1. [Sonnet → Opus] "Design settings architecture: what state manager, what persistence, what structure?"
  2. [Sonnet] Create all files following Opus plan
  3. [Sonnet → Opus] "Review these implementations for issues: [paste key logic]"
  4. [Sonnet] Apply fixes, commit, push
```

```
User: "The map markers disappear when switching tabs"

Opus session:
  1. [OPUS] Read relevant files, diagnose the state lifecycle bug (this IS the Opus task)
  2. [OPUS → Sonnet] "Apply this fix: in map_provider.dart line 45, change X to Y. Then commit."

Sonnet session:
  1. [Sonnet] Read files, attempt diagnosis
  2. [Sonnet → Opus] "Markers disappear on tab switch. State is in MapProvider. Here's the relevant code: [paste]. What's the root cause?"
  3. [Sonnet] Apply the fix Opus identifies, commit, push
```

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

---

### RELEASES HUB — Standard for All Projects

Every project that produces a binary or deployable UI must have a GitHub Actions release workflow. The central releases hub at `waleedrana777/releases-hub` (GitHub Pages) auto-fetches release data from the GitHub API and only shows projects that have published releases.

**Rule: Before adding a project to the releases hub, it must have a working release workflow.**

**Desktop apps (Tauri, Swift, Flutter, Electron):**
- Add `.github/workflows/release.yml` triggered on `push: tags: v*`
- Tauri apps use `tauri-apps/tauri-action@v0` (handles macOS DMG, Windows EXE, Linux AppImage automatically)
- Swift apps: build with `swift build -c release`, package as DMG with `create-dmg`, publish with `softprops/action-gh-release@v2`
- Tag convention: `git tag v1.0.0 && git push origin v1.0.0`

**Web apps (Vite, Next.js):**
- Add `.github/workflows/deploy.yml` triggered on push to `main`
- Vite: set `base: '/<repo-name>/'` in `vite.config.ts`, upload `dist/` to GitHub Pages
- Next.js: set `output: 'export'`, `basePath: '/<repo-name>'`, `assetPrefix: '/<repo-name>'` in `next.config.ts`, upload `out/` to GitHub Pages
- No platform lock — GitHub Pages is the default; the `dist/`/`out/` artifact deploys anywhere
- Next.js API routes do NOT work on GitHub Pages — note this in next.config.ts

**Releases hub location:** `/Users/muhammadwaleed/Downloads/speed/releases-hub/`
Hub repo: `waleedrana777/releases-hub` — edit `WEB_APPS` / `APPS` arrays in `index.html` to add new projects.

---

### FLUTTER PROJECT PIPELINE — Standard for All Flutter Apps

Every Flutter project must include these two steps before first build:

1. **Random app icon** — Never ship the default Flutter icon. Generate a unique icon (`flutter_launcher_icons` package), place at `assets/icon/app_icon.png`, run `flutter pub run flutter_launcher_icons`.

2. **`auto_dmg.sh`** — Copy into every Flutter project root. Auto-detects app name from `pubspec.yaml`, builds macOS, creates polished DMG.
   - Source template: `/Users/muhammadwaleed/Downloads/speed/ai_executive_assistant/assist_app/auto_dmg.sh`
   - `cp <template-path>/auto_dmg.sh ./ && chmod +x auto_dmg.sh`

**Build & launch:**
```bash
./auto_dmg.sh        # Build macOS DMG
flutter run -d macos # Run directly without DMG
```

Full guide: `/tmp/flutter-pipeline-guide.md` (also saved at project level when needed)
