import httpClient from "../http-common";
import type { Transaction } from "../interfaces/transaction.interface";

const getByReservationId = (id: number) => {
  return httpClient.get(`/api/transactions/${id}`);
};

const create = (data: Transaction) => {
  return httpClient.post("/api/transactions", data);
};

const successfulTransaction = () => {
  return httpClient.post("/api/transactions/payment");
};

export default {
  getByReservationId,
  create,
  successfulTransaction,
};
