import { api } from "./client";

interface LoginResponse {
  access_token: string;
  token_type: string;
  role: string;
  user_id: number;
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/auth/login", { email, password });
  return res.data;
}
