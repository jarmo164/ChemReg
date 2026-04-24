import { clearAuthSession, isAuthenticated, setAuthSession } from './auth/auth';

describe('auth session wiring', () => {
  beforeEach(() => {
    clearAuthSession();
  });

  test('treats missing session as logged out', () => {
    expect(isAuthenticated()).toBe(false);
  });

  test('treats stored token pair as authenticated session', () => {
    setAuthSession({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
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
    });

    expect(isAuthenticated()).toBe(true);
  });
});
