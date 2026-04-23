import { apiDelete, apiGet, apiPost, apiPut } from './apiClient';

export type ChemicalSignalWord = 'Danger' | 'Warning';
export type PhysicalState = 'solid' | 'liquid' | 'gas' | 'aerosol';

export interface ChemicalProduct {
  id: string;
  tenantId: string;
  sdsDocumentId: string | null;
  name: string;
  casNumber: string | null;
  ecNumber: string | null;
  signalWord: ChemicalSignalWord | null;
  physicalState: PhysicalState | null;
  restricted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaveChemicalProductRequest {
  name: string;
  casNumber?: string | null;
  ecNumber?: string | null;
  signalWord?: ChemicalSignalWord | null;
  physicalState?: PhysicalState | null;
  restricted?: boolean;
}

export function listChemicalProducts(): Promise<ChemicalProduct[]> {
  return apiGet<ChemicalProduct[]>('/api/chemical-products');
}

export function createChemicalProduct(payload: SaveChemicalProductRequest): Promise<ChemicalProduct> {
  return apiPost<ChemicalProduct>('/api/chemical-products', payload);
}

export function updateChemicalProduct(id: string, payload: SaveChemicalProductRequest): Promise<ChemicalProduct> {
  return apiPut<ChemicalProduct>(`/api/chemical-products/${id}`, payload);
}

export function deleteChemicalProduct(id: string): Promise<void> {
  return apiDelete<void>(`/api/chemical-products/${id}`);
}
