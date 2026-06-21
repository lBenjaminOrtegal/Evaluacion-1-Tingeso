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

const SEASON_WORD: Record<string, string> = {
  FALL: "Otoño",
  SUMMER: "Verano",
  WINTER: "Invierno",
  SPRING: "Primavera",
};

const TOUR_PACKAGE_STATE_WORD: Record<string, string> = {
  AVAILABLE: "DISPONIBLE",
  SOLD_OUT: "VENDIDO",
  NOT_AVAILABLE: "NO DISPONIBLE",
  CANCELED: "CANCELADO",
};

const CATEGORY_WORD: Record<string, string> = {
  LOW_COST: "ECONÓMICO",
  STANDARD: "ESTÁNDAR",
  PREMIUM: "PREMIUM",
};

const TRIP_TYPE_WORD: Record<string, string> = {
  ADVENTURE: "Aventura",
  RELAXATION: "Relajación",
  CULTURAL: "Cultural",
  BUSINESS: "Negocios",
  FAMILY: "Familiar",
};

const RESERVATION_WORD: Record<string, string> = {
  PENDING: "PENDIENTE",
  CONFIRMED: "CONFIRMADO",
  CANCELED: "CANCELADO",
  COMPLETED: "COMPLETADO",
  IN_PROGRESS: "EN PROGRESO",
};

const TRANSACTION_STATE_WORD: Record<string, string> = {
  SUCCESS: "ÉXITOSA",
  FAILED: "FALLIDA",
};

const PAYMENT_METHOD_WORD: Record<string, string> = {
  CREDIT_CARD: "Tarjeta de crédito",
  DEBIT_CARD: "Tarjeta de débito",
};

export const getSeasonWord = (season: string): string =>
  SEASON_WORD[season] || season;

export const getTourPackageStateWord = (state: string): string =>
  TOUR_PACKAGE_STATE_WORD[state] || state;

export const getCategoryWord = (category: string): string =>
  CATEGORY_WORD[category] || category;

export const getTripTypeWord = (tripType: string): string =>
  TRIP_TYPE_WORD[tripType] || tripType;

export const getReservationStateWord = (state: string): string =>
  RESERVATION_WORD[state] || state;

export const getTransactionStateWord = (state: string): string =>
  TRANSACTION_STATE_WORD[state] || state;

export const getPaymentMethodWord = (method: string): string =>
  PAYMENT_METHOD_WORD[method] || method;

export const getStateColor = (state: string): string =>
  STATE_VARIANTS[state] || "bg-light";

export const getCategoryColor = (category: string): string =>
  CATEGORY_VARIANTS[category] || "bg-light";
