const STATE_VARIANTS: Record<string, string> = {
  PENDING: "bg-warning",
  CONFIRMED: "bg-primary",
  CANCELED: "bg-danger",
  COMPLETED: "bg-success",
  IN_PROGRESS: "bg-info",
  NOT_AVAILABLE: "bg-secondary",
  AVAILABLE: "bg-success",
  SOLD_OUT: "bg-warning",
};

const CATEGORY_VARIANTS: Record<string, string> = {
  LOW_COST: "bg-success",
  STANDARD: "bg-primary",
  PREMIUM: "bg-dark",
};

export const getStateColor = (state: string): string =>
  STATE_VARIANTS[state] || "bg-light";

export const getCategoryColor = (category: string): string =>
  CATEGORY_VARIANTS[category] || "bg-light";
