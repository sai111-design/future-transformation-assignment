# AI-Powered Task & Knowledge Management System

A full-stack MVP with semantic search over a document corpus and role-based task management.

Built as a take-home assignment for the **Full Stack AI Developer Intern** role at Future Transformation.

---

## Demo Credentials

```
Admin:  admin@demo.com  /  AdminPass123!
User:   user@demo.com   /  UserPass123!
```

---

## Tech Stack

**Backend**
- Python 3.11, FastAPI 0.115
- SQLAlchemy Core (raw parameterized SQL, no ORM)
- PyMySQL driver

**Database**
- MySQL 8.0 (InnoDB, utf8mb4)

**AI / Search**
- sentence-transformers `all-MiniLM-L6-v2` (384-dim embeddings, CPU-only)
- FAISS `IndexFlatL2` (exact nearest neighbor)

**Frontend**
- React 18 + TypeScript 5 (strict mode)
- Vite 5 (bundler + dev server)
- Tailwind CSS 3
- Axios (HTTP client), React Router 6

---

## Architecture

```
React SPA  ── HTTP/JWT ──►  FastAPI  ──►  MySQL
                              │
                              └──►  FAISS index (local file)
                                    + sentence-transformers (in-memory)
```

The backend follows a three-layer pattern: **routers** (thin HTTP handlers that parse requests and return responses), **services** (business logic, validation, and activity logging), and **db/queries** (raw parameterized SQL via SQLAlchemy Core). This separation keeps each layer testable and prevents SQL from leaking into route handlers. The AI pipeline (embedding model + FAISS index) is loaded once on startup and shared across requests.

---

## Project Structure

```
future-transformation-assignment/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, lifespan, CORS, router wiring
│   │   ├── config.py            # Pydantic settings from .env
│   │   ├── deps.py              # Auth dependencies (get_current_user, require_admin)
│   │   ├── routers/
│   │   │   ├── auth.py          # POST /auth/login
│   │   │   ├── tasks.py         # GET/POST/PATCH /tasks
│   │   │   ├── documents.py     # GET/POST /documents
│   │   │   ├── search.py        # POST /search
│   │   │   └── analytics.py     # GET /analytics
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── task_service.py
│   │   │   ├── document_service.py
│   │   │   ├── search_service.py
│   │   │   └── analytics_service.py
│   │   ├── db/
│   │   │   ├── connection.py    # SQLAlchemy engine + get_conn()
│   │   │   └── queries.py       # Raw SQL constants
│   │   ├── schemas/             # Pydantic request/response models
│   │   └── utils/
│   │       ├── jwt_utils.py     # JWT create/decode (HS256)
│   │       ├── password.py      # bcrypt hash/verify
│   │       └── activity.py      # Activity log helper
│   ├── migrations/
│   │   └── 001_init.sql         # Schema + seed data
│   ├── data/                    # gitignored — FAISS index + uploads
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios client + typed API modules
│   │   ├── components/          # NavBar, Layout
│   │   ├── context/             # AuthContext (JWT + role state)
│   │   ├── pages/               # Login, Tasks, TaskNew, Documents, Search, Analytics
│   │   ├── routes/              # PrivateRoute, AdminRoute guards
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── docker-compose.yml
├── README.md
└── LICENSE
```

---

## Setup (Fresh Machine)

### Prerequisites

- Python 3.11+
- Node.js 20+
- Docker (for MySQL)
- Git

### Step 1 — Clone

```bash
git clone https://github.com/sai111-design/future-transformation-assignment.git
cd future-transformation-assignment
```

### Step 2 — Start MySQL

```bash
docker compose up -d mysql
```

Wait a few seconds for MySQL to initialize, then run the migration:

```bash
# Linux / macOS
docker exec -i ftms-mysql mysql -uroot -prootpass < backend/migrations/001_init.sql

# Windows (PowerShell)
Get-Content backend\migrations\001_init.sql -Raw | docker exec -i ftms-mysql mysql -uroot -prootpass
```

### Step 3 — Backend

```bash
cd backend
python -m venv .venv

# Activate virtual environment
source .venv/bin/activate        # Linux/macOS
.venv\Scripts\activate           # Windows

pip install -r requirements.txt

cp .env.example .env             # then edit if needed (defaults work with Docker setup)
```

Edit `.env` — set `MYSQL_USER=root` and `MYSQL_PASSWORD=rootpass` to match the Docker container:

```
MYSQL_USER=root
MYSQL_PASSWORD=rootpass
```

Start the backend:

```bash
uvicorn app.main:app --reload
```

> **Note:** On first run, the sentence-transformers model (~80 MB) is downloaded from HuggingFace. Subsequent starts load from cache.

### Step 4 — Frontend

```bash
cd frontend
npm install
npm run dev
```

### Step 5 — Visit

Open `http://localhost:5173` and log in with the demo credentials above.

---

## API Reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/login` | Public | Authenticate with email/password, returns JWT + role |
| `GET` | `/tasks` | User/Admin | List tasks with optional `?status=` and `?assigned_to=` filters |
| `POST` | `/tasks` | Admin | Create a task and assign it to a user |
| `PATCH` | `/tasks/{id}` | User/Admin | Update task status to `completed` |
| `POST` | `/documents` | Admin | Upload a `.txt` file (multipart), generates embedding |
| `GET` | `/documents` | User/Admin | List all documents (metadata only) |
| `GET` | `/documents/{id}` | User/Admin | Get full document content |
| `POST` | `/search` | User/Admin | Semantic search over document corpus |
| `GET` | `/analytics` | Admin | Task counts + top 5 searched queries |

Interactive API docs available at `http://localhost:8000/docs` (Swagger UI).

---

## AI Approach

The semantic search pipeline is implemented entirely locally — no external LLM API is called in the search path.

**Embeddings** are generated using `sentence-transformers/all-MiniLM-L6-v2`, a lightweight model that produces 384-dimensional vectors and runs on CPU (~80 MB download on first use). Each document is embedded as a whole (single vector per document) and stored in a **FAISS `IndexFlatL2`** index, which performs exact nearest-neighbor search using L2 (Euclidean) distance.

**Search flow:** When a user submits a query via `POST /search`, the query string is encoded into a 384-dim vector using the same model, then FAISS returns the top-k nearest document vectors by L2 distance. The matching document IDs are looked up in MySQL to return titles, snippets (first 280 characters), and relevance scores (lower L2 distance = better match).

The FAISS index is persisted to disk (`backend/data/faiss.index`) and reloaded on server restart. If the index file is missing, it is rebuilt from all documents in the database.

**No external LLM API is called in the search path. All embedding and retrieval logic is implemented locally as required by the assignment brief.**

---

## Activity Logging

Four user actions are logged to the `activity_logs` table with structured JSON payloads:

- **`login`** — logged on successful authentication
- **`task_update`** — logged when a task status changes (payload includes `from_status` and `to_status`)
- **`document_upload`** — logged when a document is uploaded (payload includes `filename` and `document_id`)
- **`search`** — logged on every semantic search query (payload includes `query` and `top_k`)

The analytics endpoint (`GET /analytics`) aggregates search logs to surface the top 5 most-searched queries over the last 30 days.

---

## Trade-offs and Out-of-Scope

**PDF upload** is deferred. The assignment brief marks it as optional; only `.txt` files are supported. Adding PDF parsing (via PyMuPDF or similar) would be a straightforward extension but was descoped to stay within the 2-day build window.

**Whole-document embeddings** are used instead of chunked embeddings. For the expected document sizes (< 1 MB text files) and corpus scale (< 1,000 documents), a single vector per document provides meaningful semantic ranking. Chunking would improve precision for long documents but adds complexity in indexing, retrieval, and snippet extraction.

**JWT-only authentication** with no refresh token and no server-side logout invalidation. Tokens expire after 60 minutes. For a production system, refresh tokens and a token blacklist would be needed.

**No formal test suite.** Given the 2-day scope, testing is done via manual smoke tests (documented below). A production codebase would have pytest for the backend and Vitest for the frontend.

---

## Smoke Test

After setup, verify the system end-to-end:

```bash
# 1. Health check
curl http://localhost:8000/health
# → {"status":"ok"}

# 2. Admin login
curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","password":"AdminPass123!"}' | python -m json.tool
# → {"access_token":"eyJ...","token_type":"bearer","role":"admin","user_id":1}

# Save the token
TOKEN="<paste access_token here>"

# 3. Create a task (admin)
curl -s -X POST http://localhost:8000/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Review docs","description":"Read the knowledge base","assigned_to":2}'
# → 201 with task JSON

# 4. Upload a document (admin)
echo "Annual leave policy: employees get 20 days paid leave per year." > /tmp/leave.txt
curl -s -X POST http://localhost:8000/documents \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/leave.txt" \
  -F "title=Leave Policy"
# → 201 with document JSON

# 5. Semantic search
curl -s -X POST http://localhost:8000/search \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"how many vacation days do I get?","top_k":3}'
# → Results ranked by relevance (Leave Policy should be top result)

# 6. Analytics (admin only)
curl -s http://localhost:8000/analytics \
  -H "Authorization: Bearer $TOKEN"
# → {"total_tasks":...,"completed_tasks":...,"pending_tasks":...,"top_search_queries":[...]}

# 7. User login
curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@demo.com","password":"UserPass123!"}' | python -m json.tool
# → {"access_token":"eyJ...","token_type":"bearer","role":"user","user_id":2}

# 8. User cannot create tasks (RBAC)
USER_TOKEN="<paste user access_token>"
curl -s -X POST http://localhost:8000/tasks \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"test","assigned_to":2}'
# → 403 {"detail":"Admin only"}

# 9. User cannot access analytics (RBAC)
curl -s http://localhost:8000/analytics \
  -H "Authorization: Bearer $USER_TOKEN"
# → 403 {"detail":"Admin only"}
```

---

## Author

**Sai Srinivas**
- GitHub: [sai111-design](https://github.com/sai111-design)

---

