# AI Dev Resume
_The agent handoff file. Any AI agent reads this first. Update CURRENT STATE at session end._
_Last updated: 2026-03-21_

---

## PART 1 — GLOBAL PROTOCOL
> These rules never change. They apply to every project, every session, every agent.

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
5. Update CURRENT STATE below:
   - "Active Branch" → always "main"
   - "Last session" → what was just done
   - "Next action" → the single next thing (specific, actionable)
   - "Open TODOs" → anything unfinished
6. Update DEV LOG with today's entry
```

**The other agent will read this file first. Leave it in a state you'd want to find.**

---

### CRITICAL FILES — Never Delete

These files must exist in every commit. Any merge that deletes them is a bug:

| File | Why |
|------|-----|
| `resume.md` | Agent handoff — entire dev workflow depends on it |
| `CLAUDE.md` | Claude Code session init |
| `context/me.md` | AI identity context (read by DeepSeek system prompt) |
| `context/routine.md` | Daily schedule context |

**Pre-commit check:** Before any commit, verify these files exist. If `git diff --cached --name-status` shows `D` for any of them, STOP and investigate.

---

### DEPLOYMENT PROTOCOL (Non-Negotiable)

**Schema migrations are additive-only.** New columns get defaults. Never rename or drop columns in the same deploy that changes application code.

**Pre-deploy: snapshot.** Before any deployment touching the database, create a backup:
- SQLite: copy the `.db` file
- PostgreSQL: `pg_dump`
Tag with git SHA. Retain 7 days minimum.

**Deploy sequence:**
1. Run migrations (additive only — `ALTER TABLE ADD COLUMN`)
2. Deploy new application code
3. Smoke test: health check + verify record count
4. If smoke test fails → rollback app code, restore from snapshot

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

This is how `resume.md` almost got deleted on 2026-03-21.

---

### QUALITY GATE — Before Any Commit

Run the checks relevant to what was changed:

| Platform | Command |
|----------|---------|
| Flutter | `flutter analyze assist_app/lib/` — exit 1 with only `info` is OK (see BUG-003) |
| Python | Check for unused imports in touched files |
| React/Vite | Verify no console errors in browser |
| Any | Re-read changed files — no debug code, no dead code, no hardcoded secrets |

---

### SIMPLIFY — After Every Session

After committing, run `/simplify` on every file touched this session. Then verify:

```bash
# Flutter — catch errors before next session
flutter analyze assist_app/lib/

# Web — scan for dead code / duplicate logic
# Review src/App.jsx and any components touched

# Python — scan for unused imports in touched routes/services
# Review python_ea/app/routes/ and python_ea/app/services/
```

Goal: zero accumulation of debt. Every session ends cleaner than it started.

---

### FEEDBACK LOOP — Session Close

After committing, answer these three questions and write them into DEV LOG:

1. **What was built?** (one sentence per change)
2. **What broke / was unexpected?** (be honest — this prevents repeat failures)
3. **What is the exact next action?** (not a list — one thing, specific enough to start coding immediately)

This is the feedback loop. The quality of tomorrow's session depends on the honesty of today's close.

---

### ARCHITECTURE OPTIMIZATION — Built-In, Not Bolted-On

Every session should leave the codebase simpler and faster, not just feature-complete. Apply these checks naturally while building — no separate "optimization sprint" needed.

**During every session, watch for:**
- N+1 queries (loop inside a list endpoint → batch into one query)
- Duplicated logic (same pattern in 2+ files → extract to `app/utils.py`)
- Unnecessary API calls (client fetches everything after every mutation → optimistic updates or targeted refresh)
- Missing caching (same expensive query on every request → TTL cache)
- Silent error swallowing (`catch (_) {}` → surface to user)

**When NOT to optimize:**
- Don't add new packages/services to "improve performance" unless they enable something impossible otherwise
- Don't restructure working code that isn't causing real problems
- Don't optimize for scale (1 user, not 10,000)
- Keep architecture simple — vanilla patterns beat clever abstractions

**Plan mode for big changes:** If a tool or pattern would radically change performance (e.g., SSE replacing polling, batch queries replacing N+1), use plan mode first to design it. Small fixes (extract a helper, add a cache) can go inline.

---

### DEVELOPMENT PRINCIPLES

- **No speculative code.** Build exactly what was asked, nothing more.
- **Read before touching.** Never modify a file you haven't read in this session.
- **Verify, don't assume.** Run the thing. Look at the output. Don't guess it works.
- **One logical change per commit.** Atomic commits make bisect fast.
- **Beautiful UI is not optional.** This project's goal is ultra-fast development of beautiful apps. If something looks wrong, fix it.
- **No backwards compat hacks.** If something is unused, delete it.
- **Simple architecture.** Vanilla patterns, minimal dependencies. Tools must be simple.

---

## AGENT SESSIONS
> Each agent updates its own row at session start and clears "In Progress" when fully merged to main.
> Keep it short. One row per agent. No accumulation — done work is deleted from this table.

| Agent | Branch | In Progress |
|-------|--------|-------------|
| Agent A | main | Architecture optimization Session 1 (backend) done; Sessions 2-4 pending |
| Agent B | main | — |

---

## PART 2 — CURRENT STATE
> Update this at the end of every session. This is what the next agent reads first.

---

### Active Branch
`main` — work here directly, never leave code on a worktree branch

### Last Session (2026-03-21, session 3)
- Voice overhaul: replaced streaming speech_to_text with full audio recording → Groq Whisper transcription
- New recording overlay UI: pulsing mic, timer, send/cancel buttons
- TTS via flutter_tts: auto-reads responses, tap speaker icon, TTS toggle in app bar
- Backend `/api/transcribe` endpoint using Groq Whisper (free tier, OpenAI-compatible)
- GitHub Actions fixes: Flutter version 3.41.4, removed generate_release_notes, fixed Telegram curl (POST + data-urlencode)
- Tagged v1.0.3 with all fixes

### Next Action
1. Set `GROQ_API_KEY` env var on Render (get free key from console.groq.com)
2. Run POST /api/migrate/ensure-fields on Render
3. Verify v1.0.3 build succeeds + Telegram notification arrives

### Open TODOs
- [ ] Run migration on Render: POST /api/migrate/ensure-fields (adds sleeplog.source column)
- [ ] Set GROQ_API_KEY on Render (free from console.groq.com) for voice transcription
- [ ] Google Calendar OAuth redirect needs deployed Render URL (not just localhost)
- [ ] Add macOS/Windows/Linux build workflows
- [ ] Test Flutter light mode on device — verify dialog colors use theme correctly
- [ ] Flutter offline/graceful degradation when API cold-starts
- [ ] n8n integration — connect Python API webhooks/triggers to n8n workflows
- [ ] iOS Shortcuts integration — create Shortcuts that hit the Python API (add task, start timer, log sleep, etc.)

---

## PART 3 — PROJECT SNAPSHOT
> Update when architecture changes. Do not update every session.

---

### Project
Personal AI executive assistant for Muhammad Waleed.
Goal: ultra-fast development cycle, beautiful interfaces, zero bugs.

### Stack

| Layer | Tech | Deploy |
|-------|------|--------|
| Python API | FastAPI + SQLAlchemy + APScheduler | Render — `https://ai-assist-h1lq.onrender.com` |
| Flutter app | Flutter 3.x, Provider | iOS/Android (manual build) |
| Web dashboard | React + Vite | Vercel — `https://executivepowerassistant.vercel.app` |
| Database | SQLite (local) / PostgreSQL (Render) | — |
| AI | DeepSeek via OpenAI-compatible SDK | Function calling enabled |
| Voice | Groq Whisper (free tier) + flutter_tts | On-device TTS, cloud STT |
| Email | Resend API | — |
| Calendar | Google Calendar API (OAuth2 + Service Account) | — |
| Notifications | Telegram Bot + flutter_local_notifications | — |
| CI/CD | GitHub Actions → GitHub Releases | — |

### Architecture

```
User
 ├── Flutter app (assist_app/)  ──────────────────┐
 ├── Web dashboard (src/ → Vercel) ────────────────┤──▶ Python FastAPI (Render)
 └── CLI (node sync.js / ea) ──────────────────────┘         │
                                                       ├── SQLite/Postgres
                                                       ├── APScheduler (1 min)
                                                       ├── Resend (email)
                                                       ├── DeepSeek (AI + tools)
                                                       └── Google Calendar API
```

### Key Files

| File | Purpose |
|------|---------|
| `python_ea/run.py` | API entry point (port 8000) |
| `python_ea/app/routes/` | All FastAPI route handlers |
| `python_ea/app/services/` | Scheduler, email, calendar services |
| `src/App.jsx` | Web dashboard — all state lives here |
| `src/components/` | Web UI components |
| `assist_app/lib/main.dart` | Flutter entry, providers, theme |
| `assist_app/lib/screens/` | Flutter screens (Chat/Tasks/Reminders/Actions) |
| `assist_app/lib/theme_notifier.dart` | Theme ChangeNotifier (persists to SharedPreferences) |
| `assist_app/lib/services/api.dart` | Flutter API service singleton |
| `sync.js` | CLI bridge: Claude ↔ API |
| `CLAUDE.md` | Assistant identity rules (Waleed's personal assistant config) |

### API Routes

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/tasks` | List (`?done=bool`, `?project_id=`) |
| POST | `/api/tasks` | Create |
| PATCH | `/api/tasks/{id}` | Update title/note |
| PATCH | `/api/tasks/{id}/done` | Complete |
| DELETE | `/api/tasks/{id}` | Delete |
| GET | `/api/projects` | List with task counts |
| POST | `/api/projects` | Create |
| PATCH | `/api/projects/{id}` | Rename |
| DELETE | `/api/projects/{id}` | Delete + cascade |
| GET | `/api/jobs` | List reminders |
| POST | `/api/jobs` | Create (`fire_at`: "30m", "3h", ISO) |
| PATCH | `/api/jobs/{id}` | Update |
| DELETE | `/api/jobs/{id}` | Delete |
| POST | `/api/chat` | AI chat (`{message, history}`) |
| POST | `/api/hello` | Morning sequence (4 timed reminders) |
| GET | `/api/news` | Fetch AI news from HN |
| POST | `/api/news/send` | Email news digest |
| POST | `/api/email/brief` | Email daily task summary |
| GET | `/api/notes` | Get notes |
| PUT | `/api/notes` | Save notes |
| GET | `/api/notifications/pending` | Overdue jobs for Flutter polling |
| GET | `/api/calendar/events` | Upcoming (`?days=7`) |
| POST | `/api/calendar/events` | Create event |
| POST | `/api/calendar/sync` | Calendar → tasks |
| GET/POST | `/api/chat-sessions` | Chat session CRUD |
| GET/POST | `/api/motives` | Motives CRUD (max 5, pinnable) |
| GET | `/api/calendar/auth/url` | OAuth URL |
| GET | `/api/calendar/auth/google-callback` | Browser redirect handler |
| GET | `/api/calendar/status` | Connection check |
| GET | `/api/version` | Check GitHub Releases for updates |
| POST | `/api/notify` | Send Telegram notification |
| POST | `/api/notify/release` | Send latest GitHub Release links via Telegram |
| POST | `/api/transcribe` | Voice → text (Groq Whisper, multipart audio) |
| GET | `/api/sleep` | Sleep log (`?days=N`) |
| POST | `/api/sleep` | Log bedtime |
| POST | `/api/migrate/ensure-fields` | Add missing DB columns |
| GET | `/health` | Health check |

### Database Models

```
Project:      id, name, hidden, created_at
Task:         id, project_id (FK), title, note, priority, done, done_at, created_at
Job:          id, job_id, label, cron, fire_at, enabled, recurring, email_template, last_fired
Motive:       id, content, pinned, position, created_at
ChatSession:  id, device_id, title, created_at, updated_at
ChatMessage:  id, session_id (FK), role, content, created_at
EmailLog:     id, job_id, subject, status, sent_at
Note:         id="main", content, updated_at
```

### Platform Details

**Python API**
- Scheduler: APScheduler, 1-min interval. One-time jobs fire once then disabled. Cron jobs dedup via 50s cooldown.
- AI tools: `add_task`, `complete_task`, `set_reminder`, `send_email`, `save_notes`, `send_news`, `hello_sequence`, `get_tasks`, `view_calendar`
- Email templates: `reminder` (orange), `urgent` (red), `brief` (table)
- Timezone: `Europe/Rome` (env `TIMEZONE`)

**Flutter**
- Navigation: `IndexedStack` — all screens stay mounted, chat state never lost on tab switch
- Tab refresh: `GlobalKey<TasksScreenState>` + `GlobalKey<RemindersScreenState>` — `refresh()` called on tab switch, 10s cooldown
- Theme: `ThemeNotifier` (ChangeNotifier) + `SharedPreferences` — persists Light/Dark/System
- Theme toggle: Actions screen → SETTINGS section
- Colors: always `Theme.of(context).colorScheme.*` — only hardcoded hex is accent `#D97757`
- Notifications: 30s timer → `/api/notifications/pending` → `AlertDialog`
- Providers: `ApiService` (singleton), `ThemeNotifier` (ChangeNotifier)

**Web Dashboard**
- State: all in `App.jsx` (useState + prop drilling)
- Auto-refresh: `setInterval(loadAll, 60_000)`
- Sync indicator: idle → saving (orange) → synced (green, 2.5s) → idle
- API base: `VITE_API_URL` env or `https://ai-assist-h1lq.onrender.com`
- CSS: CSS variables (`--accent: #D97757`, `--bg: #faf9f5`)
- Note save: debounced 600ms

### Environment Variables

**`python_ea/.env`**
```
DATABASE_URL=sqlite:///./ea.db
DEEPSEEK_API_KEY=
RESEND_API_KEY=
FROM_EMAIL=
TO_EMAIL=waleedrana777@gmail.com
HOST=0.0.0.0
PORT=8000
TIMEZONE=Europe/Rome
GOOGLE_CALENDAR_ID=primary
GOOGLE_SERVICE_ACCOUNT_JSON=
```

**`/.env.local`**
```
VITE_API_URL=https://ai-assist-h1lq.onrender.com
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## PART 4 — KNOWN BUGS & RULES
> Append only. Never delete. These are verified failure modes.
> **Only log bugs that would disrupt multiple future dev cycles.** Common, obvious, or one-off bugs do not belong here — fix them and move on. This section is for systemic traps that future agents will fall into repeatedly without warning.

---

**BUG-001 — Preview screenshots at half width**
Symptom: `preview_screenshot` renders ~400px wide. UI looks broken.
Rule: Never debug CSS layout from screenshots alone. Use `preview_inspect` for computed values. Dashboard is designed for 1200px+.

**BUG-002 — Render free tier cold start returns HTML 404**
Symptom: `"Failed to load data: HTTP 404: <!DOCTYPE html>...Cannot GET /api/projects"`
Cause: Render spins down free tier. First request hits the spin-up HTML page, not the API.
Rule: Wait 20-30s and reload. Do not touch API code in response to this.

**BUG-003 — `flutter analyze` exits 1 for info-level warnings**
Symptom: Exit code 1 with only `info` lines (pre-existing in `voice.dart`).
Rule: Check actual output. If only `info`, the code is valid. Do not treat as a build failure.

**RULE-001 — Never leave uncommitted changes when switching agents**
Context: User rotates between two Claude agents when token limits hit. Uncommitted changes on worktree branches are invisible to the next agent.
Rule: Always commit + merge to main before stopping. Update CURRENT STATE in this file.

**BUG-004 — MissingPluginException on desktop (FIXED)**
Fix: Removed `permission_handler`, using `flutter_local_notifications` built-in API.

**BUG-005 — Worktree branches silently delete files on merge (FIXED)**
Fix: Added MERGE SAFETY protocol and CRITICAL FILES list.

**RULE-002 — Check Render cold start before debugging API errors**

**RULE-003 — Telegram ping on every session end**

**RULE-004 — Never delete critical files** (`resume.md`, `CLAUDE.md`, `context/me.md`, `context/routine.md`)

---

## PART 5 — DEV LOG
> Most recent first. One entry per session. Be honest about what broke.

---

### 2026-03-21 (session 3) — Voice overhaul + GitHub Actions fixes

**Done:** Complete voice input/output overhaul. Replaced streaming `speech_to_text` (stops after 3s silence) with full audio recording via `record` package → backend Groq Whisper transcription. New full-screen recording overlay with pulsing mic animation, live timer, send/cancel buttons. TTS via `flutter_tts` — auto-reads AI responses, speaker icon on each message, TTS toggle in app bar. Backend `/api/transcribe` endpoint using Groq's free Whisper API (whisper-large-v3-turbo, OpenAI-compatible). Fixed GitHub Actions: Flutter version mismatch (3.41.5→3.41.4), removed `generate_release_notes` (needed extra API perms), fixed Telegram curl notifications (emojis in URL → POST with `--data-urlencode`).

**What broke:** GitHub Actions builds kept failing: (1) `generate_release_notes: true` needs permissions beyond `contents: write`, (2) Flutter 3.41.5 doesn't exist on stable channel, (3) curl exit code 3 from emoji chars in URL query string. All three fixed.

**Next:** Set GROQ_API_KEY on Render. Run migration. Verify v1.0.3 build + Telegram notification.

---

### 2026-03-21 (session 2) — Sleep tracker + GitHub Actions fix

**Done:** Full sleep tracking stack. Python: SleepLog model, GET/POST /api/sleep routes, AI log_sleep tool (triggers on "gn", "goodnight", going to sleep). Web: SleepChart component — 7/14/30d range, bar chart with dots, red 23:00 target line, manual log form. Flutter: getSleepLog/logSleep API methods, Log Sleep dialog with time picker, Sleep History list dialog. GitHub Actions: added `permissions: contents: write` to fix 403 on release creation — tagged v1.0.1 to re-trigger build.

**What broke:** GitHub Actions workflow was failing silently with 403 because GITHUB_TOKEN lacked write permission for releases. Fixed with `permissions: contents: write`.

**Next:** Verify Telegram APK link arrives for v1.0.1. Run migration endpoint on Render.

---

### 2026-03-21 — Auto-update + accountability timers + Telegram release notify

**Done:** In-app auto-update with `url_launcher` (dialog + "Update Now" per platform), Android `REQUEST_INSTALL_PACKAGES` permission, accountability timer system (AI tool + timer template + push notification "Have you done X?"), timer UI in Reminders screen, `POST /api/notify/release` endpoint, bug quality rule in resume.md.

**Next:** Deploy to Render. Test timer flow.

---

### 2026-03-20 — Global protocol rewrite + branch merge

**Done:**
- Discovered `affectionate-proskuriakova` worktree had all Flutter work uncommitted (other agent left without committing)
- Committed and merged: Flutter light/dark theme, IndexedStack session fix, SharedPreferences persistence, web 60s auto-refresh, Render URL switch
- Rewrote `resume.md` into global protocol format (this file)

**What broke:** Nothing broke — but the workflow did. Agent ran out of tokens without committing. Led to confusion about which branch had the work. This file's RULE-001 exists because of this incident.

**Next:** Deploy web to Vercel. Test Flutter light mode on device.

---

### 2026-03-20 — Simplify pass

**Done:** Removed `ColorScheme cs` param from Flutter helper methods (fetch internally). Extracted theme mode cards into `_themeModes` const list. Added `WidgetsFlutterBinding.ensureInitialized()` before runApp.

---

### 2026-03-20 — Flutter theme + session fix + web auto-refresh

**Done:**
- `ThemeNotifier` + `SharedPreferences` — persistent light/dark/system theme
- `IndexedStack` — chat no longer resets on tab switch
- `GlobalKey` refresh with 10s cooldown — tabs stay fresh without hammering API
- `shared_preferences` added to pubspec
- All screen colors → `colorScheme.*`
- Web: `setInterval(loadAll, 60_000)` — stays in sync with CLI/Flutter

**Why:** Chat session was being destroyed on every tab switch. No theme toggle existed. Web dashboard was stale after CLI changes.

---

### 2026-03-17 and earlier

See `git log --oneline` for full history.

---

_Template version: 1.0 — copy PART 1 (Global Protocol) to any new project unchanged. Replace PARTS 2–5 with project data._
