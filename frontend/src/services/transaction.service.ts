import httpClient from "../http-common";
import type { Transaction } from "../interfaces/transaction.interface";

const getAll = () => {
  return httpClient.get("/api/transactions");
};

const getById = (id: number) => {
  return httpClient.get(`/api/transactions/${id}`);
};

const getByReservationId = (id: number) => {
  return httpClient.get(`/api/transactions/reservation/${id}`);
};

const create = (data: Transaction) => {
  return httpClient.post("/api/transactions", data);
};

const successfulTransaction = () => {
  return httpClient.post("/api/transactions/payment");
};

export default {
  getAll,
  getById,
  getByReservationId,
  create,
  successfulTransaction,
};
