import { apiDelete, apiGet, apiPost, apiPut } from './apiClient';
import type { InventoryUnit } from './chemicals';

export type InventoryStatus = 'in_stock' | 'reserved' | 'disposed' | 'expired';

export interface InventoryItem {
  id: string;
  tenantId: string;
  productId: string;
  productName: string;
  locationId: string;
  locationName: string;
  quantity: string;
  unit: InventoryUnit;
  containerType: string | null;
  barcode: string | null;
  qrCode: string | null;
  lotNumber: string | null;
  status: InventoryStatus;
  openedAt: string | null;
  expiryDate: string | null;
  minStock: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaveInventoryItemRequest {
  productId: string;
  locationId: string;
  quantity: number;
  unit: InventoryUnit;
  containerType?: string | null;
  barcode?: string | null;
  qrCode?: string | null;
  lotNumber?: string | null;
  status: InventoryStatus;
  openedAt?: string | null;
  expiryDate?: string | null;
  minStock?: number | null;
}

export function listInventoryItems(): Promise<InventoryItem[]> {
  return apiGet<InventoryItem[]>('/api/inventory-items');
}

export function createInventoryItem(payload: SaveInventoryItemRequest): Promise<InventoryItem> {
  return apiPost<InventoryItem>('/api/inventory-items', payload);
}

export function updateInventoryItem(id: string, payload: SaveInventoryItemRequest): Promise<InventoryItem> {
  return apiPut<InventoryItem>(`/api/inventory-items/${id}`, payload);
}

export function deleteInventoryItem(id: string): Promise<void> {
  return apiDelete<void>(`/api/inventory-items/${id}`);
}
