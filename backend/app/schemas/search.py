from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    query: str
    top_k: int = Field(default=5, ge=1, le=20)


class SearchResult(BaseModel):
    document_id: int
    title: str
    snippet: str
    score: float


class SearchResponse(BaseModel):
    results: list[SearchResult]
