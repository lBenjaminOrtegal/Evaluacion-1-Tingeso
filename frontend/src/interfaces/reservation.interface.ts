export interface Reservation {
  id: number;
  userEmail: string;
  tourPackageId: number;
  tourPackageName: string;
  reservationState: string;
  passengersAmount: number;
  preferences: string[];
  specialRequests: string[];
  reservationDate: string;
  paymentDate: string;
  price: number;
}
