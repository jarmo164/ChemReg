// API Configuration - default tenant uuid for mvp purposes
export const DEFAULT_TENANT_ID = '11111111-1111-1111-1111-111111111111';

function resolveApiBaseUrl() {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:8080`;
  }

  return 'http://localhost:8080';
}

export const API_BASE_URL = resolveApiBaseUrl();