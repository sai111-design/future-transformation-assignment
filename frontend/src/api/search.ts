import { api } from "./client";

export interface SearchResult {
  document_id: number;
  title: string;
  snippet: string;
  score: number;
}

export async function search(
  query: string,
  topK: number = 5
): Promise<SearchResult[]> {
  const res = await api.post<{ results: SearchResult[] }>("/search", {
    query,
    top_k: topK,
  });
  return res.data.results;
}
