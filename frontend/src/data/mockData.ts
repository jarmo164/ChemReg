import { Alert, StatCard } from "../types";

export const stats: StatCard[] = [
    { id: "1", label: "Total Chemicals", value: 1247, change: "+12 this month" },
    { id: "2", label: "Active SDSs", value: 892, change: "2 expired • 3 expiring" },
    { id: "3", label: "Risk Assessments", value: 341, change: "4 pending • 1 overdue" },
    { id: "4", label: "Compliance Score", value: "87%", change: "+2% vs last quarter" },
];

export const alerts: Alert[] = [
    {
        id: "1",
        type: "critical",
        title: "SDS Expired – Sulfuric Acid 98%",
        description: "Immediate renewal required",
        time: "4 days ago",
    },
    {
        id: "2",
        type: "warning",
        title: "SDS Expiring Soon – HCl 37%",
        description: "Expires in 13 days",
        time: "Expires Apr 1",
    },
    {
        id: "3",
        type: "critical",
        title: "SDS Expired – Trichloroethylene",
        description: "Immediate renewal required",
        time: "17 days ago",
    },
    {
        id: "4",
        type: "warning",
        title: "Overdue Risk Assessment – Toluene",
        description: "Assessment overdue and needs review",
        time: "37 days overdue",
    },
];