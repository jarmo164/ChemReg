const AUTH_SESSION_KEY = "chemreg_auth_session";

export type AuthUser = {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: string;
  status: string;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  accessTokenExpiresAt: string;
  user: AuthUser;
};

function readSession(): AuthSession | null {
  const raw = localStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    localStorage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
}

export function getAuthSession(): AuthSession | null {
  return readSession();
}

export function setAuthSession(session: AuthSession) {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export function updateAuthTokens(tokens: Pick<AuthSession, "accessToken" | "refreshToken" | "tokenType" | "accessTokenExpiresAt">) {
  const current = readSession();
  if (!current) {
    return;
  }

  setAuthSession({
    ...current,
    ...tokens,
  });
}

export function getAuthToken(): string | null {
  return readSession()?.accessToken ?? null;
}

export function getRefreshToken(): string | null {
  return readSession()?.refreshToken ?? null;
}

export function getTokenType(): string {
  return readSession()?.tokenType ?? "Bearer";
}

export function isAccessTokenExpired(skewSeconds = 30): boolean {
  const expiresAt = readSession()?.accessTokenExpiresAt;
  if (!expiresAt) {
    return true;
  }

  const expiresAtMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expiresAtMs)) {
    return true;
  }

  return Date.now() >= expiresAtMs - skewSeconds * 1000;
}

export function isAuthenticated(): boolean {
  const session = readSession();
  return Boolean(session?.accessToken || session?.refreshToken);
}

export function getAuthUser(): AuthUser | null {
  return readSession()?.user ?? null;
}

export function setAuthUser(user: AuthUser) {
  const current = readSession();
  if (!current) return;

  setAuthSession({
    ...current,
    user,
  });
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_SESSION_KEY);
}

export function logout() {
  clearAuthSession();
}
