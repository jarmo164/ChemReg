import { clearAuthSession, getAuthSession, setAuthSession } from '../auth/auth';

const originalFetch = global.fetch;

async function loadApiClient() {
  process.env.REACT_APP_API_URL = 'http://localhost:8080';
  jest.resetModules();
  return import('./apiClient');
}

describe('api client token refresh handling', () => {
  beforeEach(() => {
    clearAuthSession();
    document.cookie = 'XSRF-TOKEN=test-xsrf-token';
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('refreshes an expired access token before the request and stores new tokens', async () => {
    const { apiGet } = await loadApiClient();
    setAuthSession({
      accessToken: 'expired-access',
      refreshToken: 'refresh-token',
      tokenType: 'Bearer',
      accessTokenExpiresAt: '2000-01-01T00:00:00.000Z',
      user: {
        id: 'user-1',
        tenantId: 'tenant-1',
        email: 'chemist@example.com',
        name: 'Chem Reg',
        role: 'ORG_ADMIN',
        status: 'active',
      },
    });

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          accessToken: 'fresh-access',
          refreshToken: 'fresh-refresh',
          tokenType: 'Bearer',
          accessTokenExpiresAt: '2099-01-01T00:00:00.000Z',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify([{ id: 'doc-1' }]),
      });

    const result = await apiGet('/api/sds-documents');

    expect(result).toEqual([{ id: 'doc-1' }]);
    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      'http://localhost:8080/api/auth/refresh',
      expect.objectContaining({ method: 'POST' })
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      'http://localhost:8080/api/sds-documents',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer fresh-access',
          'X-XSRF-TOKEN': 'test-xsrf-token',
        }),
      })
    );

    expect(getAuthSession()).toEqual(
      expect.objectContaining({
        accessToken: 'fresh-access',
        refreshToken: 'fresh-refresh',
      })
    );
  });

  it('clears the auth session when refresh fails after a 401', async () => {
    const { apiGet } = await loadApiClient();
    setAuthSession({
      accessToken: 'still-bad',
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

    global.fetch
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'expired' }),
        text: async () => JSON.stringify({ message: 'expired' }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'refresh failed' }),
      });

    await expect(apiGet('/api/sds-documents')).rejects.toMatchObject({
      message: 'expired',
      status: 401,
    });
    expect(getAuthSession()).toBeNull();
  });
});
