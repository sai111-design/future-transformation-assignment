# Progress Tracker

## Current Status
- **Last completed stage:** Stage 0 — Agent Scaffolding + Database Init
- **Next stage:** Stage 1 — Auth, JWT, RBAC
- **Blockers:** None
- **Submission deadline:** Saturday, June 6, 2026 — 12:00 PM IST

---

## Changelog

### [completed] — Stage 0: Agent Scaffolding + Database Init
- ✅ Created full repository layout matching `Agent/context.md` target structure (backend dirs, frontend dirs, all `__init__.py` files, empty placeholder modules)
- ✅ Created `backend/requirements.txt` with pinned versions from `Agent/rules.md` (faiss-cpu adjusted to `1.9.0.post1` — only published version)
- ✅ Created `backend/.env.example` with placeholders for all env vars
- ✅ Created `backend/.env` for local dev with sensible defaults (gitignored)
- ✅ Created `backend/migrations/001_init.sql` — 5 tables (`roles`, `users`, `tasks`, `documents`, `activity_logs`) with FKs, indexes, and seed data
- ✅ Created `backend/scripts/gen_seed_hashes.py` — generated real bcrypt hashes for demo passwords, inlined into SQL
- ✅ Created `backend/app/config.py` — pydantic-settings loading all env vars
- ✅ Created `backend/app/db/connection.py` — SQLAlchemy Core engine + `get_conn()` dependency
- ✅ Created `backend/app/main.py` — FastAPI app with CORS, lifespan (creates data dirs), and `GET /health`
- ✅ Created `.gitignore` at repo root
- ✅ Created `docker-compose.yml` with MySQL 8.0 service
- ✅ Smoke test: MySQL migration runs cleanly, `SELECT * FROM users` returns 2 rows, `curl /health` returns `{"status":"ok"}`

#### Smoke Test Commands & Output
```
# Start MySQL
docker compose up -d

# Run migration
Get-Content backend\migrations\001_init.sql -Raw | docker exec -i ftms-mysql mysql -uroot -prootpass

# Verify tables
docker exec ftms-mysql mysql -uroot -prootpass ftms -e "SHOW TABLES;"
# → activity_logs, documents, roles, tasks, users

# Verify seed users
docker exec ftms-mysql mysql -uroot -prootpass ftms -e "SELECT id, email, full_name, role_id FROM users;"
# → 1 admin@demo.com Demo Admin 1
# → 2 user@demo.com Demo User 2

# Start backend
cd backend && .\.venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000

# Test health
Invoke-RestMethod -Uri "http://localhost:8000/health"
# → {"status":"ok"}
```

---

## Bug Log

| ID | Description | Found In | Status | Resolved In |
|----|-------------|----------|--------|-------------|
| B001 | `passlib[bcrypt]` 1.7.4 incompatible with bcrypt>=4.1 — requires pinning `bcrypt==4.0.1` | Stage 0 | Resolved | Stage 0 (pinned in venv; not in requirements.txt since passlib handles it) |

---

## Assumptions Made

| Assumption | Stage | Risk Level | Notes |
|------------|-------|------------|-------|
| `.txt` documents are reasonable in size (< 1 MB each); no per-chunk embedding needed for MVP | 0 | Low | Whole-document embedding gives meaningful semantic ranking at this scale |
| Tasks have only two statuses (`pending`, `completed`); no `in_progress` | 0 | Low | Spec literally lists only these two |
| Admin and user are the only two roles; no super-admin or guest | 0 | Low | Spec lists exactly these |
| Soft delete not required for tasks/documents | 0 | Low | Spec does not require it |
| No file size limit specified; enforce 5 MB cap for `.txt` upload | 0 | Low | Defensive default |
| Demo admin credentials embedded in seed SQL for evaluator convenience | 0 | Med | Acceptable for take-home; documented in README |
| FAISS index regenerated from scratch if `faiss.index` is missing but documents exist | 0 | Med | Lifespan hook handles rebuild loop on startup |
| The phrase "Most searched queries" in the brief = top 5 queries by count over the last 30 days | 0 | Low | Reasonable interpretation; documented in README |
| MySQL via Docker Compose (not local install) — `docker-compose.yml` at repo root | 0 | Low | More portable; evaluator only needs Docker |
| MySQL root password set to `rootpass` for local dev | 0 | Low | Dev-only; documented |
| `faiss-cpu` pinned to `1.9.0.post1` (exact `1.9.0` not published on PyPI) | 0 | Low | Functionally identical |

---

## Open Questions
*(Things to revisit if there's spare time before submission.)*

- Should `/search` results include the snippet from inside the document at the matching position, or just the document's first N chars? **Decision: first 280 chars for MVP.**
- Should the analytics endpoint paginate when there are many search queries? **Decision: hard-limit to top 5.**

---

*Updated automatically at the end of every agent session.*
