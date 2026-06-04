from pydantic import BaseModel


class TopQuery(BaseModel):
    query: str
    count: int


class AnalyticsResponse(BaseModel):
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    top_search_queries: list[TopQuery]
