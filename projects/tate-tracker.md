# AI Dev Resume — Tate Content Tracker
_The agent handoff file. Any AI agent reads this first._
_Last updated: 2026-03-29_

---

## PART 1 — GLOBAL PROTOCOL
> See `/tmp/global-resume.md` or fetch from `https://ai-resume-hub.ranadev.workers.dev/global`

---

## PART 2 — PROJECT OVERVIEW

**Project:** Tate Content Universe — Tracker
**Stack:** Tauri v2 + Vanilla JS frontend + Rust backend + SQLite (rusqlite)
**Repo:** Local at `/Users/muhammadwaleed/Downloads/speed/Tate's Content/tate-tracker/`
**Platform:** macOS (DMG output)

**What it does:**
A desktop application for tracking Andrew Tate's content across platforms (YouTube, Rumble, Spotify, Kick, Twitter/X, etc.). Tracks content with HTTP-style status codes (200 Live, 404 Not Found, 451 Banned, etc.), supports CRUD operations, CSV export, backup/restore, and full-text search.

**Key architecture decisions:**
- SQLite for persistence (WAL mode, auto-backup system keeping last 10 backups)
- Typed Rust error system (`AppError` enum with `thiserror` + Serde serialization for IPC)
- Frontend error boundary (global `onerror` / `onunhandledrejection` with retry UI)
- No external font/icon CDN dependencies — fully offline-capable
- Inline SVG icons throughout (no Lucide CDN dependency)
- XSS-safe rendering with `escapeHtml` / `escapeAttr` on all user content
- Seed data auto-populates on first launch (13 entries)

---

## PART 3 — CURRENT STATE

**Last session (2026-03-29):**
- Scaffolded Tauri v2 app from scratch
- Built Rust backend: `db.rs` (SQLite CRUD + backup/restore), `error.rs` (typed errors), `models.rs` (ContentEntry + validation), `commands.rs` (10 Tauri commands)
- Built full frontend: `index.html`, `styles.css`, `main.js` with dark/light theme, sidebar filters, stats strip, detail drawer, add panel, CSV export
- DMG built successfully: `Tate Content Tracker_1.0.0_aarch64.dmg`

**Next action:**
- Create GitHub repo, add release workflow, push
- Add to releases-hub

**Open TODOs:**
- [ ] GitHub repo creation + push
- [ ] `.github/workflows/release.yml` for automated DMG builds on tag push
- [ ] Add project to releases-hub `APPS` array
- [ ] Optional: XLSX import from existing `tate-content-tracker.xlsx`

---

## PART 4 — FILE MAP

```
tate-tracker/
├── src/                    # Frontend
│   ├── index.html          # Main UI — full dashboard
│   ├── styles.css          # Design system (dark/light tokens)
│   └── main.js             # Tauri IPC, state, rendering, error boundary
├── src-tauri/
│   ├── Cargo.toml          # Rust deps: tauri, rusqlite, thiserror, uuid, chrono
│   ├── tauri.conf.json     # App config — DMG bundle, 1400x900 window
│   ├── src/
│   │   ├── lib.rs          # App entry, setup, DB init, seed data
│   │   ├── commands.rs     # 10 Tauri commands (CRUD, export, backup)
│   │   ├── db.rs           # SQLite wrapper with Mutex<Connection>
│   │   ├── error.rs        # AppError enum — typed, serializable
│   │   └── models.rs       # ContentEntry, AppStats, validation
│   └── capabilities/       # Tauri permissions
└── package.json
```

---

## PART 5 — DEV LOG

### 2026-03-29 — Initial Build (Agent: Claude Code CLI)
**Built:** Complete Tauri v2 desktop app from existing HTML dashboard
- Rust backend with SQLite persistence, typed error handling, backup/restore
- Full CRUD via Tauri IPC commands
- Offline-capable frontend (no CDN dependencies)
- DMG bundle produced successfully
**Broke/unexpected:** `tauri::Manager` trait needed explicit import for `app.path()` and `app.manage()`
**Next:** Push to GitHub, add release workflow
