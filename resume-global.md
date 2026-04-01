# AI Dev Protocol — Global Rules
_Rules only. Cross-session context managed by claude-mem._
_Last updated: 2026-04-01_

> **Constraints are more important than features.**

---

## CUSTOM SKILLS — Use These

| Skill | Trigger | Time |
|-------|---------|------|
| `speed-ship` | Any build/ship/create/implement task | 15 min |
| `bug-fix` | Anything broken, failing, wrong | 5 min |
| `drift-check` | Run before every feature or bug fix | 1 min |
| `simplify-percentage` | Complexity audit, bloat, over-engineering | On demand |
| `desktop-guardian` | macOS GUI automation via Hammerspoon | On demand |

**Default mode:** `speed-ship` for all feature work. `drift-check` before everything. `bug-fix` when broken.

Skills source: `~/.claude/skills/` — synced to `waleedrana777/claude-skills` on GitHub.

---

## SINGLE BRANCH LAW

**Always work on `main`. Never leave work on a feature/worktree branch.**

Claude Code auto-creates worktree branches. Fix immediately:

```bash
git branch --show-current
# If NOT on main:
git add -A && git commit -m "wip: checkpoint before merge"
git checkout main
git merge claude/<branch-name> --no-ff -m "merge <branch-name> to main"
git branch -d claude/<branch-name>
```

`main` is the only shared truth between agents.

---

## PUSH CADENCE

Push to `origin/main` after every 2-3 stable commits. Session cuts happen — frequent pushes = zero lost work.

---

## MERGE SAFETY

Worktree branches can silently delete files added to `main` after the branch point.

```bash
git diff main <branch> --name-status | grep "^D"
# If critical files show as D: git checkout main -- <file>
```

---

## QUALITY GATE — Before Any Commit

| Platform | Command |
|----------|---------|
| React/Vite | Verify no console errors in browser |
| Flutter | `flutter analyze` — exit 1 with only `info` is OK |
| Python | Check for unused imports in touched files |
| Any | Re-read changed files — no debug code, no dead code, no secrets |

---

## DEVELOPMENT PRINCIPLES

- **No speculative code.** Build exactly what was asked, nothing more.
- **Read before touching.** Never modify a file you haven't read in this session.
- **Verify, don't assume.** Run the thing. Look at the output.
- **One logical change per commit.** Atomic commits make bisect fast.
- **Beautiful UI is not optional.** If something looks wrong, fix it.
- **Features first, UI polish second.** Working plain beats broken beautiful.
- **Done = full journey.** If a user would need an obvious follow-up, you're not done.
- **Before any feature, ask once:** "What's the full floor?" Agree on scope first.
- **No hacks.** Feels clever, fragile, or needs manual steps? Find the real solution.
- **Delete the unused.** No backwards compat shims, no dead code.
- **Vanilla architecture.** Minimal dependencies, no abstractions until forced.

---

## MODEL ROUTING — Save Opus Tokens

**Opus keeps:** architecture, debugging, tradeoffs, code review, planning.
**Sonnet gets:** scaffolding, boilerplate, simple bugs, git ops, styling, search, tests, refactors.

Opus delegates file creation, repetitive code, and commits to `Agent(model: "sonnet")`.
Sonnet escalates architecture decisions to `Agent(model: "opus")` with full context.

---

## ARCHITECTURE OPTIMIZATION

Every session should leave the codebase simpler and faster:

- N+1 queries -> batch
- Duplicated logic -> extract helper
- Unnecessary API calls -> targeted refresh
- Silent error swallowing -> surface to user

Don't optimize working code that isn't a real problem. Vanilla beats clever.

---

## RELEASES HUB

**Binary delivery: Cloudflare R2.** Binaries (DMG, APK) uploaded with `latest.json` manifest.

**R2 bucket:** `assist-releases` at `https://pub-e0444ef9ed9046748280b61f35081720.r2.dev`
**Release protocol:** `/Users/muhammadwaleed/Downloads/speed/r2-release-guide.md`

**Web apps:** GitHub Pages via `.github/workflows/deploy.yml` on push to `main`.
- Vite: `base: '/<repo-name>/'` | Next.js: `output: 'export'`, `basePath: '/<repo-name>'`

**Hub:** `/Users/muhammadwaleed/Downloads/speed/releases-hub/` — repo `waleedrana777/releases-hub`.

---

## FLUTTER PROJECT PIPELINE

Before first build:

1. **App icon** — Never ship default. Generate via `flutter_launcher_icons` at `assets/icon/app_icon.png`.
2. **`release.sh`** — Copy from `/Users/muhammadwaleed/Downloads/speed/ai_executive_assistant/assist_app/release.sh`.

```bash
./release.sh apk     # APK + R2
./release.sh macos   # DMG + R2
./release.sh all     # Both
```

---

## APP FACTORY SESSION START

When entering any App Factory or Flutter production session:

```bash
python3 /Users/muhammadwaleed/Downloads/speed/PKA/scripts/refresh_app_map.py
```

Scans `/speed/` repos, classifies by production stage, regenerates app journey map.

**Triggers:** Working on any app in `/speed/`, user mentions factory/ship/pipeline/app/release/production.
**Keep current:** Re-run when app tagged, workflow added, or new app created.
