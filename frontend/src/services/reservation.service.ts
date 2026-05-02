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

const getDateReports = (startDate: string, endDate: string) => {
  const start = `${startDate}T00:00:00`;
  const end = `${endDate}T23:59:59`;
  return httpClient.get(`/api/reservations/reports/date`, {
    params: { startDate: start, endDate: end },
  });
};

const getRanking = (
  startDate: string,
  endDate: string,
  order: number,
  type: string,
) => {
  const start = `${startDate}T00:00:00`;
  const end = `${endDate}T23:59:59`;
  return httpClient.get(`/api/reservations/reports/ranking`, {
    params: { startDate: start, endDate: end, order, type },
  });
};

const create = (data: Reservation) => {
  return httpClient.post("/api/reservations", data);
};

const calculatePrice = (data: Reservation) => {
  return httpClient.post("/api/reservations/calculate-price", data);
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
  getDateReports,
  getRanking,
  create,
  calculatePrice,
  update,
  deleteById,
};
