import { Chip } from "@mui/material";

type SeverityType = "critical" | "warning";

interface SeverityChipProps {
  type: SeverityType;
  count?: number;
}

const styles = {
  critical: {
    bgcolor: "rgba(225, 29, 72, 0.1)",
    color: "#be123c",
  },
  warning: {
    bgcolor: "rgba(245, 158, 11, 0.12)",
    color: "#b45309",
  },
};

const labels = {
  critical: "CRITICAL",
  warning: "WARNING",
};

export default function SeverityChip({ type, count }: SeverityChipProps) {
  const label = count !== undefined ? `${count} ${labels[type]}` : labels[type];

  return (
    <Chip
      size="small"
      label={label}
      sx={{
        ...styles[type],
        border: "none",
        fontWeight: 700,
        letterSpacing: "0.04em",
        px: 0.5,
      }}
    />
  );
}