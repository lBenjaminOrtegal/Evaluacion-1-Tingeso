export interface Discount {
  combinableDiscounts: boolean;
  maxDiscountLimit: number;
  minPassengers: number;
  discountPassengers: number;
  minReservations: number;
  discountReservations: number;
  daysWindow: number;
  minReservationsMultiplePackages: number;
  discountMultiplePackages: number;
}
