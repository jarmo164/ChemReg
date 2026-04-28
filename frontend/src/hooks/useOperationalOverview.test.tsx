import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { MockedFunction } from 'jest-mock';
import { renderHook, waitFor } from '@testing-library/react';
import { useOperationalOverview } from './useOperationalOverview';
import { listChemicalProducts } from '../api/chemicals';
import { listInventoryItems } from '../api/inventory';
import { listSdsDocuments } from '../api/sds';

jest.mock('../api/chemicals');
jest.mock('../api/inventory');
jest.mock('../api/sds');

const mockedChemicals = listChemicalProducts as MockedFunction<typeof listChemicalProducts>;
const mockedInventory = listInventoryItems as MockedFunction<typeof listInventoryItems>;
const mockedSds = listSdsDocuments as MockedFunction<typeof listSdsDocuments>;

describe('useOperationalOverview', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('derives live stats and alerts from API data', async () => {
    mockedChemicals.mockResolvedValue([
      {
        id: 'chem-1',
        tenantId: 'tenant-1',
        sdsDocumentId: 'sds-expired',
        name: 'Sulfuric acid',
        casNumber: null,
        ecNumber: null,
        productCode: null,
        supplierName: 'Merck',
        signalWord: null,
        physicalState: null,
        defaultUnit: null,
        storageClass: null,
        useDescription: null,
        restricted: false,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 'chem-2',
        tenantId: 'tenant-1',
        sdsDocumentId: 'sds-current',
        name: 'Acetone',
        casNumber: null,
        ecNumber: null,
        productCode: null,
        supplierName: 'Sigma',
        signalWord: null,
        physicalState: null,
        defaultUnit: null,
        storageClass: null,
        useDescription: null,
        restricted: false,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ]);
    mockedSds.mockResolvedValue([
      {
        id: 'sds-expired',
        productName: 'Sulfuric acid',
        supplierNameRaw: 'Merck',
        language: 'en',
        countryFormat: 'EU',
        revisionDate: null,
        expiryDate: '2000-01-01',
        status: 'active',
        supplierIds: [],
        sections: [],
        files: [],
        tenantId: 'tenant-1',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 'sds-current',
        productName: 'Acetone',
        supplierNameRaw: 'Sigma',
        language: 'en',
        countryFormat: 'EU',
        revisionDate: null,
        expiryDate: '2099-01-01',
        status: 'active',
        supplierIds: [],
        sections: [],
        files: [],
        tenantId: 'tenant-1',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ]);
    mockedInventory.mockResolvedValue([
      {
        id: 'inv-1',
        tenantId: 'tenant-1',
        productId: 'chem-1',
        productName: 'Sulfuric acid',
        locationId: 'loc-1',
        locationName: 'Warehouse',
        quantity: '2',
        unit: 'L',
        containerType: null,
        barcode: null,
        qrCode: null,
        lotNumber: null,
        status: 'in_stock',
        openedAt: null,
        expiryDate: null,
        minStock: '5',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ]);

    const { result } = renderHook(() => useOperationalOverview());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('');
    expect(result.current.stats).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Total Chemicals', value: 2 }),
        expect.objectContaining({ label: 'Active SDSs', value: 1 }),
        expect.objectContaining({ label: 'Inventory Items', value: 1 }),
        expect.objectContaining({ label: 'Risk Workflow', value: 'Deferred' }),
      ])
    );
    expect(result.current.alerts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'critical', title: 'SDS expired — Sulfuric acid' }),
        expect.objectContaining({ type: 'warning', title: 'Low stock — Sulfuric acid' }),
      ])
    );
  });

  it('surfaces API errors cleanly', async () => {
    mockedChemicals.mockRejectedValue(new Error('ChemReg API-ga ei saadud ühendust.'));
    mockedSds.mockResolvedValue([]);
    mockedInventory.mockResolvedValue([]);

    const { result } = renderHook(() => useOperationalOverview());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe('ChemReg API-ga ei saadud ühendust.');
  });
});
