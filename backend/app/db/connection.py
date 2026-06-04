from typing import Generator

from sqlalchemy import create_engine, Connection

from app.config import settings

_url = (
    f"mysql+pymysql://{settings.mysql_user}:{settings.mysql_password}"
    f"@{settings.mysql_host}:{settings.mysql_port}/{settings.mysql_db}"
    f"?charset=utf8mb4"
)

engine = create_engine(_url, connect_args={"connect_timeout": 5})


def get_conn() -> Generator[Connection, None, None]:
    with engine.connect() as conn:
        yield conn
