export interface Transaction {
  id: number;
  amount: number;
  reservationId: number;
  date: string;
  paymentMethod: string;
  state: string;
}
