import sys
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile
from sqlalchemy import Connection

from app.config import settings
from app.db.queries import DocumentQueries
from app.schemas.documents import DocumentDetail, DocumentOut
from app.utils.activity import log_activity

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


async def upload(
    conn: Connection,
    admin: dict,
    file: UploadFile,
    title: str | None,
) -> DocumentOut:
    if not file.filename or not file.filename.lower().endswith(".txt"):
        raise HTTPException(status_code=400, detail="Only .txt files are allowed")

    data = await file.read()

    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File exceeds 5 MB limit")

    content_text = data.decode("utf-8", errors="replace")

    storage_filename = f"{uuid4().hex}.txt"
    storage_path = Path(settings.upload_dir) / storage_filename
    storage_path.write_bytes(data)

    doc_title = title if title else Path(file.filename).stem

    result = conn.execute(
        DocumentQueries.INSERT,
        {
            "title": doc_title,
            "filename": file.filename,
            "storage_path": storage_filename,
            "content_text": content_text,
            "uploaded_by": admin["user_id"],
        },
    )
    conn.commit()

    new_id = result.lastrowid

    try:
        from app.services import search_service
        search_service.add_document_embedding(conn, new_id, content_text)
    except Exception as exc:
        print(f"Embedding generation failed for doc {new_id}: {exc}", file=sys.stderr)

    log_activity(conn, admin["user_id"], "document_upload", {
        "document_id": new_id,
        "filename": file.filename,
    })

    row = conn.execute(DocumentQueries.GET_BY_ID, {"id": new_id}).mappings().first()
    return DocumentOut(**row)


def list_documents(conn: Connection) -> list[DocumentOut]:
    rows = conn.execute(DocumentQueries.LIST).mappings().all()
    return [DocumentOut(**row) for row in rows]


def get_document(conn: Connection, doc_id: int) -> DocumentDetail:
    row = conn.execute(DocumentQueries.GET_BY_ID, {"id": doc_id}).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocumentDetail(**row)
