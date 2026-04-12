import { API_BASE_URL, DEFAULT_TENANT_ID } from './config';

export interface LoginRequest {
  tenantId: string;
  email: string;
  password: string;
}

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
  user: UserResponse;
}

export interface CreateUserRequest {
  tenantId: string;
  name: string;
  email: string;
  password: string;
  role: string;
  status?: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tenantId: DEFAULT_TENANT_ID,
      email,
      password,
    } as LoginRequest),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      message: errorData.message || 'Login failed',
      status: response.status,
    } as ApiError;
  }

  return response.json();
}

export async function register(name: string, email: string, password: string): Promise<UserResponse> {
  const response = await fetch(`${API_BASE_URL}/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tenantId: DEFAULT_TENANT_ID,
      name,
      email,
      password,
      role: 'user', // Default role for self-registration
    } as CreateUserRequest),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      message: errorData.message || 'Registration failed',
      status: response.status,
    } as ApiError;
  }

  return response.json();
}