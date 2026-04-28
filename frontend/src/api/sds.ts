import { apiGet, apiPost, apiPut } from './apiClient';
import { API_BASE_URL } from './config';
import { getAuthToken, getTokenType } from '../auth/auth';
import { toApiError, toNetworkError } from './errors';

export type BackendSdsStatus = 'active' | 'pending_review' | 'archived';

export interface SdsSection {
  id: string;
  sectionNumber: number;
  title: string;
  content: string;
  createdAt: string;
}

export interface SdsFile {
  id: string;
  storageKey: string;
  filename: string;
  fileSizeBytes: number;
  extractedText: string | null;
  current: boolean;
  createdAt: string | null;
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
  files: SdsFile[];
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

export interface SdsExtractionResponse {
  documentId: string;
  fileId: string;
  filename: string;
  status: 'success' | 'partial' | 'unsupported' | 'failed';
  warnings: string[];
  draft: SaveSdsDocumentRequest;
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

function buildAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const tokenType = getTokenType();
  return token
    ? {
        Authorization: `${tokenType} ${token}`,
      }
    : {};
}

export async function uploadSdsFile(id: string, file: File): Promise<SdsFile> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/api/sds-documents/${id}/files`, {
      method: 'POST',
      headers: buildAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw await toApiError(response, 'SDS PDF upload failed');
    }

    return (await response.json()) as SdsFile;
  } catch (error) {
    throw toNetworkError(error, 'SDS PDF upload failed');
  }
}

export async function extractSdsFile(id: string, fileId: string): Promise<SdsExtractionResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/sds-documents/${id}/files/${fileId}/extract`, {
      method: 'POST',
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      throw await toApiError(response, 'SDS PDF extraction failed');
    }

    return (await response.json()) as SdsExtractionResponse;
  } catch (error) {
    throw toNetworkError(error, 'SDS PDF extraction failed');
  }
}

export async function openSdsFile(id: string, fileId: string, mode: 'preview' | 'download', filename?: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/sds-documents/${id}/files/${fileId}/${mode}`, {
      method: 'GET',
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      throw await toApiError(response, `SDS file ${mode} failed`);
    }

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    if (mode === 'preview') {
      window.open(objectUrl, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 60_000);
      return;
    }

    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename || fileId;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 60_000);
  } catch (error) {
    throw toNetworkError(error, `SDS file ${mode} failed`);
  }
}
