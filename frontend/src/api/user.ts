import { apiPut } from "./apiClient";
import type { AuthUser } from "../auth/auth";

export type UpdateUserRequest = {
  name: string;
  email: string;
};

export function updateUser(id: string, request: UpdateUserRequest): Promise<AuthUser> {
  return apiPut<AuthUser>(`/api/users/${id}`, request);
}