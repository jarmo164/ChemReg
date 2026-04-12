import { API_BASE_URL } from './config';

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
  let errorMessage = 'Request failed';

  try {
    const errorData = await response.json();
    errorMessage = errorData.message || errorData.error || errorMessage;
  } catch {
    errorMessage = response.statusText || errorMessage;
  }

  const error = new Error(errorMessage) as Error & { status: number };
  error.status = response.status;
  throw error;
}

async function request<T>(
  method: string,
  appendUrl: string,
  dto?: any,
  urlParams?: object
): Promise<T> {
  let url = API_BASE_URL + appendUrl;

  if (urlParams) {
    url += '?' + new URLSearchParams(serializeUrl(urlParams)).toString();
  }

  const requestParams: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') || '',
    },
    credentials: 'include',
  };

  if (dto && method !== 'GET') {
    requestParams.body = JSON.stringify(dto);
  }

  const response = await fetch(url, requestParams);

  if (!response.ok) {
    await handleErrors(response);
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  return JSON.parse(text) as T;
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
