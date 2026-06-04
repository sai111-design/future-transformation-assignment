from fastapi import HTTPException
from sqlalchemy import Connection, text

from app.db.queries import TaskQueries
from app.schemas.tasks import TaskCreate, TaskOut, TaskUpdate
from app.utils.activity import log_activity


def list_tasks(
    conn: Connection,
    user: dict,
    status: str | None,
    assigned_to: int | None,
) -> list[TaskOut]:
    conditions = ["1=1"]
    params: dict = {}

    if user["role"] == "user":
        conditions.append("assigned_to = :assigned_to")
        params["assigned_to"] = user["user_id"]
    else:
        if assigned_to is not None:
            conditions.append("assigned_to = :assigned_to")
            params["assigned_to"] = assigned_to

    if status:
        conditions.append("status = :status")
        params["status"] = status

    where = " AND ".join(conditions)
    sql = f"SELECT id, title, description, status, assigned_to, created_by, created_at, updated_at FROM tasks WHERE {where} ORDER BY created_at DESC"
    rows = conn.execute(text(sql), params).mappings().all()
    return [TaskOut(**row) for row in rows]


def create_task(conn: Connection, admin: dict, body: TaskCreate) -> TaskOut:
    target = conn.execute(TaskQueries.GET_USER_BY_ID, {"id": body.assigned_to}).mappings().first()
    if not target:
        raise HTTPException(status_code=400, detail="assigned_to user does not exist")

    result = conn.execute(
        TaskQueries.INSERT,
        {
            "title": body.title,
            "description": body.description,
            "assigned_to": body.assigned_to,
            "created_by": admin["user_id"],
        },
    )
    conn.commit()

    row = conn.execute(TaskQueries.GET_BY_ID, {"id": result.lastrowid}).mappings().first()
    return TaskOut(**row)


def update_status(
    conn: Connection,
    user: dict,
    task_id: int,
    body: TaskUpdate,
) -> TaskOut:
    row = conn.execute(TaskQueries.GET_BY_ID, {"id": task_id}).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Task not found")

    if user["role"] == "user" and row["assigned_to"] != user["user_id"]:
        raise HTTPException(status_code=403, detail="Not your task")

    old_status = row["status"]
    conn.execute(TaskQueries.UPDATE_STATUS, {"status": body.status, "id": task_id})
    conn.commit()

    log_activity(conn, user["user_id"], "task_update", {
        "task_id": task_id,
        "from_status": old_status,
        "to_status": body.status,
    })

    updated = conn.execute(TaskQueries.GET_BY_ID, {"id": task_id}).mappings().first()
    return TaskOut(**updated)
