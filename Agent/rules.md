# Project Rules — Future Transformation Assignment

These rules apply to every agent session on this project. Re-read them before each stage.

---

## Code Conventions

### Python (Backend)
- Python 3.11 required.
- Follow PEP 8. Use 4-space indentation.
- Use **type hints** on all function signatures (`def foo(x: int) -> str:`).
- Use **Pydantic v2** models for all request/response shapes.
- Use **snake_case** for variables, functions, modules. **PascalCase** for classes.
- Each file has a single responsibility (router, service, schema, etc.).

### JavaScript/TypeScript (Frontend)
- React 18 with **Vite**.
- Use **TypeScript** (`.tsx`/`.ts`), strict mode on.
- Use **camelCase** for variables/functions, **PascalCase** for components.
- Functional components with hooks only. No class components.
- Use **Tailwind CSS** utility classes — no separate `.css` files unless absolutely needed.

### Naming
- Endpoints: kebab-case in routes (`/auth/login`), snake_case in JSON keys (`access_token`).
- DB tables: plural snake_case (`users`, `activity_logs`).
- DB columns: snake_case.
- React pages: PascalCase (`Tasks.tsx`).

---

## Architecture Rules

- **Three-layer backend**: `routers/` → `services/` → `db/queries.py`.
  Routers are thin (parse, call service, return). Services hold business logic. Queries hold raw parameterized SQL.
- **SQLAlchemy Core only** — never the ORM. All DB access uses `connection.execute(text(SQL), {params})`.
- **JWT auth** on every endpoint except `/auth/login`.
- **RBAC** enforced via the `require_admin` FastAPI dependency, not by checking roles inside route bodies.
- **Activity logging** is called from the service layer (not middleware) so payloads can be action-specific.
- **Frontend → backend** communication only via the axios client in `src/api/client.ts` — never `fetch()` scattered in components.
- **JWT** is stored in `localStorage` under key `access_token`. Decoded role is in `AuthContext`.

---

## Do NOT

- ❌ **Do NOT use SQLAlchemy ORM**. Raw parameterized SQL only via Core.
- ❌ **Do NOT call any external LLM API** (OpenAI, Groq, Gemini, Anthropic) for search. The brief explicitly forbids relying only on LLM APIs. Embeddings are 100% local via sentence-transformers.
- ❌ **Do NOT add features outside this stage's scope.** If you spot a bug from a prior stage, log it in `progress.md` and continue.
- ❌ **Do NOT use string concatenation or f-strings in SQL.** Always use bound parameters to prevent SQL injection.
- ❌ **Do NOT store passwords in plaintext.** Use `passlib[bcrypt]` for hashing.
- ❌ **Do NOT commit `.env`, `data/`, `node_modules/`, `__pycache__/`, or the FAISS index file to git.**
- ❌ **Do NOT use PostgreSQL.** Assignment mandates MySQL.
- ❌ **Do NOT install heavy UI libraries** (MUI, Ant Design, Chakra). Tailwind + plain JSX only.
- ❌ **Do NOT add PDF parsing.** Spec marks it optional; `.txt` only ships in this build.

---

## Dependencies Policy

### Backend (pinned in `backend/requirements.txt`)
```
fastapi==0.115.0
uvicorn[standard]==0.32.0
sqlalchemy==2.0.36
pymysql==1.1.1
cryptography==43.0.3
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.12
pydantic==2.9.2
pydantic-settings==2.6.1
python-dotenv==1.0.1
sentence-transformers==3.2.1
faiss-cpu==1.9.0
numpy==1.26.4
```

### Frontend (pinned in `frontend/package.json`)
- `react@18`, `react-dom@18`, `react-router-dom@6`
- `axios@1`
- `tailwindcss@3`, `postcss`, `autoprefixer`
- Dev: `vite@5`, `typescript@5`, `@vitejs/plugin-react`

Do not add other dependencies without a clear justification.

---

## Testing Rules

- No formal test suite required (2-day scope), but:
- Every stage must end with a **manual smoke test** verifying its acceptance criteria.
- Test commands and expected outputs go in `progress.md` under that stage's entry.

---

## Git Hygiene

- Commit at the **end of each stage** with message format: `stage N: <name>`.
- Final stage pushes to a **public GitHub repository**.
- `.gitignore` must exclude: `.env`, `data/`, `__pycache__/`, `*.pyc`, `node_modules/`, `dist/`, `.faiss`, `*.index`.

---

## Deadline Awareness

**Submission deadline: Saturday, June 6, 2026 — 12:00 PM IST.**

If a stage runs significantly over budget, descope rather than skip stages. A working narrow MVP beats a broken broad one.


## Git Commit Rules
- NEVER add "Co-authored-by: Claude" or any AI attribution in commit messages
- NEVER add any co-author trailer lines to commits
- Commit messages must contain only: type(scope): description
- No references to Claude, AI, or Anthropic in any commit message, file header, or comment