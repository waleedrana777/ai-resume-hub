# Global Dev Rules
_Context: claude-mem. Rules: here. Updated: 2026-04-01._

## Skills
`speed-ship` build/ship/create → 15min | `bug-fix` broken/failing → 5min | `drift-check` before everything → 1min | `simplify-percentage` bloat audit | `desktop-guardian` macOS GUI
Default: `drift-check` then `speed-ship`. Broken? `bug-fix`. Source: `~/.claude/skills/` → `waleedrana777/claude-skills`

## Git
- **`main` only.** Worktree branches → merge to main immediately, delete branch.
- Push every 2-3 stable commits. Session cuts lose unpushed work.
- Before merge: `git diff main <branch> --name-status | grep "^D"` — recover deleted files.

## Quality Gate
Flutter: `flutter analyze` | React: no console errors | Python: no unused imports | All: re-read changes, no debug/dead code/secrets.

## Principles
No speculative code. Read before touching. Run and verify. One change per commit. UI must look right. Features before polish. Done = full journey. Scope before code. No hacks. Delete unused. Vanilla architecture. Minimal deps.

## Model Routing
Opus: architecture, debug, tradeoffs, review, planning.
Sonnet: scaffolding, boilerplate, git ops, styling, tests, refactors.
Opus delegates rote work to `Agent(model:"sonnet")`. Sonnet escalates ambiguity to `Agent(model:"opus")`.

## Architecture
Leave code simpler: batch N+1, extract duplicates, cut unnecessary calls, surface errors. Don't optimize what isn't broken.

## Releases
R2 bucket `assist-releases`: `https://pub-e0444ef9ed9046748280b61f35081720.r2.dev` — protocol at `speed/r2-release-guide.md`
Web: GitHub Pages + deploy.yml. Vite `base:'/<repo>/'` | Next.js `output:'export'` `basePath:'/<repo>'`
Hub: `speed/releases-hub/` → `waleedrana777/releases-hub`

## Flutter
Before first build: (1) custom icon via `flutter_launcher_icons` (2) copy `release.sh` from `speed/ai_executive_assistant/assist_app/`
`./release.sh apk|macos|all`

## App Factory
Run `python3 speed/PKA/scripts/refresh_app_map.py` when working on any app in `/speed/` or user mentions factory/ship/release. Re-run on tag/workflow/new app.
