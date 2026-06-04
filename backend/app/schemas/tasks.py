from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    assigned_to: int


class TaskUpdate(BaseModel):
    status: Literal["completed"]


class TaskOut(BaseModel):
    id: int
    title: str
    description: str | None
    status: str
    assigned_to: int
    created_by: int
    created_at: datetime
    updated_at: datetime | None
