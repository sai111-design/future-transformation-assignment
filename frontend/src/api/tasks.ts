import { api } from "./client";

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  assigned_to: number;
  created_by: number;
  created_at: string;
  updated_at: string | null;
}

export async function listTasks(filters?: {
  status?: string;
  assigned_to?: number;
}): Promise<Task[]> {
  const params: Record<string, string | number> = {};
  if (filters?.status) params.status = filters.status;
  if (filters?.assigned_to) params.assigned_to = filters.assigned_to;
  const res = await api.get<Task[]>("/tasks", { params });
  return res.data;
}

export async function createTask(body: {
  title: string;
  description?: string;
  assigned_to: number;
}): Promise<Task> {
  const res = await api.post<Task>("/tasks", body);
  return res.data;
}

export async function updateTaskStatus(
  id: number,
  status: string
): Promise<Task> {
  const res = await api.patch<Task>(`/tasks/${id}`, { status });
  return res.data;
}
