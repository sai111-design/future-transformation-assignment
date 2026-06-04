from fastapi import APIRouter, Depends
from sqlalchemy import Connection

from app.db.connection import get_conn
from app.schemas.auth import LoginRequest, LoginResponse
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest, conn: Connection = Depends(get_conn)) -> LoginResponse:
    return auth_service.login(body.email, body.password, conn)
