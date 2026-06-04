from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db.connection import engine
from app.routers import analytics, auth, documents, search, tasks
from app.services import search_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
    Path(settings.faiss_index_path).parent.mkdir(parents=True, exist_ok=True)

    with engine.connect() as conn:
        with conn.begin():
            search_service.init_ai(conn)

    yield


app = FastAPI(title="FTMS", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(documents.router)
app.include_router(search.router)
app.include_router(analytics.router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
