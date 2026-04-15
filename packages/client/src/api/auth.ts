import type { User } from "@family-tree/shared";
import { api } from "./client.js";

export async function loginRequest(params: {
  login: string;
  password: string;
  remember: boolean;
}): Promise<{ token: string; user: User }> {
  return api.post("/api/auth/login", { json: params }).json();
}

export async function fetchCurrentUser(): Promise<User> {
  const { user } = await api.get("/api/auth/me").json<{ user: User }>();
  return user;
}
