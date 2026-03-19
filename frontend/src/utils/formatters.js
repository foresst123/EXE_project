const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const shortDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  hour: "2-digit",
  minute: "2-digit",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export const formatCurrency = (value) => currencyFormatter.format(Number(value || 0));

export const formatShortDate = (value) => {
  if (!value) {
    return "";
  }

  return shortDateFormatter.format(new Date(value));
};

export const formatDateTime = (value) => {
  if (!value) {
    return "";
  }

  return dateTimeFormatter.format(new Date(value));
};
