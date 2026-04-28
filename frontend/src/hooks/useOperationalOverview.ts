import { useCallback, useEffect, useMemo, useState } from 'react';
import { listChemicalProducts } from '../api/chemicals';
import { listInventoryItems, type InventoryItem } from '../api/inventory';
import { listSdsDocuments, type SdsDocument } from '../api/sds';
import type { Alert, StatCard } from '../types';

type OverviewState = {
  alerts: Alert[];
  stats: StatCard[];
  isLoading: boolean;
  error: string;
  reload: () => Promise<void>;
};

const EXPIRING_SOON_DAYS = 30;

type SdsHealth = 'expired' | 'expiring_soon' | 'current' | 'unknown';

function toSdsHealth(expiryDate: string | null): SdsHealth {
  if (!expiryDate) {
    return 'unknown';
  }

  const parsed = new Date(expiryDate);
  if (Number.isNaN(parsed.getTime())) {
    return 'unknown';
  }

  const msUntilExpiry = parsed.getTime() - Date.now();
  const daysUntilExpiry = Math.ceil(msUntilExpiry / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) {
    return 'expired';
  }

  if (daysUntilExpiry <= EXPIRING_SOON_DAYS) {
    return 'expiring_soon';
  }

  return 'current';
}

function formatRelativeDayLabel(dateValue: string | null): string {
  if (!dateValue) {
    return 'Date missing';
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return dateValue;
  }

  const days = Math.ceil((parsed.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  if (days < 0) {
    const overdue = Math.abs(days);
    return overdue === 0 ? 'Expired today' : `${overdue} day${overdue === 1 ? '' : 's'} ago`;
  }

  if (days === 0) {
    return 'Expires today';
  }

  return `Expires in ${days} day${days === 1 ? '' : 's'}`;
}

function buildAlerts(sdsDocuments: SdsDocument[], inventoryItems: InventoryItem[]): Alert[] {
  const sdsAlerts: Alert[] = sdsDocuments.flatMap((document) => {
    const health = toSdsHealth(document.expiryDate);
    if (health === 'current' || health === 'unknown') {
      return [];
    }

    return [
      {
        id: `sds-${document.id}`,
        type: health === 'expired' ? 'critical' : 'warning',
        title:
          health === 'expired'
            ? `SDS expired — ${document.productName}`
            : `SDS expiring soon — ${document.productName}`,
        description:
          health === 'expired'
            ? 'Immediate review and renewal are required.'
            : 'Review the SDS and plan renewal before expiry.',
        time: formatRelativeDayLabel(document.expiryDate),
      },
    ];
  });

  const inventoryAlerts: Alert[] = inventoryItems
    .filter((item) => item.minStock && Number(item.quantity) <= Number(item.minStock))
    .map((item) => ({
      id: `inventory-${item.id}`,
      type: 'warning' as const,
      title: `Low stock — ${item.productName}`,
      description: `Location: ${item.locationName}. Quantity ${item.quantity} ${item.unit} is at or below minimum stock.`,
      time: 'Needs restock',
    }));

  return [...sdsAlerts, ...inventoryAlerts].sort((left, right) => {
    if (left.type !== right.type) {
      return left.type === 'critical' ? -1 : 1;
    }
    return left.title.localeCompare(right.title);
  });
}

function buildStats(sdsDocuments: SdsDocument[], inventoryItems: InventoryItem[], chemicalCount: number): StatCard[] {
  const activeSdsCount = sdsDocuments.filter((document) => toSdsHealth(document.expiryDate) !== 'expired').length;
  const expiredSdsCount = sdsDocuments.filter((document) => toSdsHealth(document.expiryDate) === 'expired').length;
  const expiringSoonSdsCount = sdsDocuments.filter((document) => toSdsHealth(document.expiryDate) === 'expiring_soon').length;
  const lowStockCount = inventoryItems.filter((item) => item.minStock && Number(item.quantity) <= Number(item.minStock)).length;
  const restrictedItems = inventoryItems.filter((item) => item.status === 'reserved').length;

  return [
    {
      id: 'chemicals',
      label: 'Total Chemicals',
      value: chemicalCount,
      change: `${inventoryItems.length} inventory item${inventoryItems.length === 1 ? '' : 's'} linked`,
    },
    {
      id: 'sds',
      label: 'Active SDSs',
      value: activeSdsCount,
      change: `${expiredSdsCount} expired • ${expiringSoonSdsCount} expiring soon`,
    },
    {
      id: 'inventory',
      label: 'Inventory Items',
      value: inventoryItems.length,
      change: `${lowStockCount} low stock • ${restrictedItems} reserved`,
    },
    {
      id: 'risk',
      label: 'Risk Workflow',
      value: 'Deferred',
      change: 'Next delivery slice: persisted risk + approval flow',
    },
  ];
}

export function useOperationalOverview(): OverviewState {
  const [sdsDocuments, setSdsDocuments] = useState<SdsDocument[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [chemicalCount, setChemicalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const [chemicals, sds, inventory] = await Promise.all([
        listChemicalProducts(),
        listSdsDocuments(),
        listInventoryItems(),
      ]);

      setChemicalCount(chemicals.length);
      setSdsDocuments(sds);
      setInventoryItems(inventory);
    } catch (err) {
      const nextError = err as Error;
      setError(nextError.message || 'Operational overview loading failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const alerts = useMemo(() => buildAlerts(sdsDocuments, inventoryItems), [inventoryItems, sdsDocuments]);
  const stats = useMemo(() => buildStats(sdsDocuments, inventoryItems, chemicalCount), [chemicalCount, inventoryItems, sdsDocuments]);

  return {
    alerts,
    stats,
    isLoading,
    error,
    reload,
  };
}
