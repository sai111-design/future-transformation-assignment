from fastapi import HTTPException
from sqlalchemy import Connection

from app.db.queries import AuthQueries
from app.schemas.auth import LoginResponse
from app.utils.activity import log_activity
from app.utils.jwt_utils import create_access_token
from app.utils.password import verify_password


def login(email: str, password: str, conn: Connection) -> LoginResponse:
    row = conn.execute(AuthQueries.GET_USER_BY_EMAIL, {"email": email}).mappings().first()

    if not row:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(row["id"], row["role"])
    log_activity(conn, row["id"], "login")

    return LoginResponse(
        access_token=token,
        role=row["role"],
        user_id=row["id"],
    )
