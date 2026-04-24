import {
  clearAuthSession,
  getAuthSession,
  getAuthToken,
  getAuthUser,
  getRefreshToken,
  getTokenType,
  isAccessTokenExpired,
  setAuthSession,
  setAuthUser,
  updateAuthTokens,
} from './auth';

describe('auth session helpers', () => {
  const baseSession = {
    accessToken: 'access-1',
    refreshToken: 'refresh-1',
    tokenType: 'Bearer',
    accessTokenExpiresAt: '2099-01-01T00:00:00.000Z',
    user: {
      id: 'user-1',
      tenantId: 'tenant-1',
      email: 'chemist@example.com',
      name: 'Chem Reg',
      role: 'ORG_ADMIN',
      status: 'active',
    },
  };

  beforeEach(() => {
    clearAuthSession();
    jest.useRealTimers();
  });

  it('persists and returns the auth session', () => {
    setAuthSession(baseSession);

    expect(getAuthSession()).toEqual(baseSession);
    expect(getAuthToken()).toBe('access-1');
    expect(getRefreshToken()).toBe('refresh-1');
    expect(getTokenType()).toBe('Bearer');
    expect(getAuthUser()).toEqual(baseSession.user);
  });

  it('updates only the token fields', () => {
    setAuthSession(baseSession);

    updateAuthTokens({
      accessToken: 'access-2',
      refreshToken: 'refresh-2',
      tokenType: 'Token',
      accessTokenExpiresAt: '2099-02-01T00:00:00.000Z',
    });

    expect(getAuthSession()).toEqual({
      ...baseSession,
      accessToken: 'access-2',
      refreshToken: 'refresh-2',
      tokenType: 'Token',
      accessTokenExpiresAt: '2099-02-01T00:00:00.000Z',
    });
  });

  it('updates the stored user without losing tokens', () => {
    setAuthSession(baseSession);

    setAuthUser({
      ...baseSession.user,
      name: 'Updated User',
      role: 'EHS_MANAGER',
    });

    expect(getAuthSession()).toEqual({
      ...baseSession,
      user: {
        ...baseSession.user,
        name: 'Updated User',
        role: 'EHS_MANAGER',
      },
    });
  });

  it('expires when the timestamp is invalid or already past skew', () => {
    setAuthSession({
      ...baseSession,
      accessTokenExpiresAt: 'not-a-date',
    });
    expect(isAccessTokenExpired()).toBe(true);

    setAuthSession({
      ...baseSession,
      accessTokenExpiresAt: '2026-01-01T00:00:10.000Z',
    });

    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    expect(isAccessTokenExpired(15)).toBe(true);
    expect(isAccessTokenExpired(5)).toBe(false);
  });
});
