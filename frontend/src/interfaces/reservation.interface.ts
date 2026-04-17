export interface Reservation {
  id: number;
  userEmail: string;
  tourPackageId: number;
  reservationState: string;
  passengersAmount: number;
  preferences: string[];
  specialRequests: string[];
  selectedDate: Date;
}
