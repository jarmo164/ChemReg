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