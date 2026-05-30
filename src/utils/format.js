export const formatCurrency = (value) => {
  if (value === undefined || value === null) return "0 ₫";
  
  // If the number is small (e.g., < 1000), it's likely USD, otherwise VND
  if (value < 1000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  }
  
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

export const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getStatusColor = (status) => {
  switch (status) {
    case "ACTIVE":
    case "COMPLETED":
    case "CONFIRMED":
      return "success";
    case "PENDING":
    case "PREPARING":
      return "warning";
    case "INACTIVE":
    case "OUT_OF_STOCK":
    case "CANCELLED":
      return "error";
    default:
      return "default";
  }
};

export const getPaymentStatusColor = (paymentStatus) => {
  switch (paymentStatus) {
    case "PAID":
      return "success";
    case "UNPAID":
      return "warning";
    case "FAILED":
      return "error";
    case "REFUNDED":
      return "info";
    default:
      return "default";
  }
};

export const getTransactionTypeColor = (type) => {
  switch (type) {
    case "TOP_UP":
    case "RECEIVE_PAYMENT":
    case "REFUND":
      return "success";
    case "PAYMENT":
      return "error";
    default:
      return "default";
  }
};
