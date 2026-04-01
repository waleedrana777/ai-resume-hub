# Global Dev Rules
_Context: claude-mem. Rules: here. Updated: 2026-04-01._

**SIMPLICITY WINS.** If it needs explaining, simplify it. The simplest working version is always correct.
**SHIP OR DIE.** A working app on a real device beats a perfect app in your head.

## Skills
`drift-check` 1min before everything | `speed-ship` 15min build/ship | `bug-fix` 5min kill | `simplify-percentage` bloat audit
Source: `~/.claude/skills/` → `waleedrana777/claude-skills`

## What Done Looks Like
Feature shipped to a real device = progress. Everything else is motion.
Done = a user can complete the full journey without asking an obvious follow-up.
If you strip a feature out and the app still works — it was good design. If you can't — it earned its place.

## App Shape — Before Any Code
3–7 screens. One task solved in under 30 seconds. Explained in one sentence. No custom backend at launch. Doesn't fit? Split or simplify. Never grow scope before shipping.

## Build Loop — Five Prompts, One Feature
1. Spec: product spec, screen map, data model, monetization.
2. Plan: file tree and implementation plan.
3. Build: feature by feature with tests.
4. Simplify: delete unnecessary code, reduce deps.
5. Ship: release notes, screenshots, deploy.
Repeat per feature. This loop is the engine.

## Workflow
`IDEA → SHAPE → BUILD → SHIP → LEARN → EXPAND → repeat`
Ship beats perfect. Clone don't rebuild. Fallback everything. Standards first — custom earns its place after 3 repetitions.

## Principles
No speculative code. Read before touching. Vanilla — no abstractions until forced.

## UI Floor
One obvious next step per screen. Never two competing primary actions. Core task ≤3 taps. Errors say what happened + what to do. Loading states always visible. Full creative latitude on: illustration, motion, empty states, brand, dark mode, glassmorphism — as long as the floor holds.

## Quality — 60 Seconds Every Ship
Works on real device. Survives no-internet + bad input + API failure. Readable in 60 seconds. Simpler than last version. No debug/dead code/secrets.

## Model Routing
Opus: architecture, debug, tradeoffs, planning. Sonnet: scaffolding, boilerplate, git, styling, tests.
Opus delegates rote → `Agent(model:"sonnet")`. Sonnet escalates ambiguity → `Agent(model:"opus")`.

## Git
`main` only. Worktree branches → merge immediately, delete. One logical change per commit. Push every 2-3 stable commits. Before merge: `git diff main <branch> --name-status | grep "^D"` for deleted files.

## Releases
R2 `assist-releases`: `https://pub-e0444ef9ed9046748280b61f35081720.r2.dev` — protocol at `speed/r2-release-guide.md`
Web: GitHub Pages + deploy.yml. Hub: `waleedrana777/releases-hub`
