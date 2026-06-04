import { api } from "./client";

export interface Document {
  id: number;
  title: string;
  filename: string;
  uploaded_at: string;
  uploaded_by: number;
}

export interface DocumentDetail extends Document {
  content_text: string;
}

export async function listDocuments(): Promise<Document[]> {
  const res = await api.get<Document[]>("/documents");
  return res.data;
}

export async function uploadDocument(
  file: File,
  title?: string
): Promise<Document> {
  const form = new FormData();
  form.append("file", file);
  if (title) form.append("title", title);
  const res = await api.post<Document>("/documents", form);
  return res.data;
}

export async function getDocument(id: number): Promise<DocumentDetail> {
  const res = await api.get<DocumentDetail>(`/documents/${id}`);
  return res.data;
}
