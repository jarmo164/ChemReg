import { apiGet, apiPost, apiPut } from './apiClient';

export type BackendSdsStatus = 'active' | 'pending_review' | 'archived';

export interface SdsSection {
  id: string;
  sectionNumber: number;
  title: string;
  content: string;
  createdAt: string;
}

export interface SdsDocument {
  id: string;
  tenantId: string;
  productName: string;
  supplierNameRaw: string | null;
  language: string;
  countryFormat: string;
  revisionDate: string | null;
  expiryDate: string | null;
  status: BackendSdsStatus;
  supplierIds: string[];
  sections: SdsSection[];
  createdAt: string;
  updatedAt: string;
}

export interface SaveSdsDocumentRequest {
  document: {
    productName: string;
    supplierNameRaw: string | null;
    language: string;
    countryFormat: string;
    revisionDate: string | null;
    expiryDate: string | null;
    status: BackendSdsStatus;
  };
  supplierIds: string[];
  sections: Array<{
    sectionNumber: number;
    title: string;
    content: string;
  }>;
}

export function listSdsDocuments(): Promise<SdsDocument[]> {
  return apiGet<SdsDocument[]>('/api/sds-documents');
}

export function getSdsDocument(id: string): Promise<SdsDocument> {
  return apiGet<SdsDocument>(`/api/sds-documents/${id}`);
}

export function createSdsDocument(payload: SaveSdsDocumentRequest): Promise<SdsDocument> {
  return apiPost<SdsDocument>('/api/sds-documents', payload);
}

export function updateSdsDocument(id: string, payload: SaveSdsDocumentRequest): Promise<SdsDocument> {
  return apiPut<SdsDocument>(`/api/sds-documents/${id}`, payload);
}
