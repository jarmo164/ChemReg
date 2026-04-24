import { apiDelete, apiGet, apiPost, apiPut } from './apiClient';

export type ChemicalSignalWord = 'Danger' | 'Warning';
export type PhysicalState = 'solid' | 'liquid' | 'gas' | 'aerosol';
export type InventoryUnit = 'kg' | 'L' | 'g' | 'mL' | 'pcs';

export interface ChemicalProduct {
  id: string;
  tenantId: string;
  sdsDocumentId: string | null;
  name: string;
  casNumber: string | null;
  ecNumber: string | null;
  productCode: string | null;
  supplierName: string | null;
  signalWord: ChemicalSignalWord | null;
  physicalState: PhysicalState | null;
  defaultUnit: InventoryUnit | null;
  storageClass: string | null;
  useDescription: string | null;
  restricted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaveChemicalProductRequest {
  name: string;
  casNumber?: string | null;
  ecNumber?: string | null;
  productCode?: string | null;
  supplierName?: string | null;
  signalWord?: ChemicalSignalWord | null;
  physicalState?: PhysicalState | null;
  defaultUnit?: InventoryUnit | null;
  storageClass?: string | null;
  useDescription?: string | null;
  restricted?: boolean;
  sdsDocumentId?: string | null;
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
