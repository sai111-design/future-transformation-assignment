from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy import Connection

from app.db.connection import get_conn
from app.deps import get_current_user, require_admin
from app.schemas.documents import DocumentDetail, DocumentOut
from app.services import document_service

router = APIRouter(tags=["documents"])


@router.post("/documents", response_model=DocumentOut, status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    title: str | None = Form(None),
    admin: dict = Depends(require_admin),
    conn: Connection = Depends(get_conn),
) -> DocumentOut:
    return await document_service.upload(conn, admin, file, title)


@router.get("/documents", response_model=list[DocumentOut])
def list_documents(
    user: dict = Depends(get_current_user),
    conn: Connection = Depends(get_conn),
) -> list[DocumentOut]:
    return document_service.list_documents(conn)


@router.get("/documents/{doc_id}", response_model=DocumentDetail)
def get_document(
    doc_id: int,
    user: dict = Depends(get_current_user),
    conn: Connection = Depends(get_conn),
) -> DocumentDetail:
    return document_service.get_document(conn, doc_id)
