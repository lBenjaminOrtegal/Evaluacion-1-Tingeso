import httpClient from "../http-common";
import type { TourPackage } from "../interfaces/tourPackage.interface";

const getAll = () => {
  return httpClient.get("/api/tour-packages");
};

const getById = (id: number) => {
  return httpClient.get(`/api/tour-packages/${id}`);
};

const getByCategory = (category: string) => {
  return httpClient.get(`/api/tour-packages/category/${category}`);
};

const getByDestiny = (destiny: string) => {
  return httpClient.get(`/api/tour-packages/destiny/${destiny}`);
};

const getBySeason = (season: string) => {
  return httpClient.get(`/api/tour-packages/season/${season}`);
};

const getByRemainingSpots = (remainingSpots: number) => {
  return httpClient.get(`/api/tour-packages/spots/${remainingSpots}`);
};

const getByAvailableSpots = () => {
  return httpClient.get("/api/tour-packages/spots/0");
};

const getByTypeOfTrips = (typeOfTrip: string) => {
  return httpClient.get(`/api/tour-packages/type-of-trip/${typeOfTrip}`);
};

const getByState = (state: string) => {
  return httpClient.get(`/api/tour-packages/state/${state}`);
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
  getByCategory,
  getByDestiny,
  getBySeason,
  getByRemainingSpots,
  getByAvailableSpots,
  getByTypeOfTrips,
  getByState,
  create,
  update,
  deleteById,
};
