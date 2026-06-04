from fastapi import APIRouter, Depends
from sqlalchemy import Connection

from app.db.connection import get_conn
from app.deps import require_admin
from app.schemas.analytics import AnalyticsResponse
from app.services import analytics_service

router = APIRouter(tags=["analytics"])


@router.get("/analytics", response_model=AnalyticsResponse)
def analytics(
    admin: dict = Depends(require_admin),
    conn: Connection = Depends(get_conn),
) -> AnalyticsResponse:
    return analytics_service.get_analytics(conn)
