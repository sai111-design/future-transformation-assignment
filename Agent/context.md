# Project Context — Future Transformation Assignment

## What Is This?

An **AI-Powered Task & Knowledge Management System** — a full-stack MVP where Admins upload knowledge documents and assign tasks, and Users complete those tasks aided by AI-powered semantic search over the document corpus.

Built as a take-home assignment for the **Full Stack AI Developer Intern** role at Future Transformation. Deadline: **Saturday, June 6, 2026, 12:00 PM IST**.

---

## Who Is It For?

- **Internal evaluators at Future Transformation** — they assess system design, code quality, and AI implementation correctness.
- **Two in-app personas:** Admin (uploads docs, creates tasks) and User (searches docs, completes tasks).

---

## Core Problem

Knowledge sits in documents that are hard to search by keyword alone. Tasks are tracked in disconnected systems. The platform unifies both: semantic search over a document corpus, plus a task layer with role-based access.

---

## Tech Stack

| Layer | Choice | Version |
|-------|--------|---------|
| Backend | FastAPI | 0.115 |
| Language | Python | 3.11 |
| Database | MySQL | 8.0 (InnoDB, utf8mb4) |
| DB Access | SQLAlchemy **Core** (no ORM) + PyMySQL | 2.0 / 1.1 |
| Auth | JWT (HS256) via python-jose | 3.3 |
| Password hashing | passlib[bcrypt] | 1.7.4 |
| Embeddings | sentence-transformers `all-MiniLM-L6-v2` | 3.2 |
| Vector store | FAISS `IndexFlatL2` (faiss-cpu) | 1.9 |
| Frontend | React + Vite + TypeScript | 18 / 5 / 5 |
| Frontend styling | Tailwind CSS | 3 |
| HTTP client | Axios | 1 |
| Routing | React Router | 6 |

**Hardware target:** Local development on Intel i5-1155G7, 16 GB RAM, integrated graphics. No GPU. Everything must run on CPU.

---

## Architecture Overview

Three-tier:

```
React SPA  ── HTTP/JWT ──►  FastAPI  ──►  MySQL
                              │
                              └──►  FAISS index (local file) + sentence-transformers (in-memory)
```

The backend has three internal layers: **routers** (thin HTTP), **services** (business logic), **db/queries** (raw parameterized SQL). Activity logs are written from service methods.

---

## Data Model

Five mandatory tables plus integer-keyed FK relationships:

```
roles (id, name)
  └──< users (id, email, password_hash, full_name, role_id → roles.id)
         ├──< tasks (id, title, description, status, assigned_to → users.id, created_by → users.id)
         ├──< documents (id, title, filename, storage_path, content_text, uploaded_by → users.id, vector_id)
         └──< activity_logs (id, user_id → users.id, action, payload JSON, created_at)
```

`documents.vector_id` links the row to its position in the FAISS index. `activity_logs.payload` is a MySQL JSON column.

---

## Key Features (Priority Order)

1. **JWT Authentication + RBAC** — login returns token, dependencies enforce admin/user roles.
2. **Task management** — Admin creates and assigns; User views and marks complete.
3. **Document upload** — Admin uploads `.txt`; embedding generated on upload.
4. **Semantic search** — query → embed → FAISS → ranked documents. **Implemented locally, no external LLM.**
5. **Dynamic filtering** — `/tasks?status=...&assigned_to=...`.
6. **Activity logging** — login, task_update, document_upload, search.
7. **Analytics** — total/pending/completed tasks, top searched queries (admin-only).
8. **React frontend** — login, tasks, task creation (admin), documents, search, analytics pages.

---

## Third-Party Integrations

**None.** The brief explicitly disallows relying on external LLM APIs. All AI runs locally.

---

## Known Constraints

- **MySQL mandatory** (not PostgreSQL).
- **No external LLM APIs** for the semantic search path.
- **2-day build window** — descope before missing deadline.
- **Zero-cost** — no paid services, no cloud GPU.
- **GitHub submission** with README — repo must be cloneable and runnable from a fresh machine.

---

## File Structure (Target)

```
future-transformation-assignment/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── deps.py
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── tasks.py
│   │   │   ├── documents.py
│   │   │   ├── search.py
│   │   │   └── analytics.py
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── task_service.py
│   │   │   ├── document_service.py
│   │   │   ├── search_service.py
│   │   │   └── analytics_service.py
│   │   ├── db/
│   │   │   ├── connection.py
│   │   │   └── queries.py
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   ├── tasks.py
│   │   │   ├── documents.py
│   │   │   ├── search.py
│   │   │   └── analytics.py
│   │   └── utils/
│   │       ├── jwt_utils.py
│   │       ├── password.py
│   │       └── activity.py
│   ├── migrations/
│   │   └── 001_init.sql
│   ├── data/              # gitignored — FAISS index + uploaded files
│   ├── requirements.txt
│   ├── .env.example
│   └── .env               # gitignored
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── README.md
└── .gitignore
```

---

## Required API Endpoints

All endpoints prefixed under the backend root (no `/api` prefix per spec).

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/auth/login` | Public | Returns JWT + role |
| GET | `/tasks` | User/Admin | List tasks (filterable: `?status=`, `?assigned_to=`) |
| POST | `/tasks` | Admin | Create + assign task |
| PATCH | `/tasks/{id}` | User/Admin | Update status |
| POST | `/documents` | Admin | Upload `.txt`, generate embedding |
| GET | `/documents` | User/Admin | List documents |
| GET | `/documents/{id}` | User/Admin | Get document content |
| POST | `/search` | User/Admin | Semantic search |
| GET | `/analytics` | Admin | Task counts + top queries |

---

## Submission Requirements

- Public **GitHub repository**.
- **README** with: setup steps, tech stack, short explanation of the AI approach, demo credentials.
- Repo must clone-and-run from a fresh machine following only the README.
