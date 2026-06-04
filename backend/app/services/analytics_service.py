from sqlalchemy import Connection, text


def get_analytics(conn: Connection) -> dict:
    counts = conn.execute(
        text("SELECT status, COUNT(*) AS c FROM tasks GROUP BY status")
    ).mappings().all()

    status_map = {r["status"]: r["c"] for r in counts}
    completed = status_map.get("completed", 0)
    pending = status_map.get("pending", 0)

    top = conn.execute(
        text("""
            SELECT JSON_UNQUOTE(JSON_EXTRACT(payload, '$.query')) AS q,
                   COUNT(*) AS c
            FROM activity_logs
            WHERE action = 'search'
              AND created_at >= NOW() - INTERVAL 30 DAY
              AND JSON_EXTRACT(payload, '$.query') IS NOT NULL
            GROUP BY q
            ORDER BY c DESC
            LIMIT 5
        """)
    ).mappings().all()

    return {
        "total_tasks": completed + pending,
        "completed_tasks": completed,
        "pending_tasks": pending,
        "top_search_queries": [{"query": r["q"], "count": r["c"]} for r in top],
    }
