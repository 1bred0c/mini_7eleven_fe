import React from "react";
import { Chip } from "@mui/material";
import {
  getStatusColor,
  getPaymentStatusColor,
  getTransactionTypeColor,
} from "../utils/format";

const StatusChip = ({ status, type = "status", size = "small" }) => {
  let color = "default";
  if (type === "status") {
    color = getStatusColor(status);
  } else if (type === "payment") {
    color = getPaymentStatusColor(status);
  } else if (type === "transaction") {
    color = getTransactionTypeColor(status);
  }

  // Formatting label to be readable, e.g., OUT_OF_STOCK -> Out Of Stock
  const label = status
    ? status
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : "";

  return (
    <Chip
      label={label}
      color={color}
      size={size}
      variant="filled"
      sx={{
        fontWeight: 600,
        borderRadius: "6px",
      }}
    />
  );
};

export default StatusChip;
