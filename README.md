# ai-resume-hub

Global AI agent protocol storage. Stores `resume-global.md` (the global agent handoff protocol) and per-project resumes, served via a Cloudflare Worker API.

## Base URL

```
https://ai-resume-hub.ranadev.workers.dev
```

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/global` | None | Fetch global resume as plain text |
| GET | `/projects` | None | List all project slugs as JSON array |
| GET | `/projects/:name` | None | Fetch a project resume as plain text |
| PUT | `/global` | X-API-Key | Update global resume |
| PUT | `/projects/:name` | X-API-Key | Create or update a project resume |
| DELETE | `/projects/:name` | X-API-Key | Remove a project resume |

## Quick Start

```bash
# Fetch global protocol (agent session start — no auth needed)
curl https://ai-resume-hub.ranadev.workers.dev/global

# List all registered projects
curl https://ai-resume-hub.ranadev.workers.dev/projects

# Sync global resume (requires RESUME_API_KEY)
curl -X PUT "$RESUME_HUB_URL/global" \
  -H "X-API-Key: $RESUME_API_KEY" \
  --data-binary @resume-global.md

# Register a project resume (run from project root)
SLUG=$(basename "$PWD" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | cut -c1-60)
curl -X PUT "$RESUME_HUB_URL/projects/$SLUG" \
  -H "X-API-Key: $RESUME_API_KEY" \
  --data-binary @resume.md
```

## Environment Variables

Add to `~/.zshrc`:

| Variable | Value |
|----------|-------|
| `RESUME_HUB_URL` | `https://ai-resume-hub.ranadev.workers.dev` |
| `RESUME_API_KEY` | Your write-protection key |

## Auto-Sync (Claude Code Hook)

A global `PostToolUse` hook at `~/.claude/hooks/sync-resume.sh` fires automatically whenever Claude writes `resume-global.md` or any project `resume.md`. Success/failure is logged to stderr:

```
[resume-hub] synced: resume-global.md
[resume-hub] synced: projects/my-project
```

## Project Slug Rules

- Derived from project folder name
- Lowercase, hyphens, max 60 chars
- Example: `My App v2` → `my-app`
- Reserved (do not use): `global`, `projects`

## Repository Structure

```
resume-global.md        ← global agent protocol (source of truth)
projects/               ← flat folder, one file per project
  project-name.md
worker/
  index.js              ← Cloudflare Worker source
  wrangler.toml         ← deploy config
```

## Cloudflare Worker Secrets

Set via `wrangler secret put`:

| Secret | Description |
|--------|-------------|
| `GITHUB_TOKEN` | GitHub PAT with `repo` scope |
| `RESUME_API_KEY` | Write-protection key (same as local env var) |

## Error Responses

| Status | Meaning |
|--------|---------|
| 400 | Reserved slug used |
| 401 | Missing or wrong API key |
| 404 | File not found |
| 502 | GitHub API error |
