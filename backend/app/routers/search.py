from fastapi import APIRouter, Depends
from sqlalchemy import Connection

from app.db.connection import get_conn
from app.deps import get_current_user
from app.schemas.search import SearchRequest, SearchResponse
from app.services import search_service

router = APIRouter(tags=["search"])


@router.post("/search", response_model=SearchResponse)
def search(
    body: SearchRequest,
    user: dict = Depends(get_current_user),
    conn: Connection = Depends(get_conn),
) -> SearchResponse:
    results = search_service.semantic_search(conn, user, body.query, body.top_k)
    return SearchResponse(results=results)
