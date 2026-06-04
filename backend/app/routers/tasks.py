from fastapi import APIRouter, Depends
from sqlalchemy import Connection

from app.db.connection import get_conn
from app.deps import get_current_user, require_admin
from app.schemas.tasks import TaskCreate, TaskOut, TaskUpdate
from app.services import task_service

router = APIRouter(tags=["tasks"])


@router.get("/tasks", response_model=list[TaskOut])
def list_tasks(
    status: str | None = None,
    assigned_to: int | None = None,
    user: dict = Depends(get_current_user),
    conn: Connection = Depends(get_conn),
) -> list[TaskOut]:
    return task_service.list_tasks(conn, user, status, assigned_to)


@router.post("/tasks", response_model=TaskOut, status_code=201)
def create_task(
    body: TaskCreate,
    admin: dict = Depends(require_admin),
    conn: Connection = Depends(get_conn),
) -> TaskOut:
    return task_service.create_task(conn, admin, body)


@router.patch("/tasks/{task_id}", response_model=TaskOut)
def update_task(
    task_id: int,
    body: TaskUpdate,
    user: dict = Depends(get_current_user),
    conn: Connection = Depends(get_conn),
) -> TaskOut:
    return task_service.update_status(conn, user, task_id, body)
