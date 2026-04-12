const AUTH_TOKEN_KEY = "chemreg_auth_token";
const AUTH_USER_KEY = "chemreg_auth_user";

export type AuthUser = {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: string;
  status: string;
};

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}

export function setAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getAuthUser(): AuthUser | null {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setAuthUser(user: AuthUser) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function clearAuthUser() {
  localStorage.removeItem(AUTH_USER_KEY);
}

export function logout() {
  clearAuthToken();
  clearAuthUser();
}

