import { api } from "./client";

export interface TopQuery {
  query: string;
  count: number;
}

export interface AnalyticsData {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  top_search_queries: TopQuery[];
}

export async function getAnalytics(): Promise<AnalyticsData> {
  const res = await api.get<AnalyticsData>("/analytics");
  return res.data;
}
