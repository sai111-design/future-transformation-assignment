from datetime import datetime

from pydantic import BaseModel


class DocumentOut(BaseModel):
    id: int
    title: str
    filename: str
    uploaded_at: datetime
    uploaded_by: int


class DocumentDetail(BaseModel):
    id: int
    title: str
    filename: str
    content_text: str
    uploaded_at: datetime
    uploaded_by: int
