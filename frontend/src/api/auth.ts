import { apiPost } from './apiClient';
import { DEFAULT_TENANT_ID } from './config';

export interface UserResponse {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  authenticated: boolean;
  message: string;
  loggedInAt: string;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  accessTokenExpiresAt: string;
  user: UserResponse;
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiPost<LoginResponse>('/api/auth/login', {
    tenantId: DEFAULT_TENANT_ID,
    email,
    password,
  });
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  accessTokenExpiresAt: string;
}

export function register(name: string, email: string, password: string): Promise<UserResponse> {
  return apiPost<UserResponse>('/api/users/register', {
    tenantId: DEFAULT_TENANT_ID,
    name,
    email,
    password,
    role: 'user',
  });
}