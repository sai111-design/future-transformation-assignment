import json
import sys

from sqlalchemy import Connection, text


def log_activity(conn: Connection, user_id: int, action: str, payload: dict | None = None) -> None:
    try:
        conn.execute(
            text("""
                INSERT INTO activity_logs (user_id, action, payload)
                VALUES (:uid, :action, :payload)
            """),
            {
                "uid": user_id,
                "action": action,
                "payload": json.dumps(payload) if payload else None,
            },
        )
        conn.commit()
    except Exception as exc:
        print(f"Activity logging failed: {exc}", file=sys.stderr)
