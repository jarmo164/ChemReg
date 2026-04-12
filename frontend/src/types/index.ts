export type AlertType = "critical" | "warning";

export type Alert = {
    id: string;
    type: AlertType;
    title: string;
    description: string;
    time: string;
};

export type StatCard = {
    id: string;
    label: string;
    value: number | string;
    change?: string;
};

export type SdsStatus = "current" | "expiring_soon" | "expired";

export type SdsDocument = {
    id: string;
    productName: string;
    casNumber: string;
    revision: string;
    supplierName: string;
    expiryDate: string;
    status: SdsStatus;
};