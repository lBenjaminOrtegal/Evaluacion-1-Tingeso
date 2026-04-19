import httpClient from "../http-common";
import type { Reservation } from "../interfaces/reservation.interface";

const getAll = () => {
  return httpClient.get("/api/reservations");
};

const getById = (id: number) => {
  return httpClient.get(`/api/reservations/${id}`);
};

const getByEmail = (email: string) => {
  return httpClient.get(`/api/reservations/user-email/${email}`);
};

const getByTourPackageId = (id: number) => {
  return httpClient.get(`/api/reservations/tour-package-id/${id}`);
};

const getByReservationState = (state: string) => {
  return httpClient.get(`/api/reservations/state/${state}`);
};

const create = (data: Reservation) => {
  return httpClient.post("/api/reservations", data);
};

const calculateDiscounts = (data: Reservation) => {
  return httpClient.post("/api/reservations/calculate-discounts", data);
};

const update = (data: Reservation) => {
  return httpClient.put("/api/reservations", data);
};

const deleteById = (id: number) => {
  return httpClient.delete(`/api/reservations/${id}`);
};

export default {
  getAll,
  getById,
  getByEmail,
  getByTourPackageId,
  getByReservationState,
  create,
  calculateDiscounts,
  update,
  deleteById,
};
