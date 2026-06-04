import sys
from pathlib import Path

import faiss
import numpy as np
from sqlalchemy import Connection, text

from app.config import settings
from app.utils.activity import log_activity

_model = None
_index: faiss.IndexFlatL2 | None = None
DIM = 384


def init_ai(conn: Connection) -> None:
    global _model, _index
    from sentence_transformers import SentenceTransformer

    _model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

    index_path = Path(settings.faiss_index_path)
    if index_path.exists():
        _index = faiss.read_index(str(index_path))
    else:
        _index = faiss.IndexFlatL2(DIM)
        conn.execute(text("UPDATE documents SET vector_id = NULL"))
        rows = conn.execute(
            text("SELECT id, content_text FROM documents ORDER BY id")
        ).mappings().all()
        for row in rows:
            vec = _model.encode([row["content_text"]]).astype("float32")
            _index.add(vec)
            new_vid = _index.ntotal - 1
            conn.execute(
                text("UPDATE documents SET vector_id = :vid WHERE id = :id"),
                {"vid": new_vid, "id": row["id"]},
            )
        index_path.parent.mkdir(parents=True, exist_ok=True)
        faiss.write_index(_index, str(index_path))


def add_document_embedding(conn: Connection, doc_id: int, text_content: str) -> int:
    global _index
    if _model is None or _index is None:
        raise RuntimeError("AI not initialized")

    vec = _model.encode([text_content]).astype("float32")
    _index.add(vec)
    new_vid = _index.ntotal - 1
    conn.execute(
        text("UPDATE documents SET vector_id = :vid WHERE id = :id"),
        {"vid": new_vid, "id": doc_id},
    )
    conn.commit()
    faiss.write_index(_index, settings.faiss_index_path)
    return new_vid


def semantic_search(
    conn: Connection, user: dict, query: str, top_k: int = 5
) -> list[dict]:
    if _model is None or _index is None:
        return []

    qvec = _model.encode([query]).astype("float32")

    actual_k = min(top_k, _index.ntotal)
    if actual_k == 0:
        return []

    distances, ids = _index.search(qvec, actual_k)
    vector_ids = [int(v) for v in ids[0] if v != -1]
    if not vector_ids:
        return []

    placeholders = ",".join([f":v{i}" for i in range(len(vector_ids))])
    sql = text(
        f"SELECT id, title, content_text, vector_id "
        f"FROM documents WHERE vector_id IN ({placeholders})"
    )
    params = {f"v{i}": v for i, v in enumerate(vector_ids)}
    rows = conn.execute(sql, params).mappings().all()

    row_by_vid = {r["vector_id"]: r for r in rows}
    results = []
    for vid, dist in zip(ids[0], distances[0]):
        vid_int = int(vid)
        if vid_int in row_by_vid:
            r = row_by_vid[vid_int]
            results.append({
                "document_id": r["id"],
                "title": r["title"],
                "snippet": (r["content_text"] or "")[:280],
                "score": float(dist),
            })

    log_activity(conn, user["user_id"], "search", {"query": query, "top_k": top_k})

    return results
