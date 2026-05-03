import httpClient from "../http-common";
import type { TourPackage } from "../interfaces/tourPackage.interface";

const getAll = () => {
  return httpClient.get("/api/tour-packages");
};

const getById = (id: number) => {
  return httpClient.get(`/api/tour-packages/${id}`);
};

const getByRemainingSpots = (remainingSpots: number) => {
  return httpClient.get(`/api/tour-packages/spots/${remainingSpots}`);
};

const getByAvailableSpots = () => {
  return httpClient.get("/api/tour-packages/spots/0");
};

const getByState = (state: string) => {
  return httpClient.get(`/api/tour-packages/state/${state}`);
};

const getByCustomFilters = (
  name: string,
  destiny: string,
  category: string,
  season: string,
  tripType: string,
  maxPrice: number,
  startDate: string,
  endDate: string,
  minSpots: number,
) => {
  return httpClient.get(`/api/tour-packages/filters`, {
    params: {
      name,
      destiny,
      category,
      season,
      tripType,
      maxPrice,
      startDate,
      endDate,
      minSpots,
    },
  });
};

const create = (data: TourPackage) => {
  return httpClient.post("/api/tour-packages", data);
};

const update = (data: TourPackage) => {
  return httpClient.put("/api/tour-packages", data);
};

const deleteById = (id: number) => {
  return httpClient.delete(`/api/tour-packages/${id}`);
};

export default {
  getAll,
  getById,
  getByRemainingSpots,
  getByAvailableSpots,
  getByState,
  getByCustomFilters,
  create,
  update,
  deleteById,
};
