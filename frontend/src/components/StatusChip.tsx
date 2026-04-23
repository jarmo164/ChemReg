import { Chip } from "@mui/material";

type StatusType = "current" | "expiring_soon" | "expired";

interface StatusChipProps {
  status: StatusType;
}

const styles: Record<StatusType, { bgcolor: string; color: string; label: string }> = {
  current: {
    bgcolor: "rgba(46, 164, 79, 0.1)",
    color: "#16a34a",
    label: "Current",
  },
  expiring_soon: {
    bgcolor: "rgba(245, 158, 11, 0.12)",
    color: "#b45309",
    label: "Expiring Soon",
  },
  expired: {
    bgcolor: "rgba(225, 29, 72, 0.1)",
    color: "#be123c",
    label: "Expired",
  },
};

export default function StatusChip({ status }: StatusChipProps) {
  const style = styles[status];

  return (
    <Chip
      size="small"
      label={style.label}
      sx={{
        bgcolor: style.bgcolor,
        color: style.color,
        border: "none",
        fontWeight: 600,
        fontSize: 12,
      }}
    />
  );
}
