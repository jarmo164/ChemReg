import { apiGet, apiPost, apiPut } from './apiClient';

export type LocationType = 'building' | 'floor' | 'room' | 'cabinet' | 'shelf';

export interface Site {
  id: string;
  tenantId: string;
  name: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  siteId: string;
  parentId: string | null;
  name: string;
  type: LocationType;
  createdAt: string;
  updatedAt: string;
}

export interface SaveSiteRequest {
  name: string;
  timezone: string;
}

export interface SaveLocationRequest {
  name: string;
  type: LocationType;
  parentId?: string | null;
}

export function listSites(): Promise<Site[]> {
  return apiGet<Site[]>('/api/sites');
}

export function createSite(payload: SaveSiteRequest): Promise<Site> {
  return apiPost<Site>('/api/sites', payload);
}

export function updateSite(id: string, payload: SaveSiteRequest): Promise<Site> {
  return apiPut<Site>(`/api/sites/${id}`, payload);
}

export function listLocations(siteId: string): Promise<Location[]> {
  return apiGet<Location[]>(`/api/sites/${siteId}/locations`);
}

export function createLocation(siteId: string, payload: SaveLocationRequest): Promise<Location> {
  return apiPost<Location>(`/api/sites/${siteId}/locations`, payload);
}

export function updateLocation(siteId: string, id: string, payload: SaveLocationRequest): Promise<Location> {
  return apiPut<Location>(`/api/sites/${siteId}/locations/${id}`, payload);
}
