import { API_BASE_URL } from './config';
import {
  clearAuthSession,
  getAuthToken,
  getRefreshToken,
  getTokenType,
  isAccessTokenExpired,
  updateAuthTokens,
} from '../auth/auth';
import type { TokenRefreshResponse } from './auth';
import { toApiError, toNetworkError } from './errors';

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

function serializeUrl(params: object): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      result[key] = String(value);
    }
  }
  return result;
}

async function handleErrors(response: Response): Promise<never> {
  throw await toApiError(response);
}

function buildHeaders(includeJsonContentType = true): HeadersInit {
  const headers: Record<string, string> = {
    'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') || '',
  };

  if (includeJsonContentType) {
    headers['Content-Type'] = 'application/json;charset=UTF-8';
  }

  const accessToken = getAuthToken();
  if (accessToken) {
    headers.Authorization = `${getTokenType()} ${accessToken}`;
  }

  return headers;
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearAuthSession();
    return false;
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: buildHeaders(),
      credentials: 'include',
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    clearAuthSession();
    return false;
  }

  if (!response.ok) {
    clearAuthSession();
    return false;
  }

  const payload = (await response.json()) as TokenRefreshResponse;
  updateAuthTokens({
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    tokenType: payload.tokenType,
    accessTokenExpiresAt: payload.accessTokenExpiresAt,
  });

  return true;
}

async function maybeRefreshBeforeRequest(appendUrl: string): Promise<void> {
  if (appendUrl.startsWith('/api/auth/login') || appendUrl.startsWith('/api/auth/refresh')) {
    return;
  }

  const hasRefreshToken = Boolean(getRefreshToken());
  const hasAccessToken = Boolean(getAuthToken());

  if (!hasRefreshToken || !hasAccessToken) {
    return;
  }

  if (isAccessTokenExpired()) {
    await refreshAccessToken();
  }
}

async function request<T>(
  method: string,
  appendUrl: string,
  dto?: any,
  urlParams?: object,
  retryOnUnauthorized = true
): Promise<T> {
  let url = API_BASE_URL + appendUrl;

  if (urlParams) {
    url += '?' + new URLSearchParams(serializeUrl(urlParams)).toString();
  }

  await maybeRefreshBeforeRequest(appendUrl);

  const requestParams: RequestInit = {
    method,
    headers: buildHeaders(),
    credentials: 'include',
  };

  if (dto && method !== 'GET') {
    requestParams.body = JSON.stringify(dto);
  }

  try {
    let response = await fetch(url, requestParams);

    if (response.status === 401 && retryOnUnauthorized && !appendUrl.startsWith('/api/auth/')) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        response = await fetch(url, {
          ...requestParams,
          headers: buildHeaders(),
        });
      }
    }

    if (!response.ok) {
      await handleErrors(response);
    }

    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    return JSON.parse(text) as T;
  } catch (error) {
    throw toNetworkError(error);
  }
}

export function apiGet<T>(appendUrl: string, urlParams?: object): Promise<T> {
  return request<T>('GET', appendUrl, undefined, urlParams);
}

export function apiPost<T>(appendUrl: string, dto?: any, urlParams?: object): Promise<T> {
  return request<T>('POST', appendUrl, dto, urlParams);
}

export function apiPut<T>(appendUrl: string, dto?: any, urlParams?: object): Promise<T> {
  return request<T>('PUT', appendUrl, dto, urlParams);
}

export function apiPatch<T>(appendUrl: string, dto?: any, urlParams?: object): Promise<T> {
  return request<T>('PATCH', appendUrl, dto, urlParams);
}

export function apiDelete<T>(appendUrl: string, urlParams?: object): Promise<T> {
  return request<T>('DELETE', appendUrl, undefined, urlParams);
}
