// API Configuration - default tenant uuid for mvp purposes
export const DEFAULT_TENANT_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

if (!process.env.REACT_APP_API_URL) {
  throw new Error("REACT_APP_API_URL is not defined");
}

export const API_BASE_URL = process.env.REACT_APP_API_URL;