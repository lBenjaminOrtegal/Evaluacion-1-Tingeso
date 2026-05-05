import httpClient from "../http-common";
import type { TourPackage } from "../interfaces/tourPackage.interface";

const getAll = () => {
  return httpClient.get("/api/tour-packages");
};

const getById = (id: number) => {
  return httpClient.get(`/api/tour-packages/${id}`);
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
  state: string,
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
      state,
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
  getByCustomFilters,
  create,
  update,
  deleteById,
};
