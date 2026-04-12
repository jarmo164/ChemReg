// API Configuration - default tenant uuid for mvp purposes
export const DEFAULT_TENANT_ID =  '11111111-1111-1111-1111-111111111111';

if (!process.env.REACT_APP_API_URL) {
  throw new Error("REACT_APP_API_URL is not defined");
}

export const API_BASE_URL = process.env.REACT_APP_API_URL;